import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import PixelGrid from './components/PixelGrid';
import AuthForm from './components/AuthForm';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Welcome to the Pixel Mosaic</h1>
        <Routes>
          <Route path="/" element={
            <>
              <AuthForm />
              <div className="mt-2">
                <Link to="/forgot-password" className="text-blue-500 hover:underline text-sm">
                  Forgot your password?
                </Link>
              </div>
              <PixelGrid />
            </>
          } />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
