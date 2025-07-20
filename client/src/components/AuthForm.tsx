import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const { login } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const endpoint = isLogin ? '/api/login' : '/api/signup';

  try {
    const res = await axios.post(endpoint, { email, password });

    if (isLogin) {
      login(res.data.token, email);
      setMessage('Logged in successfully!');
      // ⏳ Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Account created! You can now log in.');
      setIsLogin(true);
      setTimeout(() => setMessage(''), 3000);
    }
  } catch (err: any) {
    console.error(err);
    setMessage(err.response?.data?.message || 'Something went wrong');
    setTimeout(() => setMessage(''), 3000);
  }
};


  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AuthForm;
