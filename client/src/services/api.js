import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// --- Home Auth ---
export const getHomesForLogin = () => api.get('/homes');
export const createNewHome = (homeData) => api.post('/homes', homeData);
export const loginToHome = (homeId, accessCode) => api.post('/homes/login', { homeId, accessCode });

// --- Item Management ---
export const addItem = (homeId, listType, itemData) => api.post(`/homes/${homeId}/${listType}`, itemData);
export const updateItem = (homeId, listType, itemId, updates) => api.put(`/homes/${homeId}/${listType}/${itemId}`, updates);
export const deleteItem = (homeId, listType, itemId) => api.delete(`/homes/${homeId}/${listType}/${itemId}`);

// --- User Management ---
export const addUser = (homeId, name) => api.post(`/homes/${homeId}/users`, { name });
export const removeUser = (homeId, name) => api.delete(`/homes/${homeId}/users/${name}`);

// --- Finance API Calls ---
export const addExpectedBill = (homeId, billData) => api.post(`/homes/${homeId}/finance/expected-bills`, billData);
export const deleteExpectedBill = (homeId, billId) => api.delete(`/homes/${homeId}/finance/expected-bills/${billId}`);
export const updateExpectedBill = (homeId, billId, billData) => api.put(`/homes/${homeId}/finance/expected-bills/${billId}`, billData);
export const payBill = (homeId, billId) => api.post(`/homes/${homeId}/finance/pay-bill/${billId}`);
export const addIncome = (homeId, incomeData) => api.post(`/homes/${homeId}/finance/income`, incomeData);
export const addSavingsGoal = (homeId, goalData) => api.post(`/homes/${homeId}/finance/savings-goals`, goalData);
export const addToSavingsGoal = (homeId, goalId, amountToAdd) => api.put(`/homes/${homeId}/finance/savings-goals/${goalId}`, { amountToAdd });

// --- The missing function is here. We ensure it's defined and exported ---
export const updateBudgets = (homeId, budgets) => api.post(`/homes/${homeId}/finance/budgets`, { budgets });

export default api;