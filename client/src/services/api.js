// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/services/api.js
import axios from 'axios';
const API_URL = 'http://localhost:3001/api/homes';

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

// --- Homes ---
export const apiCreateHome = (homeData) => api.post('/', homeData);
export const apiLoginHome = (credentials) => api.post('/login', credentials); // credentials will be { name, accessCode }
export const apiGetHomeById = (id) => api.get(`/${id}`);

// --- Shopping Items ---
export const apiAddShoppingItem = (homeId, itemData) => api.post(`/${homeId}/shopping-list`, itemData);
export const apiUpdateShoppingItem = (homeId, itemId, updates) => api.put(`/${homeId}/shopping-list/${itemId}`, updates);
export const apiDeleteShoppingItem = (homeId, itemId) => api.delete(`/${homeId}/shopping-list/${itemId}`); // <-- THE FIX IS HERE

// --- Tasks ---
export const apiAddTask = (homeId, taskData) => api.post(`/${homeId}/tasks`, taskData);
export const apiUpdateTask = (homeId, taskId, updates) => api.put(`/${homeId}/tasks/${taskId}`, updates);
export const apiDeleteTask = (homeId, taskId) => api.delete(`/${homeId}/tasks/${taskId}`);

// --- Finance ---
export const apiUpdateFinances = (homeId, financeData) => api.put(`/${homeId}/finances`, financeData);

// --- Sub-Items ---
export const apiAddSubItem = (homeId, parentItemId, subItemData) => api.post(`/${homeId}/shopping-list/${parentItemId}/sub-items`, subItemData);
export const apiUpdateSubItem = (homeId, parentItemId, subItemId, updates) => api.put(`/${homeId}/shopping-list/${parentItemId}/sub-items/${subItemId}`, updates);
export const apiDeleteSubItem = (homeId, parentItemId, subItemId) => api.delete(`/${homeId}/shopping-list/${parentItemId}/sub-items/${subItemId}`);

export default api;