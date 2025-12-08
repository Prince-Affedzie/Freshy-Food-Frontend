// src/services/productApi.js
import { API } from './apiConfig';




export const getAllProducts = async (params = {}) => {
  try {
    const response = await API.get('/api/products', { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getProductsByCategory = async (category, params = {}) => {
  try {
    const response = await API.get(`/api/products/category/${category}`, { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const searchProducts = async (query, params = {}) => {
  try {
    const response = await API.get(`/api/products/search/${query}`, { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getSeasonalProducts = async (params = {}) => {
  try {
    const response = await API.get('/api/products/seasonal/current', { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getProductById = async (identifier) => {
  try {
    const response = await API.get(`/api/product/${identifier}`);
    return response;
  } catch (error) {
    throw error;
  }
};


export const createProduct = async (formData) => {
  try {
    const response = await API.post('/api/product-add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// api.js
export const updateProduct = async (id, formData) => {
  try {
    const response = await API.put(`/api/product-update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const deleteProduct = async (id) => {
  try {
    const response = await API.delete(`/api/product-delete/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};


export const updateProductStock = async (id, stockChange) => {
  try {
    const response = await API.patch(`/api/product/${id}/stock`, { stockChange });
    return response;
  } catch (error) {
    throw error;
  }
};


export const bulkUpdateAvailability = async (productUpdates) => {
  try {
    const response = await API.patch('/api/products/bulk/availability', { productUpdates });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getProductStats = async (params = {}) => {
  try {
    const response = await API.get('/api/products/stats/overview', { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getFeaturedProducts = async (params = {}) => {
  try {
    const response = await API.get('/api/products/featured', { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getProductsByFarmer = async (farmerId, params = {}) => {
  try {
    const response = await API.get(`/api/products/farmer/${farmerId}`, { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getRelatedProducts = async (productId, params = {}) => {
  try {
    const response = await API.get(`/api/products/${productId}/related`, { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getLowStockProducts = async (params = {}) => {
  try {
    const response = await API.get('/api/products/low-stock', { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getProductCategories = async () => {
  try {
    const response = await API.get('/api/products/categories');
    return response;
  } catch (error) {
    throw error;
  }
};


export const updateProductPrice = async (id, newPrice) => {
  try {
    const response = await API.patch(`/api/product/${id}/price`, { newPrice });
    return response;
  } catch (error) {
    throw error;
  }
};


export const uploadProductImage = async (productId, formData) => {
  try {
    const response = await API.post(`/api/product/${productId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getProductPriceHistory = async (productId) => {
  try {
    const response = await API.get(`/api/product/${productId}/price-history`);
    return response;
  } catch (error) {
    throw error;
  }
};


export const exportProductsToCSV = async (params = {}) => {
  try {
    const response = await API.get('/api/products/export/csv', { 
      params,
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    throw error;
  }
};


export const importProductsFromCSV = async (formData) => {
  try {
    const response = await API.post('/api/products/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};