import React from 'react';
import Map, {DroneMap} from "./components/maps";
import { Container, Ratio } from "react-bootstrap"


function App() {
  return (
    <div className="App">
      <header className="header">
      </header>
      Hallo Welt
      <Container className="w-100 h-100" >
        <Ratio  aspectRatio="4x3">
          <DroneMap/>
        </Ratio>
      </Container>

    </div>
  );
}

export default App;
