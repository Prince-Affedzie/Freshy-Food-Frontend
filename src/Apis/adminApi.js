import { API } from './apiConfig';

///admin/dashboard

export const fetchDashboardData = async () => {
  try {
    const response = await API.get('/api/admin/dashboard');
    return response;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (Data) => {
  try {
    const response = await API.post('/api/admin/users', Data);
    return response;
  } catch (error) {
    throw error;
  }
};


export const getAllUser = async () => {
  try {
    const response = await API.get('/api/admin/users');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAUser = async (id) => {
  try {
    const response = await API.get(`/api/admin/users/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};


export const updateAUser = async (id,data) => {
  try {
    const response = await API.put(`/api/admin/users/${id}`,data);
    return response;
  } catch (error) {
    throw error;
  }
};


export const deleteAUser = async (id) => {
  try {
    const response = await API.delete(`/api/admin/users/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};


export const toggleAdmin = async (id) => {
  try {
    const response = await API.patch(`/api/admin/users/${id}/toggle-admin`);
    return response;
  } catch (error) {
    throw error;
  }
};


// paymentAPIs
export const getPaymentsOverview = async () => {
  try {
    const response = await API.get(`/api/admin/payments/overview`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllPayments = async () => {
  try {
    const response = await API.get(`/api/admin/payments`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getSinglePayment = async (id) => {
  try {
    const response = await API.get(`/api/admin/payments/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updatePaymentStatus = async (id) => {
  try {
    const response = await API.put(`/api/admin/payments/${id}/status`);
    return response;
  } catch (error) {
    throw error;
  }
};

