// src/pages/LoginPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin, google_login, signUpByApple } = useAuth();
  
  const redirectPath = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const isLoading = loading || googleLoading || appleLoading;

  // Check for saved credentials
  useEffect(() => {
    const savedPhone = localStorage.getItem('@cedimart_remember_phone');
    if (savedPhone) {
      setFormData(prev => ({ ...prev, phone: savedPhone }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setLoadingMessage('Signing in...');

    try {
      const loginData = {
        phone: formData.phone.trim(),
        password: formData.password,
      };

      const response = await authLogin(loginData);

      if (response?.success) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('@cedimart_remember_phone', formData.phone.trim());
        } else {
          localStorage.removeItem('@cedimart_remember_phone');
        }

        // Show success message
        showToast('Welcome back! 🎉', 'success');
        
        // Navigate after short delay
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 500);
      } else {
        setErrors({
          general: response?.error || response?.message || 'Login failed. Please check your credentials.',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error?.response?.data?.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;

    setGoogleLoading(true);
    setLoadingMessage('Signing in with Google...');

    try {
      // Initialize Google Sign-In
      // Note: You need to set up Google OAuth on the backend and frontend
      // This is a placeholder - implement actual Google OAuth flow
      
      // For web, you'd typically use @react-oauth/google package
      // or redirect to Google OAuth endpoint
      
      // Example using window.location redirect:
      // window.location.href = `${API_URL}/auth/google?redirect=${encodeURIComponent(window.location.href)}`;
      
      // For now, showing how it would work with a token:
      // const response = await google_login({ token: googleToken });
      
      // Placeholder - you'll need to implement actual Google OAuth
      alert('Google Sign-In will be available soon! Please use phone number login.');
      
    } catch (error) {
      console.error('Google Login Error:', error);
      setErrors({
        general: error.message || 'Google sign-in failed. Please try again.',
      });
    } finally {
      setGoogleLoading(false);
      setLoadingMessage('');
    }
  };

  const handleAppleLogin = async () => {
    if (isLoading) return;

    setAppleLoading(true);
    setLoadingMessage('Signing in with Apple...');

    try {
      // Apple Sign-In for web
      // Note: You need to set up Apple Sign-In on the backend and frontend
      // This typically uses Apple's JS SDK or redirect flow
      
      // Placeholder - you'll need to implement actual Apple Sign-In
      alert('Apple Sign-In will be available soon! Please use phone number login.');
      
    } catch (error) {
      console.error('Apple Login Error:', error);
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        setErrors({
          general: error.message || 'Apple sign-in failed. Please try again.',
        });
      }
    } finally {
      setAppleLoading(false);
      setLoadingMessage('');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '', general: '' }));
    }
  };

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-sm font-semibold ${
            toast.type === 'success' ? 'bg-green-900 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            'bg-gray-900 text-white'
          }`}>
            {toast.type === 'success' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white/95 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center min-w-[200px]">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-base font-semibold text-gray-700 text-center">
              {loadingMessage || 'Please wait...'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-green-50 mb-4">
              <span className="text-2xl sm:text-3xl">🛒</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-green-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Sign in to continue your convenient shopping experience
            </p>
          </div>

          {/* Vendor Login Link */}
          <Link
            to="/vendor-login"
            className="flex items-center justify-center gap-2 w-full bg-yellow-50 border border-yellow-200 rounded-xl py-3 px-4 mb-6 hover:bg-yellow-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-yellow-800">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="text-sm sm:text-base text-yellow-900 font-medium">
              Are you a vendor? <span className="font-bold text-green-800 underline">Login here</span>
            </span>
          </Link>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-3 px-4 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base text-gray-700 font-medium">Connecting...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm sm:text-base text-gray-700 font-medium">
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            {/* Apple Button */}
            <button
              onClick={handleAppleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-black border border-black rounded-xl py-3 px-4 hover:bg-gray-900 transition-colors disabled:bg-gray-700 disabled:border-gray-700 disabled:cursor-not-allowed"
            >
              {appleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base text-white font-medium">Connecting...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="text-white">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-sm sm:text-base text-white font-medium">
                    Continue with Apple
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number
              </label>
              <div className={`flex items-center gap-3 bg-gray-50 rounded-xl border px-4 transition-colors ${
                errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-green-400 focus-within:bg-white'
              }`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400 flex-shrink-0">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/[^0-9\s]/g, ''))}
                  maxLength={15}
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-transparent text-base text-gray-800 placeholder-gray-400 outline-none"
                  autoCapitalize="none"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-green-600 hover:text-green-700"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className={`flex items-center gap-3 bg-gray-50 rounded-xl border px-4 transition-colors ${
                errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-green-400 focus-within:bg-white'
              }`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400 flex-shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-transparent text-base text-gray-800 placeholder-gray-400 outline-none"
                  autoCapitalize="none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-600 select-none">
                Remember me
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-3.5 font-bold text-base hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-600/25"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-sm sm:text-base text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-green-600 hover:text-green-700"
            >
              Sign Up
            </Link>
          </p>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;