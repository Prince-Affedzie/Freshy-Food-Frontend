// src/services/packageApi.js
import { API } from './apiConfig';


 export const getAllPackages =async (params = {}) => {
    try {
      const response = await API.get('/api/packages', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get packages by category
 export const getPackagesByCategory = async (category, params = {}) => {
    try {
      const response = await API.get(`/api/packages/category/${category}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get single package by ID
 export const getPackageById =  async (id) => {
    try {
      const response = await API.get(`/api/package/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get swap options for a specific item in a package
 export const getSwapOptionsForItem = async (packageId, productId, params = {}) => {
    try {
      const response = await API.get(`/api/packages/${packageId}/swaps/${productId}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Validate customization before checkout
  export const validateCustomization = async (packageId, customizationData) => {
    try {
      const response = await API.post(`/api/packages/${packageId}/validate-customization`, customizationData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // === ADMIN ROUTES ===
  
  // Create new package (Admin only)
 export const createPackage =async (formData) => {
    try {
      const response = await API.post('/api/package', formData,
        {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update existing package (Admin only)
 // api.js
export const updatePackage = async (id, formData) => {
  try {
    const response = await API.put(`/api/update-package/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

  // Delete package (Admin only)
 export const deletePackage =async (id) => {
    try {
      const response = await API.delete(`/api/delete-package/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Toggle package status (active/inactive) (Admin only)
 export const togglePackageStatus = async (id) => {
    try {
      const response = await API.patch(`/api/package/${id}/toggle-status`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get package analytics (Admin only)
 export const getPackageAnalytics = async (params = {}) => {
    try {
      const response = await API.get('/api/packages/analytics/overview', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get package statistics (custom endpoint suggestion)
 export const getPackageStats = async (params = {}) => {
    try {
      const response = await API.get('/packages/stats', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Search packages (custom endpoint suggestion)
 export const searchPackages =async (query, params = {}) => {
    try {
      const response = await API.get('/api/packages/search', {
        params: { q: query, ...params }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get featured packages (custom endpoint suggestion)
export const  getFeaturedPackages = async (params = {}) => {
    try {
      const response = await API.get('/api/packages/featured', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get recommended packages (custom endpoint suggestion)
 export const getRecommendedPackages= async (userId, params = {}) => {
    try {
      const response = await API.get(`/api/packages/recommended/${userId || 'guest'}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
