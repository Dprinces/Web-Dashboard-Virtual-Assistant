import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './auth.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    // Set base URL from environment variable
    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, logout]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      const { tokens, user: userData } = response.data;
      
      setToken(tokens.accessToken);
      setUser(userData);
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (firstName, lastName, username, email, password) => {
    try {
      const response = await axios.post('/auth/register', {
        firstName,
        lastName,
        username,
        email,
        password
      });
      
      const { tokens, user: userData } = response.data;
      
      setToken(tokens.accessToken);
      setUser(userData);
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
  }, [setUser, setToken]);

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Profile update failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return response.data;
    } catch (error) {
      console.error('Password change failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed'
      };
    }
  };

  const refreshToken = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('/auth/refresh', {
        refreshToken: storedRefreshToken
      });

      const { tokens } = response.data;
      setToken(tokens.accessToken);
      localStorage.setItem('token', tokens.accessToken);
      
      return tokens.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  }, [setToken, logout]);

  // Axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && token) {
          try {
            await refreshToken();
            // Retry the original request
            return axios.request(error.config);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token, refreshToken, logout]);

  const value = {
    user,
    loading,
    token,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};