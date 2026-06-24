// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AuthService from '../services/authService';
import { 
  updateProfile, 
  deleteProfile, 
  logout, 
  loginByGoogle, 
  signUpByGoogle, 
  apple_signUp, 
  vendorLogin 
} from '../Apis/userApi';

const AuthContext = createContext();

// Web Storage Helper (replaces AsyncStorage)
const storage = {
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },
  
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} to storage:`, error);
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  },
  
  // For storing tokens that might need to be raw strings
  setRawItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key} to storage:`, error);
    }
  },
  
  getRawItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  }
};

// Storage keys
const STORAGE_KEYS = {
  TOKEN: '@cedimart_token',
  USER: '@cedimart_user',
  ROLE: '@cedimart_role',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check token expiration periodically
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkTokenExpiration = () => {
      const storedToken = storage.getRawItem(STORAGE_KEYS.TOKEN);
      if (storedToken) {
        try {
          // Decode JWT to check expiration
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          const expirationTime = payload.exp * 1000; // Convert to milliseconds
          
          if (Date.now() >= expirationTime) {
            // Token has expired, log out
            console.log('Token expired, logging out...');
            performLogout();
          }
        } catch (error) {
          console.error('Error checking token expiration:', error);
        }
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const storedToken = storage.getRawItem(STORAGE_KEYS.TOKEN);
      const storedUser = storage.getItem(STORAGE_KEYS.USER);
      const storedRole = storage.getItem(STORAGE_KEYS.ROLE);
      
      if (storedToken && storedUser) {
        // Verify token is still valid
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          const expirationTime = payload.exp * 1000;
          
          if (Date.now() < expirationTime) {
            setToken(storedToken);
            setUser(storedUser);
            setRole(storedRole);
            setIsAuthenticated(true);
            
            // Set default Authorization header for API calls
            AuthService.setAuthToken(storedToken);
          } else {
            // Token expired, clear storage
            performLogout();
          }
        } catch (error) {
          console.error('Invalid token format:', error);
          performLogout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const performLogout = useCallback(() => {
    storage.removeItem(STORAGE_KEYS.TOKEN);
    storage.removeItem(STORAGE_KEYS.USER);
    storage.removeItem(STORAGE_KEYS.ROLE);
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    AuthService.setAuthToken(null);
  }, []);

  // Apple Sign Up
  const signUpByApple = async (data) => {
    try {
      console.log('Apple sign up data:', data);
      const response = await apple_signUp(data);
      console.log('Apple sign up response:', response.data);
      
      if (response.status === 200 || response.success) {
        storage.setRawItem(STORAGE_KEYS.TOKEN, response.data.token);
        storage.setItem(STORAGE_KEYS.USER, response.data.user);
        storage.setItem(STORAGE_KEYS.ROLE, response.data.role);
        
        setToken(response.data.token);
        setUser(response.data.user);
        setRole(response.data.role);
        setIsAuthenticated(true);
        
        AuthService.setAuthToken(response.data.token);
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Apple sign up failed' };
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message ||
        'An error occurred during Apple sign up. Please try again later.';
      console.error('Apple sign up error:', error);
      return { success: false, error: errorMessage };
    }
  };

  // Google Login
  const google_login = async (data) => {
    try {
      const response = await loginByGoogle(data);
      
      if (response.status === 200) {
        console.log('Google login response:', response.data);
        
        storage.setRawItem(STORAGE_KEYS.TOKEN, response.data.token);
        storage.setItem(STORAGE_KEYS.USER, response.data.user);
        storage.setItem(STORAGE_KEYS.ROLE, response.data.role);
        
        setToken(response.data.token);
        setUser(response.data.user);
        setRole(response.data.role);
        setIsAuthenticated(true);
        
        AuthService.setAuthToken(response.data.token);
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Google login failed' };
      }
    } catch (err) {
      console.error('Google login error:', err);
      return {
        success: false,
        status: err.response?.status || (err.request ? 0 : 500),
        message:
          err.response?.data?.message ||
          (err.response?.status === 404
            ? 'User not found. Please check your email or sign up.'
            : err.response?.status === 401
            ? 'Invalid credentials. Please try again.'
            : err.request
            ? 'Network error. Please check your internet connection.'
            : 'An unexpected error occurred. Please try again.'),
      };
    }
  };

  // Google Sign Up
  const google_signUp = async (data) => {
    try {
      console.log('Google sign up data:', data);
      const response = await signUpByGoogle(data);
      console.log('Google sign up response:', response.data);
      
      if (response.status === 200) {
        storage.setRawItem(STORAGE_KEYS.TOKEN, response.data.token);
        storage.setItem(STORAGE_KEYS.USER, response.data.user);
        storage.setItem(STORAGE_KEYS.ROLE, response.data.role);
        
        setToken(response.data.token);
        setUser(response.data.user);
        setRole(response.data.role);
        setIsAuthenticated(true);
        
        AuthService.setAuthToken(response.data.token);
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Google sign up failed' };
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'An account with this email already exists. Please login instead.';
      console.error('Google sign up error:', error);
      return { success: false, error: errorMessage };
    }
  };

  // Regular Login
  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      console.log('Login response:', response.data);
      
      if (response.success) {
        storage.setRawItem(STORAGE_KEYS.TOKEN, response.data.token);
        storage.setItem(STORAGE_KEYS.USER, response.data.user);
        storage.setItem(STORAGE_KEYS.ROLE, response.data.role);
        
        setToken(response.data.token);
        setUser(response.data.user);
        setRole(response.data.role);
        setIsAuthenticated(true);
        
        AuthService.setAuthToken(response.data.token);
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        status: err.response?.status || (err.request ? 0 : 500),
        message:
          err.response?.data?.message ||
          (err.response?.status === 404
            ? 'User not found. Please check your email or sign up.'
            : err.response?.status === 401
            ? 'Invalid email or password. Please try again.'
            : err.request
            ? 'Network error. Please check your internet connection.'
            : 'An unexpected error occurred. Please try again.'),
      };
    }
  };

  // Vendor Login
  const vendor_login = async (credentials) => {
    try {
      const response = await vendorLogin(credentials);
      
      if (response.status === 200) {
        storage.setRawItem(STORAGE_KEYS.TOKEN, response.data.token);
        storage.setItem(STORAGE_KEYS.USER, response.data.user);
        storage.setItem(STORAGE_KEYS.ROLE, response.data.role);
        
        setToken(response.data.token);
        setUser(response.data.user);
        setRole(response.data.role);
        setIsAuthenticated(true);
        
        AuthService.setAuthToken(response.data.token);
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Vendor login failed' };
      }
    } catch (err) {
      console.error('Vendor login error:', err);
      return {
        success: false,
        status: err.response?.status || (err.request ? 0 : 500),
        message:
          err.response?.data?.message ||
          (err.response?.status === 404
            ? 'User not found. Please check your email or sign up.'
            : err.response?.status === 401
            ? 'Invalid email or password. Please try again.'
            : err.request
            ? 'Network error. Please check your internet connection.'
            : 'An unexpected error occurred. Please try again.'),
      };
    }
  };

  // Sign Up
  const signUp = async (userData) => {
    try {
      const response = await AuthService.signUp(userData);
      
      if (response.success) {
        storage.setRawItem(STORAGE_KEYS.TOKEN, response.token);
        storage.setItem(STORAGE_KEYS.USER, response.user);
        storage.setItem(STORAGE_KEYS.ROLE, response.data?.role);
        
        setToken(response.token);
        setUser(response.user);
        setRole(response.data?.role);
        setIsAuthenticated(true);
        
        AuthService.setAuthToken(response.token);
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Sign up failed' };
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'An account with this email already exists. Please login instead.';
      console.error('Sign up error:', error);
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logoutUser = async () => {
    try {
      const response = await logout();
      
      if (response.status === 200 || response.success) {
        performLogout();
        return { success: true };
      } else {
        // Still clear local storage even if API call fails
        performLogout();
        return { success: false, error: 'Logout failed on server, but logged out locally' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if API call fails
      performLogout();
      return { success: false, error: 'Network error during logout, but logged out locally' };
    }
  };

  // Update User
  const updateUser = async (updatedUser) => {
    try {
      storage.setItem(STORAGE_KEYS.USER, updatedUser);
      const res = await updateProfile(updatedUser);
      setUser(updatedUser);
      return res;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  // Delete Account
  const deleteAccount = async () => {
    try {
      const res = await deleteProfile();
      
      if (res?.status === 200 || res?.success) {
        performLogout();
      }
      
      return res;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.TOKEN || e.key === STORAGE_KEYS.USER) {
        // Auth state changed in another tab
        if (!e.newValue) {
          // Data was removed (logout)
          performLogout();
        } else if (e.key === STORAGE_KEYS.TOKEN) {
          // Token was updated, re-check auth
          checkAuthStatus();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus, performLogout]);

  // Context value
  const contextValue = {
    user,
    role,
    token,
    loading,
    isAuthenticated,
    login,
    vendor_login,
    signUp,
    google_signUp,
    google_login,
    signUpByApple,
    logoutUser,
    updateUser,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;