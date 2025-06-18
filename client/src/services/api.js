import axios from 'axios';

// The base URL for your backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleApiError = (error, defaultMessage = 'An unexpected error occurred.') => {
  console.error("API Error:", error.response || error.message || error);
  throw new Error(error.response?.data?.message || defaultMessage);
};

// Home related APIs
export const getHomes = async () => {
  try {
    const response = await api.get('/home');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch homes.');
  }
};

export const createHome = async (homeData) => {
  try {
    const response = await api.post('/home', homeData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to create home.');
  }
};

export const loginHome = async (homeId, accessCode) => {
  try {
    const response = await api.post(`/home/login`, { homeId, accessCode });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to login to home. Check ID and access code.');
  }
};

// NEW: Get full home details by ID
export const getHomeDetails = async (homeId) => {
  try {
    const response = await api.get(`/home/${homeId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to fetch details for home ${homeId}.`);
  }
};


// Item (Shopping & Tasks) related APIs
export const addItem = async (homeId, listType, itemData) => {
  try {
    const response = await api.post(`/home/${homeId}/${listType}`, itemData);
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to add ${listType} item.`);
  }
};

export const updateItem = async (homeId, listType, itemId, itemData) => {
  try {
    const response = await api.put(`/home/${homeId}/${listType}/${itemId}`, itemData);
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to update ${listType} item.`);
  }
};

export const deleteItem = async (homeId, listType, itemId) => {
  try {
    await api.delete(`/home/${homeId}/${listType}/${itemId}`);
  } catch (error) {
    handleApiError(error, `Failed to delete ${listType} item.`);
  }
};

// Finance related APIs
export const addExpectedBill = async (homeId, billData) => {
  try {
    const response = await api.post(`/home/${homeId}/finance/bills/expected`, billData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add expected bill.');
  }
};

export const updateExpectedBill = async (homeId, billId, billData) => {
  try {
    const response = await api.put(`/home/${homeId}/finance/bills/expected/${billId}`, billData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to update expected bill.');
  }
};

export const deleteExpectedBill = async (homeId, billId) => {
  try {
    await api.delete(`/home/${homeId}/finance/bills/expected/${billId}`);
  } catch (error) {
    handleApiError(error, 'Failed to delete expected bill.');
  }
};

export const payBill = async (homeId, billId) => {
  try {
    const response = await api.post(`/home/${homeId}/finance/bills/pay/${billId}`);
    return response.data; // Should return updated finances or confirmation
  } catch (error) {
    handleApiError(error, 'Failed to pay bill.');
  }
};

export const addIncome = async (homeId, incomeData) => {
  try {
    const response = await api.post(`/home/${homeId}/finance/income`, incomeData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add income.');
  }
};

export const addSavingsGoal = async (homeId, goalData) => {
  try {
    const response = await api.post(`/home/${homeId}/finance/savings-goals`, goalData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add savings goal.');
  }
};

export const addToSavingsGoal = async (homeId, goalId, amount) => {
  try {
    const response = await api.post(`/home/${homeId}/finance/savings-goals/${goalId}/add-funds`, { amount });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add funds to savings goal.');
  }
};

export const updateBudgets = async (homeId, budgetsData) => {
  try {
    const response = await api.put(`/home/${homeId}/finance/budgets`, { expenseCategories: budgetsData });
    return response.data; // Assuming it returns the updated categories
  } catch (error) {
    handleApiError(error, 'Failed to update budgets.');
  }
};

export const getUserMonthlyFinanceSummary = async (homeId, year, month) => {
  try {
    const response = await api.get(`/home/${homeId}/finance/summary/${year}/${month}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch user monthly finance summary.');
  }
};

// User management
export const addUser = async (homeId, userName) => {
  try {
    const response = await api.post(`/home/${homeId}/users`, { name: userName });
    return response.data; // Assuming this returns the updated users array or the new user
  } catch (error) {
    handleApiError(error, 'Failed to add user to home.');
  }
};

export const removeUser = async (homeId, userName) => {
  try {
    const response = await api.delete(`/home/${homeId}/users/${userName}`);
    return response.data; // Assuming this returns the updated users array
  } catch (error) {
    handleApiError(error, 'Failed to remove user from home.');
  }
};

// Gemini integration
export const transformRecipe = async (homeId, recipeText) => {
  try {
    const response = await api.post(`/home/${homeId}/gemini/recipe-to-shopping`, { recipeText });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to transform recipe using Gemini.');
  }
};

export const breakdownTask = async (homeId, taskText) => {
  try {
    const response = await api.post(`/home/${homeId}/gemini/breakdown-task`, { taskText });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to breakdown task using Gemini.');
  }
};