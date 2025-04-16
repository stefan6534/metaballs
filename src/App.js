import React from 'react';
import MetaBalls from './MetaBalls';

function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <MetaBalls
        color="#f4941d"
        cursorBallColor="#f4941d"
        cursorBallSize={1}
        ballCount={30}
        animationSize={30}
        enableMouseInteraction={true}
        enableTransparency={true}
        hoverSmoothness={0.15}
        clumpFactor={1}
        speed={0.3}
      />
    </div>
  );
}

export default App;