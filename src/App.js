import MetaBalls from './MetaBalls';

function App() {
  return (
    <div className="App">
      <MetaBalls
        color="#ffffff"
        cursorBallColor="#ffffff"
        cursorBallSize={2}
        ballCount={15}
        animationSize={30}
        enableMouseInteraction={true}
        enableTransparency={true}
        hoverSmoothness={0.05}
        clumpFactor={1}
        speed={0.3}
      />
    </div>
  );
}

export default App;