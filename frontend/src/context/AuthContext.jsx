import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axios.js';

// Configure Axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set auth header helper
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Check login status on load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('gym_token');
      const storedUser = localStorage.getItem('gym_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setAuthHeader(storedToken);
          
          // Verify token and fetch fresh profile from backend
          const { data } = await axios.get('/auth/profile');
          setUser(data);
          localStorage.setItem('gym_user', JSON.stringify(data));
        } catch (error) {
          console.error('Session validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('gym_token', data.token);
      localStorage.setItem('gym_user', JSON.stringify(data));
      setAuthHeader(data.token);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/register', userData);
      setUser(data);
      localStorage.setItem('gym_token', data.token);
      localStorage.setItem('gym_user', JSON.stringify(data));
      setAuthHeader(data.token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile handler
  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('/auth/profile', profileData);
      // Keep token from updated request if present, or existing token
      const token = data.token || localStorage.getItem('gym_token');
      setUser(data);
      localStorage.setItem('gym_user', JSON.stringify(data));
      if (data.token) {
        localStorage.setItem('gym_token', data.token);
        setAuthHeader(data.token);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed.'
      };
    }
  };

  // Refresh user data (after payments, etc.)
  const refreshUser = async () => {
    try {
      const { data } = await axios.get('/auth/profile');
      setUser(data);
      localStorage.setItem('gym_user', JSON.stringify(data));
    } catch (error) {
      console.error('Error refreshing user details:', error);
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
    setAuthHeader(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
