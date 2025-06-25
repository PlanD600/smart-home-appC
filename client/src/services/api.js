import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });
const handleApiError = (error, defaultMessage = 'An unexpected error occurred.') => {
    console.error("API Error:", error.response || error.message || error);
    const customError = new Error(error.response?.data?.message || defaultMessage);
    customError.status = error.response?.status;
    throw customError;
};
export const getHomes = async () => { try { const response = await api.get('/homes'); return response.data; } catch (error) { handleApiError(error, 'Failed to fetch homes.'); } };
export const createHome = async (homeData) => { try { const response = await api.post('/home', homeData); return response.data; } catch (error) { handleApiError(error, 'Failed to create home.'); } };
export const loginToHome = async (homeName, accessCode) => { try { const response = await api.post('/home/login', { homeName, accessCode }); return response.data; } catch (error) { handleApiError(error, 'Failed to login. Please check the home name and access code.'); } };
export const getHomeDetails = async (homeId) => { try { const response = await api.get(`/home/${homeId}`); return response.data; } catch (error) { handleApiError(error, `Failed to fetch details for home ${homeId}.`); } };
export const updateHome = async (homeId, updates) => { try { const response = await api.put(`/home/${homeId}`, updates); return response.data; } catch (error) { handleApiError(error, 'Failed to update home.'); } };
export const addUser = async (homeId, userName) => { try { const response = await api.post(`/home/${homeId}/users`, { userName }); return response.data; } catch (error) { handleApiError(error, 'Failed to add user to home.'); } };
export const removeUser = async (homeId, userName) => { try { const response = await api.delete(`/home/${homeId}/users`, { data: { userName } }); return response.data; } catch (error) { handleApiError(error, 'Failed to remove user from home.'); } };
export const addItemToList = async (homeId, listType, itemData) => { try { const response = await api.post(`/home/${homeId}/lists/${listType}`, itemData); return response.data; } catch (error) { handleApiError(error, `Failed to add ${listType} item.`); } };
export const updateItemInList = async (homeId, listType, itemId, itemData) => { try { const response = await api.put(`/home/${homeId}/lists/${listType}/${itemId}`, itemData); return response.data; } catch (error) { handleApiError(error, `Failed to update ${listType} item.`); } };
export const groupItems = async (homeId, listType, draggedItemId, targetItemId, newFolderName) => { try { const response = await api.post(`/home/${homeId}/lists/${listType}/group`, { draggedItemId, targetItemId, newFolderName }); return response.data; } catch (error) { handleApiError(error, 'Failed to group items.'); } };
export const unGroupFolder = async (homeId, listType, folderId) => { try { const response = await api.post(`/home/${homeId}/lists/${listType}/ungroup-folder`, { folderId }); return response.data; } catch (error) { handleApiError(error, 'Failed to ungroup folder.'); } };
export const clearCompletedItems = async (homeId, listType) => { try { const response = await api.post(`/home/${homeId}/lists/${listType}/clear-completed`); return response.data; } catch (error) { handleApiError(error, `Failed to clear completed items from ${listType}.`); } };
export const archiveItem = async (homeId, listType, itemId) => { try { const response = await api.post(`/home/${homeId}/lists/${listType}/${itemId}/archive`); return response.data; } catch (error) { handleApiError(error, 'Failed to archive item.'); } };
export const restoreItem = async (homeId, itemId) => { try { const response = await api.post(`/home/${homeId}/archive/${itemId}/restore`); return response.data; } catch (error) { handleApiError(error, 'Failed to restore item.'); } };
export const deleteArchivedItem = async (homeId, itemId) => { try { const response = await api.delete(`/home/${homeId}/archive/${itemId}`); return response.data; } catch (error) { handleApiError(error, 'Failed to permanently delete item.'); } };
export const clearArchive = async (homeId) => { try { const response = await api.delete(`/home/${homeId}/archive`); return response.data; } catch (error) { handleApiError(error, 'Failed to clear archive.'); } };
export const addExpectedBill = async (homeId, billData) => { try { const response = await api.post(`/home/${homeId}/finances/bills`, billData); return response.data; } catch (error) { handleApiError(error, 'Failed to add bill.'); } };
export const updateExpectedBill = async (homeId, billId, billData) => { try { const response = await api.put(`/home/${homeId}/finances/bills/${billId}`, billData); return response.data; } catch (error) { handleApiError(error, 'Failed to update expected bill.'); } };

// --- התיקון כאן ---
export const deleteExpectedBill = async (homeId, billId) => {
    try {
        const response = await api.delete(`/home/${homeId}/finances/bills/${billId}`);
        return response.data; // הוספנו return
    } catch (error) {
        handleApiError(error, 'Error deleting expected bill.');
    }
};

// --- וגם כאן ---
export const payBill = async (homeId, billId) => {
    try {
        const response = await api.post(`/home/${homeId}/finances/bills/${billId}/pay`);
        return response.data; 
    } catch (error) {
        handleApiError(error, 'Error paying bill.');
    }
};

export const addIncome = async (homeId, incomeData) => { try { const response = await api.post(`/home/${homeId}/finances/income`, incomeData); return response.data; } catch (error) { handleApiError(error, 'Failed to add income.'); } };
export const addSavingsGoal = async (homeId, goalData) => { try { const response = await api.post(`/home/${homeId}/finances/savings-goals`, goalData); return response.data; } catch (error) { handleApiError(error, 'Failed to add savings goal.'); } };
export const addFundsToSavingsGoal = async (homeId, goalId, amount) => { try { const response = await api.patch(`/home/${homeId}/finances/savings-goals/${goalId}/add-funds`, { amount }); return response.data; } catch (error) { handleApiError(error, 'Failed to add funds to savings goal.'); } };
export const updateBudgets = async (homeId, budgetsData) => { try { const response = await api.put(`/home/${homeId}/finances/budgets`, budgetsData); return response.data; } catch (error) { throw handleApiError(error, 'Failed to update budgets.'); } };
export const getUserMonthlyFinanceSummary = async (homeId, year, month) => { try { const response = await api.get(`/home/${homeId}/finances/summary/${year}/${month}`); return response.data; } catch (error) { handleApiError(error, 'Failed to fetch user monthly finance summary.'); } };
export const saveTemplates = async (homeId, templates) => { try { const response = await api.put(`/home/${homeId}/templates`, { templates }); return response.data; } catch (error) { handleApiError(error, 'Failed to save templates.'); } };
export const transformRecipeToShoppingList = async (homeId, recipeText, currentUser) => { try { const response = await api.post(`/home/${homeId}/ai/transform-recipe`, { recipeText, currentUser }); return response.data; } catch (error) { handleApiError(error, 'Error transforming recipe'); } };
export const breakdownComplexTask = async (homeId, taskText, currentUser) => { try { const response = await api.post(`/home/${homeId}/ai/breakdown-task`, { taskText, currentUser }); return response.data; } catch (error) { handleApiError(error, 'Failed to breakdown task using Gemini.'); } };
export const deleteItemPermanently = async (homeId, listType, itemId) => { try { const response = await api.delete(`/home/${homeId}/lists/${listType}/${itemId}`); return response.data; } catch (error) { handleApiError(error, 'Failed to permanently delete item.'); } };
export const clearList = async (homeId, listType) => { try { const response = await api.delete(`/home/${homeId}/lists/${listType}`); return response.data; } catch (error) { handleApiError(error, `Failed to clear ${listType} list.`); } };
export const checkHomeName = async (name) => { try { const response = await api.get(`/home/check-name`, { params: { name } }); return response.data; } catch (error) { console.error("Failed to check home name:", error); return { exists: false }; } };

export default { getHomes, createHome, loginToHome, getHomeDetails, updateHome, addUser, removeUser, addItemToList, updateItemInList, groupItems, unGroupFolder, clearCompletedItems, archiveItem, restoreItem, deleteArchivedItem, clearArchive, addExpectedBill, updateExpectedBill, deleteExpectedBill, payBill, addIncome, addSavingsGoal, addFundsToSavingsGoal, updateBudgets, getUserMonthlyFinanceSummary, saveTemplates, transformRecipeToShoppingList, breakdownComplexTask, deleteItemPermanently, clearList, checkHomeName };