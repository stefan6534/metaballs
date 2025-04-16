import React from "react";
import Orb from "./Orb"; // This is your Orb component

function App() {
  return (
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
      <Orb
        hoverIntensity={0.5}
        rotateOnHover={true}
        hue={0}
        forceHoverState={false}
      />
    </div>
  );
}

export default App;
