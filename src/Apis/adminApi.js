import { API } from './apiConfig';


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