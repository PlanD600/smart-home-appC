// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/services/api.js
import axios from 'axios';

// חשוב מאוד: עדכן את כתובת ה-URL הבסיסית לכתובת השרת שלך
const API_URL = 'http://localhost:3001/api/homes';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Home ---
export const apiGetHomes = () => api.get('/');
export const apiGetHomeById = (id) => api.get(`/${id}`);
export const apiCreateHome = (data) => api.post('/', data);
export const apiUpdateHome = (id, data) => api.put(`/${id}`, data);
export const apiDeleteHome = (id) => api.delete(`/${id}`);

// --- Shopping Items ---
export const apiAddShoppingItem = (homeId, itemData) => api.post(`/${homeId}/shopping-list`, itemData);
export const apiUpdateShoppingItem = (homeId, itemId, updates) => api.put(`/${homeId}/shopping-list/${itemId}`, updates);
// (Delete will be handled by updating the whole home object for simplicity for now)

// --- Tasks ---
export const apiAddTask = (homeId, taskData) => api.post(`/${homeId}/tasks`, taskData);
export const apiUpdateTask = (homeId, taskId, updates) => api.put(`/${homeId}/tasks/${taskId}`, updates);

// --- Sub-Items ---
export const apiAddSubItem = (homeId, parentItemId, subItemData) => api.post(`/${homeId}/shopping-list/${parentItemId}/sub-items`, subItemData);
export const apiUpdateSubItem = (homeId, parentItemId, subItemId, updates) => api.put(`/${homeId}/shopping-list/${parentItemId}/sub-items/${subItemId}`, updates);
export const apiDeleteSubItem = (homeId, parentItemId, subItemId) => api.delete(`/${homeId}/shopping-list/${parentItemId}/sub-items/${subItemId}`);

// --- Finance ---
// For finance, we'll often update the whole finance sub-document
export const apiUpdateFinance = (homeId, financeData) => api.put(`/${homeId}/finance`, financeData);

// Export the instance if you need to use it directly elsewhere
export default api;