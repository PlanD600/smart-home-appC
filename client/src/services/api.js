import axios from 'axios';

const API_URL = '/api/home';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// General Home Operations
export const getHomes = async () => {
  const response = await api.get('/');
  return response.data;
};

export const createHome = async (homeData) => {
  const response = await api.post('/', homeData);
  return response.data;
};

export const loginHome = async (homeId, accessCode) => {
  const response = await api.post('/login', { homeId, accessCode });
  return response.data;
};

// Item Operations (Shopping & Tasks)
export const addItem = async (homeId, listType, itemData) => {
  const response = await api.post(`/${homeId}/${listType}`, itemData);
  return response.data;
};

export const updateItem = async (homeId, listType, itemId, itemData) => {
  const response = await api.put(`/${homeId}/${listType}/${itemId}`, itemData);
  return response.data;
};

export const deleteItem = async (homeId, listType, itemId) => {
  const response = await api.delete(`/${homeId}/${listType}/${itemId}`);
  return response.data;
};

// Finance Operations
export const addExpectedBill = async (homeId, billData) => {
  const response = await api.post(`/${homeId}/finance/expected-bills`, billData);
  return response.data;
};

export const updateExpectedBill = async (homeId, billId, billData) => {
  const response = await api.put(`/${homeId}/finance/expected-bills/${billId}`, billData);
  return response.data;
};

export const deleteExpectedBill = async (homeId, billId) => {
  const response = await api.delete(`/${homeId}/finance/expected-bills/${billId}`);
  return response.data;
};

export const payBill = async (homeId, billId) => {
  const response = await api.post(`/${homeId}/finance/pay-bill/${billId}`);
  return response.data;
};

export const addIncome = async (homeId, incomeData) => {
  const response = await api.post(`/${homeId}/finance/income`, incomeData);
  return response.data;
};

export const addSavingsGoal = async (homeId, goalData) => {
  const response = await api.post(`/${homeId}/finance/savings-goals`, goalData);
  return response.data;
};

export const addToSavingsGoal = async (homeId, goalId, amountToAdd) => {
  const response = await api.put(`/${homeId}/finance/savings-goals/${goalId}`, { amountToAdd });
  return response.data;
};

export const updateBudgets = async (homeId, budgetsData) => {
  const response = await api.put(`/${homeId}/finance/budgets`, budgetsData);
  return response.data;
};

export const getUserMonthlyFinanceSummary = async (homeId, year, month) => {
  const response = await api.get(`/${homeId}/finances/user-summary/${year}/${month}`);
  return response.data;
};


// User Management Operations (New)
export const addUser = async (homeId, userName) => {
  const response = await api.post(`/${homeId}/users`, { name: userName });
  return response.data; // Should return updated users array
};

export const removeUser = async (homeId, userName) => {
  const response = await api.delete(`/${homeId}/users/${userName}`);
  return response.data; // Should return updated users array and a message
};

export default api;