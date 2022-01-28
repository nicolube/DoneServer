import React from 'react';
import Map, { DroneMap } from "./components/maps";
import { Container, Ratio } from "react-bootstrap"
import { GitHubFiles } from './components/test';


function App() {
  return (
    <div className="App">
      <header className="header">
      </header>
      Hallo Welt
      <Container className="w-100 h-100" >
        <Ratio aspectRatio="4x3">
          <DroneMap />
        </Ratio>
        <GitHubFiles className="mx-auto" />
      </Container>
    </div>
  );
}

export default App;
