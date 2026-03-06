import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockLogin, mockRegister, mockFetchUser } from '../lib/mockApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      try {
        const userData = mockFetchUser(token);
        setUser(userData);
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = mockLogin(email, password);
      localStorage.setItem('token', response.access_token);
      setToken(response.access_token);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (email, password, full_name, role) => {
    try {
      const response = mockRegister(email, password, full_name, role);
      localStorage.setItem('token', response.access_token);
      setToken(response.access_token);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
