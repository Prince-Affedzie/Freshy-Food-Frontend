// src/services/orderApi.js
import { API } from './apiConfig';


export const createOrder = async (orderData) => {
  try {
    const response = await API.post('/api/order', orderData);
    return response;
  } catch (error) {
    throw error;
  }
};


export const getMyOrders = async (params = {}) => {
  try {
    const response = await API.get('/api/myorders', { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getOrderById = async (id) => {
  try {
    const response = await API.get(`/api/order/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};


export const cancelOrder = async (id, reason = '') => {
  try {
    const response = await API.put(`/api/order/${id}/cancel`, { reason });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getAllOrders = async (params = {}) => {
  try {
    const response = await API.get('/api/orders', { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const updateOrderToPaid = async (id, paymentData = {}) => {
  try {
    const response = await API.put(`/api/update-order/${id}/pay`, paymentData);
    return response;
  } catch (error) {
    throw error;
  }
};


export const updateOrderToDelivered = async (id, deliveryData = {}) => {
  try {
    const response = await API.put(`/api/${id}/deliver`, deliveryData);
    return response;
  } catch (error) {
    throw error;
  }
};


export const updateOrderStatus = async (id, status, notes = '') => {
  try {
    const response = await API.put(`/api/update-order/${id}/status`, { status, notes });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getOrderAnalytics = async (params = {}) => {
  try {
    const response = await API.get('/api/orders/analytics/overview', { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getTodayOrders = async (params = {}) => {
  try {
    const response = await API.get('/api/orders/today', { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getPendingOrders = async (params = {}) => {
  try {
    const response = await API.get('/api/orders/pending', { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getOrdersByStatus = async (status, params = {}) => {
  try {
    const response = await API.get(`/api/orders/status/${status}`, { params });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getRecentOrders = async (limit = 10) => {
  try {
    const response = await API.get('/api/orders/recent', { params: { limit } });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getOrderSummary = async (id) => {
  try {
    const response = await API.get(`/api/order/${id}/summary`);
    return response;
  } catch (error) {
    throw error;
  }
};


export const getOrderTimeline = async (id) => {
  try {
    const response = await API.get(`/api/order/${id}/timeline`);
    return response;
  } catch (error) {
    throw error;
  }
};


export const addOrderNote = async (id, note, isInternal = false) => {
  try {
    const response = await API.post(`/api/order/${id}/notes`, { note, isInternal });
    return response;
  } catch (error) {
    throw error;
  }
};


export const updateDeliveryDetails = async (id, deliveryDetails) => {
  try {
    const response = await API.put(`/api/order/${id}/delivery`, deliveryDetails);
    return response;
  } catch (error) {
    throw error;
  }
};


export const rescheduleOrder = async (id, newDeliveryDate, reason = '') => {
  try {
    const response = await API.put(`/api/order/${id}/reschedule`, { newDeliveryDate, reason });
    return response;
  } catch (error) {
    throw error;
  }
};


export const requestRefund = async (id, reason, items = []) => {
  try {
    const response = await API.post(`/api/order/${id}/refund`, { reason, items });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getOrderInvoice = async (id) => {
  try {
    const response = await API.get(`/api/order/${id}/invoice`, {
      responseType: 'blob' 
    });
    return response;
  } catch (error) {
    throw error;
  }
};


export const exportOrdersToCSV = async (params = {}) => {
  try {
    const response = await API.get('/api/orders/export/csv', { 
      params,
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    throw error;
  }
};


export const getOrderDashboardStats = async (period = 'month') => {
  try {
    const response = await API.get('/api/orders/stats/dashboard', { params: { period } });
    return response;
  } catch (error) {
    throw error;
  }
};


export const validateOrder = async (orderData) => {
  try {
    const response = await API.post('/api/order/validate', orderData);
    return response;
  } catch (error) {
    throw error;
  }
};


export const trackOrderDelivery = async (trackingNumber) => {
  try {
    const response = await API.get(`/api/order/track/${trackingNumber}`);
    return response;
  } catch (error) {
    throw error;
  }
};