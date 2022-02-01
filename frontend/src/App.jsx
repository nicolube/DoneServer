import React from 'react';
import Map, { DroneMap } from "./components/maps";
import { Container } from "react-bootstrap"
import { GitHubFiles } from './components/test';

import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Messages from './api/aleart';
import Header from './components/header';
import Login from './components/login';


function App() {
  return (
    <div className="App">

      <React.StrictMode>
        <BrowserRouter>
          <Header />
          <Container className="w-100 h-100" >
            <Messages />
            <div className="mt-3" />
            <Routes>
              <Route path="/" element={<Map />} />
              <Route path="/drones" element={<DroneMap />} />
              <Route path="/login" element={<Login />} />
              <Route path="/explorer" element={<GitHubFiles className="mt-2" />} />
            </Routes>
          </Container>

        </BrowserRouter>
      </React.StrictMode>
    </div>
  );
}

export default App;
