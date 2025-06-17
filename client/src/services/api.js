import axios from 'axios';

// Create an instance of axios with a base URL
const api = axios.create({
  baseURL: '/api', // The proxy will handle redirecting this to http://localhost:5000
});

// --- Home Authentication & Data ---
export const getHomesForLogin = () => api.get('/homes');
export const createNewHome = (homeData) => api.post('/homes', homeData);
export const loginToHome = (homeId, accessCode) => api.post('/homes/login', { homeId, accessCode });

// --- Item Management (Shopping & Tasks) ---
// listType can be 'shopping' or 'tasks'
export const addItem = (homeId, listType, itemData) => api.post(`/homes/${homeId}/${listType}`, itemData);
export const updateItem = (homeId, listType, itemId, updates) => api.put(`/homes/${homeId}/${listType}/${itemId}`, updates);
export const deleteItem = (homeId, listType, itemId) => api.delete(`/homes/${homeId}/${listType}/${itemId}`);

// --- Add other API functions as needed (for finance, users, etc.) ---
// Example for finance:
export const addBill = (homeId, billData) => api.post(`/homes/${homeId}/finance/bills`, billData);
export const addExpectedBill = (homeId, billData) => api.post(`/homes/${homeId}/finance/expected-bills`, billData);
export const payBill = (homeId, billId) => api.post(`/homes/${homeId}/finance/pay-bill/${billId}`);
export const addIncome = (homeId, incomeData) => api.post(`/homes/${homeId}/finance/income`, incomeData);
export const updateBudgets = (homeId, budgets) => api.put(`/homes/${homeId}/finance/budgets`, { budgets });
export const addSavingsGoal = (homeId, goalData) => api.post(`/homes/${homeId}/finance/savings-goals`, goalData);
export const addToSavingsGoal = (homeId, goalId, amountToAdd) => api.put(`/homes/${homeId}/finance/savings-goals/${goalId}`, { amountToAdd });



export default api;