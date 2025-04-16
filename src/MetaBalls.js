// MetaBalls.js
import React, { useEffect, useRef } from 'react';
import './MetaBalls.css';

const vertex = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iMouse;
uniform vec3 iColor;
uniform vec3 iCursorColor;
uniform float iAnimationSize;
uniform int iBallCount;
uniform float iCursorBallSize;
uniform vec3 iMetaBalls[50];
uniform float iClumpFactor;
uniform bool enableTransparency;
out vec4 outColor;

float getMetaBallValue(vec2 c, float r, vec2 p) {
  vec2 d = p - c;
  float dist2 = dot(d, d);
  return (r * r) / dist2;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float scale = iAnimationSize / iResolution.y;
  vec2 coord = (fc - iResolution.xy * 0.5) * scale;
  vec2 mouseW = (iMouse.xy - iResolution.xy * 0.5) * scale;

  float m1 = 0.0;
  for (int i = 0; i < 50; i++) {
    if (i >= iBallCount) break;
    m1 += getMetaBallValue(iMetaBalls[i].xy, iMetaBalls[i].z, coord);
  }

  float m2 = getMetaBallValue(mouseW, iCursorBallSize, coord);
  float total = m1 + m2;

  float softness = 2.0;
  float smoothed = smoothstep(1.0 - softness * 0.1, 1.0 + softness * 0.1, total);

  vec3 cFinal = mix(iColor, iCursorColor, m2 / max(total, 0.0001));
  vec3 blurred = cFinal * smoothed;

  float alpha = enableTransparency ? smoothed : 1.0;
  outColor = vec4(blurred, alpha);
}
`;

const MetaBalls = ({
  color = '#ffffff',
  cursorBallColor = '#ffffff',
  cursorBallSize = 2,
  ballCount = 15,
  animationSize = 30,
  enableMouseInteraction = true,
  enableTransparency = true,
  hoverSmoothness = 0.05,
  clumpFactor = 1,
  speed = 0.3,
}) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const metaBalls = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const iResolution = gl.getUniformLocation(program, 'iResolution');
    const iTime = gl.getUniformLocation(program, 'iTime');
    const iMouse = gl.getUniformLocation(program, 'iMouse');
    const iColor = gl.getUniformLocation(program, 'iColor');
    const iCursorColor = gl.getUniformLocation(program, 'iCursorColor');
    const iAnimationSize = gl.getUniformLocation(program, 'iAnimationSize');
    const iBallCount = gl.getUniformLocation(program, 'iBallCount');
    const iCursorBallSize = gl.getUniformLocation(program, 'iCursorBallSize');
    const iMetaBalls = gl.getUniformLocation(program, 'iMetaBalls');
    const iClumpFactor = gl.getUniformLocation(program, 'iClumpFactor');
    const iEnableTransparency = gl.getUniformLocation(program, 'enableTransparency');

    const parseColor = (hex) => {
      const bigint = parseInt(hex.slice(1), 16);
      return [
        ((bigint >> 16) & 255) / 255,
        ((bigint >> 8) & 255) / 255,
        (bigint & 255) / 255,
      ];
    };

    const cColor = parseColor(color);
    const cCursorColor = parseColor(cursorBallColor);

    for (let i = 0; i < ballCount; i++) {
      metaBalls.current.push({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        r: Math.random() * 1.5 + 1.5,
        vx: (Math.random() - 0.5) * speed * 50,
        vy: (Math.random() - 0.5) * speed * 50,
      });
    }

    const loop = (time) => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform3f(iResolution, canvas.width, canvas.height, 1);
      gl.uniform1f(iTime, time * 0.001);
      gl.uniform3f(iMouse, mouse.current.x, mouse.current.y, 0);
      gl.uniform3f(iColor, ...cColor);
      gl.uniform3f(iCursorColor, ...cCursorColor);
      gl.uniform1f(iAnimationSize, animationSize);
      gl.uniform1i(iBallCount, ballCount);
      gl.uniform1f(iCursorBallSize, cursorBallSize);
      gl.uniform1f(iClumpFactor, clumpFactor);
      gl.uniform1i(iEnableTransparency, enableTransparency ? 1 : 0);

      metaBalls.current.forEach((ball) => {
        ball.x += ball.vx * 0.016;
        ball.y += ball.vy * 0.016;

        if (ball.x < -canvas.width / 2 || ball.x > canvas.width / 2) ball.vx *= -1;
        if (ball.y < -canvas.height / 2 || ball.y > canvas.height / 2) ball.vy *= -1;
      });

      const ballsData = new Float32Array(50 * 3);
      metaBalls.current.forEach((ball, i) => {
        ballsData[i * 3] = ball.x / (canvas.height / 2);
        ballsData[i * 3 + 1] = ball.y / (canvas.height / 2);
        ballsData[i * 3 + 2] = ball.r;
      });

      gl.uniform3fv(iMetaBalls, ballsData);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = rect.height - (e.clientY - rect.top);
    };

    if (enableMouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [
    color,
    cursorBallColor,
    cursorBallSize,
    ballCount,
    animationSize,
    enableMouseInteraction,
    enableTransparency,
    hoverSmoothness,
    clumpFactor,
    speed,
  ]);

  return <canvas ref={canvasRef} className="metaballs-container" />;
};

export default MetaBalls;