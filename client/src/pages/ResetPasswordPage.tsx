import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Invalid or missing token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      await axios.post('/api/reset-password', {
        token,
        newPassword,
      });
      setMessage('Password reset successful! You may now log in.');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border p-2 rounded text-black"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Reset Password
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <button
        onClick={() => navigate('/')}
        className="mt-6 w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
      >
        Back to Home
      </button>
    </div>
  );
};

export default ResetPasswordPage;
