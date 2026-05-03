import { API } from './apiConfig';

export const createVendor = async(formData)=>{
 try {
    const response = await API.post('/api/vendor', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }

}

export const updateVendor = async(formData,id)=>{
    try {
        const response = await API.put(`/api/vendor/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response;
      } catch (error) {
        throw error.response?.data || error;
      }

}

export const deleteVendor = async (id) => {
  try {
    const response = await API.delete(`/api/vendor/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllVendors = (params = {}) => API.get('/api/vendor', { params });
export const getVendorById = (id)=>API.get(`/api/vendor/${id}`)