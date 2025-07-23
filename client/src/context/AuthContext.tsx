import React, { createContext, useContext, useState, useEffect } from 'react';

// Define what the AuthContext provides
interface AuthContextType {
  email: string | null;
  userId: string | null;
  login: (token: string, email: string, userId: string) => void;
  logout: () => void;
}

// Default values
const AuthContext = createContext<AuthContextType>({
  email: null,
  userId: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const validateToken = async () => {
      try {
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Invalid token');

        const data = await res.json();
        setEmail(data.email);
        setUserId(data.userId);
      } catch (err) {
        console.warn('Token invalid or expired. Logging out.');
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('userId');
        setEmail(null);
        setUserId(null);
      }
    };

    if (token) {
      validateToken();
    }
  }, []);

  const login = (token: string, email: string, userId: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.setItem('userId', userId);
    setEmail(email);
    setUserId(userId);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    setEmail(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ email, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
