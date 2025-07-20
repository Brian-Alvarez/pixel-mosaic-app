import React, { createContext, useContext, useState, useEffect } from 'react';

// Add userId to the context type
interface AuthContextType {
  email: string | null;
  userId: string | null;
  login: (token: string, email: string, userId: string) => void;
  logout: () => void;
}

// Set initial context
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
    const storedEmail = localStorage.getItem('email');
    const storedUserId = localStorage.getItem('userId');
    if (token && storedEmail && storedUserId) {
      setEmail(storedEmail);
      setUserId(storedUserId);
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

