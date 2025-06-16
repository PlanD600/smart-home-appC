import axios from 'axios';

const API_URL = '/api';

// Home management
export const fetchHomes = async () => {
  try {
    const response = await axios.get(`${API_URL}/homes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching homes:', error.response || error.message);
    throw error;
  }
};

export const addHome = async (homeData) => {
  const response = await axios.post(`${API_URL}/homes`, homeData);
  return response.data;
};

export const updateHome = async (id, homeData) => {
  const response = await axios.put(`${API_URL}/homes/${id}`, homeData);
  return response.data;
};

export const deleteHome = async (id) => {
  const response = await axios.delete(`${API_URL}/homes/${id}`);
  return response.data;
};

// Task management
export const addTask = async (homeId, taskData) => {
    const response = await axios.post(`${API_URL}/homes/${homeId}/tasks`, taskData);
    return response.data;
};

export const updateTask = async (homeId, taskId, taskData) => {
    const response = await axios.put(`${API_URL}/homes/${homeId}/tasks/${taskId}`, taskData);
    return response.data;
};

// Shopping list management
export const addShoppingItem = async (homeId, itemData) => {
    const response = await axios.post(`${API_URL}/homes/${homeId}/shopping-list`, itemData);
    return response.data;
};

export const updateShoppingItem = async (homeId, itemId, itemData) => {
    const response = await axios.put(`${API_URL}/homes/${homeId}/shopping-list/${itemId}`, itemData);
    return response.data;
};

// Sub-item management
export const addSubItem = async (homeId, itemId, subItemData) => {
    const response = await axios.post(`${API_URL}/homes/${homeId}/shopping-list/${itemId}/sub-items`, subItemData);
    return response.data;
};

export const updateSubItem = async (homeId, itemId, subItemId, subItemData) => {
    const response = await axios.put(`${API_URL}/homes/${homeId}/shopping-list/${itemId}/sub-items/${subItemId}`, subItemData);
    return response.data;
};

export const deleteSubItem = async (homeId, itemId, subItemId) => {
    const response = await axios.delete(`${API_URL}/homes/${homeId}/shopping-list/${itemId}/sub-items/${subItemId}`);
    return response.data;
};

// Finance management
export const updateFinance = async (homeId, financeData) => {
    const response = await axios.put(`${API_URL}/homes/${homeId}/finance`, financeData);
    return response.data;
};
