// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/forgot-password', { email });
      setMessage('Check your email for a password reset link.');
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Send Reset Link
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      <button
        onClick={() => navigate('/')}
        className="mt-6 w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
      >
        Back to Home
      </button>
    </div>
  );
};

export default ForgotPasswordPage;
