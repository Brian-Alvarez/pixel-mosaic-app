import React from 'react';
import './App.css';
import PixelGrid from './components/PixelGrid';
import AuthForm from './components/AuthForm';

function App() {
  return (
    <div className="App">
      <h1>Welcome to the Pixel Mosaic</h1>
      <AuthForm />
      <PixelGrid />
    </div>
  );
}

export default App;

