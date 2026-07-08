import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios.js';

// Configure Axios defaults
// axios.defaults.baseURL = 'http://localhost:5000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await axios.post('/auth/refresh');
        const { data } = await axios.get('/auth/profile');
        setUser(data);
        localStorage.setItem('gym_user', JSON.stringify(data));
      } catch (error) {
        setUser(null);
        localStorage.removeItem('gym_user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('gym_user', JSON.stringify(data));
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
      localStorage.setItem('gym_user', JSON.stringify(data));
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
      setUser(data);
      localStorage.setItem('gym_user', JSON.stringify(data));
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
  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('gym_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
