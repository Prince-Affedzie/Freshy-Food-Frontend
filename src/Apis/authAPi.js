import axios from 'axios';
import { API } from './apiConfig';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  // Admin Login
  login: async (credentials) => {
    try {
      const response = await API.post('/api/login', credentials);
      return {
        success: true,
        user: response.data.user,
        role: response.data.role,
        token: response.data.token,
        message: response.data.message
      };
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await API.post('/api/logout');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      throw error;
    }
  },

  // Verify Token/Get Current User
  getCurrentUser: async () => {
    try {
      const response = await API.get('/auth/me');
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('adminToken');
    return !!token;
  },

  // Check if user is admin
  isAdmin: () => {
    const userStr = localStorage.getItem('adminUser');
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user.role === 'admin';
    } catch (error) {
      return false;
    }
  }
};

// Export individual functions for convenience
export const login = authApi.login;
export const logout = authApi.logout;
export const getCurrentUser = authApi.getCurrentUser;
export const isAuthenticated = authApi.isAuthenticated;
export const isAdmin = authApi.isAdmin;

export default authApi;