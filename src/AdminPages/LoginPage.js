import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  Store,
  Shield,
  Loader2
} from 'lucide-react';
import { login } from '../Apis/authAPi'; // Assuming you have auth API functions

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error message
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Format phone number (remove non-digits)
      const phoneNumber = formData.phone.replace(/\D/g, '');
      
      // Call the login API from Apis folder
      const response = await login({ 
        phone: phoneNumber, 
        password: formData.password 
      });
      
      if (response.success) {
        // Check if user is admin
        if (response.user.role !== 'admin') {
          setErrorMessage('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }
        
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        
        // Store token in localStorage or context as needed
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        
        // Redirect to admin dashboard after short delay
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error messages from backend
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setErrorMessage('Phone and password are required');
            break;
          case 401:
            setErrorMessage('Invalid phone number or password');
            break;
          case 404:
            setErrorMessage('Account not found. Please check your phone number.');
            break;
          case 500:
            setErrorMessage('Server error. Please try again later.');
            break;
          default:
            setErrorMessage(error.response.data?.message || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        setErrorMessage('Network error. Please check your connection.');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Alert Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-fade-in">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <span className="text-red-800 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
          {/* Card Header */}
          <div className="mb-8 text-center">
            <h3 className="text-xl font-bold text-gray-900">Welcome Back</h3>
            <p className="text-gray-600 mt-1">Enter your credentials to continue</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Phone Number Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter your phone number"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
                    transition-colors duration-200
                    ${errors.phone ? 'border-red-300' : 'border-gray-300'}
                    ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                  `}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.phone}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-emerald-600 hover:text-emerald-500"
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter your password"
                  className={`
                    block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
                    transition-colors duration-200
                    ${errors.password ? 'border-red-300' : 'border-gray-300'}
                    ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                  `}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg
                  font-medium text-white bg-gradient-to-r from-emerald-600 to-green-600
                  hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                  transition-all duration-200 transform hover:-translate-y-0.5
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Sign In to Admin Panel
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Secure admin access only. Unauthorized access prohibited.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
              Contact support
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            © {new Date().getFullYear()} Your Store Name. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;