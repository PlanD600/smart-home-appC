import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const HomeContext = createContext();

export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }) => {
  const [activeHome, setActiveHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homes, setHomes] = useState([]);
  const [activeTab, setActiveTab] = useState('shopping-list'); // התחל עם 'shopping-list' כדי להתאים ל-MainAppScreen


  const listTypeToStateKey = {
    shopping: 'shoppingList', 
    tasks: 'tasks',         
  };

  const fetchHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allHomes = await api.getHomes();
      setHomes(allHomes);
    } catch (err) {
      console.error("Failed to fetch homes:", err);
      setError(err.response?.data?.message || 'Failed to fetch available homes');
    } finally {
      setLoading(false);
    }
  }, []); // אין תלויות, כי לא משתמשים במשתנים חיצוניים שמשתנים

  useEffect(() => {
    const storedHomeId = localStorage.getItem('homeId');
    const attemptReLogin = async () => {
      if (storedHomeId) {
        setLoading(true);
        setError(null);
        try {
          const homeDetails = await api.getHomeDetails(storedHomeId);
          setActiveHome(homeDetails);
          localStorage.setItem('homeId', homeDetails._id);
          // אין צורך להגדיר activeTab כאן. הוא מוגדר בעת initializeHome
        } catch (err) {
          console.error("Failed to re-login automatically:", err);
          localStorage.removeItem('homeId');
          setActiveHome(null);
          setError(err.response?.data?.message || 'Failed to reconnect. Please log in again.');
          await fetchHomes();
        } finally {
          setLoading(false);
        }
      } else {
        fetchHomes();
      }
    };

    attemptReLogin();
  }, [fetchHomes]); // התלות ב-fetchHomes היא הכרחית ומויזת כראוי

  const initializeHome = useCallback(async (homeId, accessCode) => {
    setLoading(true);
    setError(null);
    try {
      const home = await api.loginToHome(homeId, accessCode); 
      setActiveHome(home);
      localStorage.setItem('homeId', home._id);
      setActiveTab('shopping-list'); // אתחל את הלשונית הפעילה לאחר כניסה מוצלחת
      return true;
    } catch (err) {
      console.error("Initialization error:", err);
      setError(err.response?.data?.message || 'Failed to connect to home');
      return false;
    } finally {
      setLoading(false);
    }
  }, []); // אין תלויות, מכיוון ש-homeId ו-accessCode מועברים כארגומנטים

  const createHome = useCallback(async (homeData) => {
    setLoading(true);
    setError(null);
    try {
      await api.createHome(homeData);
      await fetchHomes();
      setError(null);
      return true;
    } catch (err) {
      console.error("Failed to create home:", err);
      setError(err.response?.data?.message || 'Failed to create home');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchHomes]); 

  const logoutHome = useCallback(() => {
    setActiveHome(null);
    localStorage.removeItem('homeId');
    setHomes([]);
    fetchHomes();
    setActiveTab('shopping-list'); // אפס את הלשונית הפעילה ל-shopping-list לאחר יציאה
  }, [fetchHomes]); 

  const updateHome = useCallback(async () => {
    if (!activeHome?._id) return; // השתמש ב-activeHome?._id
    setLoading(true);
    try {
      const refreshedHome = await api.getHomeDetails(activeHome._id);
      setActiveHome(refreshedHome);
      setError(null);
    } catch (err) {
      console.error("Failed to update home:", err);
      setError(err.response?.data?.message || 'Failed to update home');
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  // --- Item specific actions (Shopping & Tasks) ---
  const saveItem = useCallback(async (listType, itemData) => {
    if (!activeHome?._id) return;
    const stateKey = listTypeToStateKey[listType];
    if (!stateKey) {
      console.error(`Invalid list type: ${listType}`);
      return;
    }
    setLoading(true);
    try {
      const newItem = await api.addItem(activeHome._id, listType, itemData);
      setActiveHome(prev => ({
        ...prev,
        [stateKey]: [...(prev[stateKey] || []), newItem] 
      }));
      setError(null);
    } catch (err) {
      console.error(`Failed to add ${listType} item:`, err);
      setError(err.response?.data?.message || `Failed to add ${listType} item`);
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  const modifyItem = useCallback(async (listType, itemId, itemData) => {
    if (!activeHome?._id) return;
    const stateKey = listTypeToStateKey[listType];
    if (!stateKey) {
      console.error(`Invalid list type: ${listType}`);
      return;
    }
    setLoading(true);
    try {
      const updatedItem = await api.updateItem(activeHome._id, listType, itemId, itemData);
      setActiveHome(prev => ({
        ...prev,
        [stateKey]: (prev[stateKey] || []).map(item => 
          item._id === itemId ? updatedItem : item
        )
      }));
      setError(null);
    } catch (err) {
      console.error(`Failed to update ${listType} item:`, err);
      setError(err.response?.data?.message || `Failed to update ${listType} item`);
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  const removeItem = useCallback(async (listType, itemId) => {
    if (!activeHome?._id) return;
    const stateKey = listTypeToStateKey[listType];
    if (!stateKey) {
      console.error(`Invalid list type: ${listType}`);
      return;
    }
    setLoading(true);
    try {
      await api.deleteItem(activeHome._id, listType, itemId);
      setActiveHome(prev => ({
        ...prev,
        [stateKey]: (prev[stateKey] || []).filter(item => item._id !== itemId) 
      }));
      setError(null);
    } catch (err) {
      console.error(`Failed to delete ${listType} item:`, err);
      setError(err.response?.data?.message || `Failed to delete ${listType} item`);
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  // --- Finance and User actions ---
  const saveBill = useCallback(async (billData) => {
    if (!activeHome?._id) return;
    setLoading(true);
    try {
      const newBill = await api.addExpectedBill(activeHome._id, billData);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          expectedBills: [...(prev.finances?.expectedBills || []), newBill]
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to add bill:", err);
      setError(err.response?.data?.message || 'Failed to add bill');
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  const modifyBill = useCallback(async (billId, billData) => {
    if (!activeHome?._id) return;
    setLoading(true);
    try {
      const updatedBill = await api.updateExpectedBill(activeHome._id, billId, billData);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          expectedBills: (prev.finances?.expectedBills || []).map(bill =>
            bill._id === billId ? updatedBill : bill
          )
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to update bill:", err);
      setError(err.response?.data?.message || 'Failed to update bill');
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  const deleteBill = useCallback(async (billId) => {
    if (!activeHome?._id) return;
    setLoading(true);
    try {
      await api.deleteExpectedBill(activeHome._id, billId);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          expectedBills: (prev.finances?.expectedBills || []).filter(bill => bill._id !== billId)
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to delete bill:", err);
      setError(err.response?.data?.message || 'Failed to delete bill');
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  const payExistingBill = useCallback(async (billId) => {
    if (!activeHome?._id) return;
    setLoading(true);
    try {
      const updatedFinances = await api.payBill(activeHome._id, billId);
      setActiveHome(prev => ({
        ...prev,
        finances: updatedFinances
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to pay bill:", err);
      setError(err.response?.data?.message || 'Failed to pay bill');
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  const saveIncome = useCallback(async (incomeData) => {
    if (!activeHome?._id) return;
    setLoading(true);
    try {
      const newIncome = await api.addIncome(activeHome._id, incomeData);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          income: [...(prev.finances?.income || []), newIncome]
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to add income:", err);
      setError(err.response?.data?.message || 'Failed to add income');
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  const saveSavingsGoal = useCallback(async (goalData) => {
    if (!activeHome?._id) return;
    setLoading(true);
    try {
      const newGoal = await api.addSavingsGoal(activeHome._id, goalData);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          savingsGoals: [...(prev.finances?.savingsGoals || []), newGoal]
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to add savings goal:", err);
      setError(err.response?.data?.message || 'Failed to add savings goal');
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  const addFundsToSavingsGoal = useCallback(async (goalId, amount) => {
    if (!activeHome?._id) return;
    setLoading(true);
    try {
      const updatedGoal = await api.addFundsToSavingsGoal(activeHome._id, goalId, amount); 
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          savingsGoals: (prev.finances?.savingsGoals || []).map(goal =>
            goal._id === goalId ? updatedGoal : goal
          )
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to add funds to savings goal:", err);
      setError(err.response?.data?.message || 'Failed to add funds to savings goal');
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית


  const saveBudgets = useCallback(async (budgetsData) => {
    if (!activeHome?._id) return;
    setLoading(true);
    try {
      const updatedCategories = await api.updateBudgets(activeHome._id, budgetsData);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          expenseCategories: updatedCategories
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to save budgets:", err);
      setError(err.response?.data?.message || 'Failed to save budgets');
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  // **תיקון קריטי: שינוי תלות מ-activeHome ל-activeHome?._id**
  const fetchUserMonthlyFinanceSummary = useCallback(async (year, month) => {
    if (!activeHome?._id) return null;
    setLoading(true);
    try {
      const summary = await api.getUserMonthlyFinanceSummary(activeHome._id, year, month);
      setError(null);
      return summary;
    } catch (err) {
      console.error("Failed to fetch user monthly finance summary:", err);
      setError(err.response?.data?.message || 'Failed to fetch user monthly finance summary');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // **תיקון כאן!**

  const addHomeUser = useCallback(async (userName) => {
    if (!activeHome?._id) return;
    setLoading(true);
    try {
      const response = await api.addUser(activeHome._id, userName); 
      setActiveHome(prev => ({
        ...prev,
        users: response // Assuming API returns the updated users array
      }));
      setError(null);
      return true;
    } catch (err) {
      console.error("Failed to add user:", err);
      setError(err.response?.data?.message || 'Failed to add user');
      return false;
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית

  const removeHomeUser = useCallback(async (userName) => {
    if (!activeHome?._id) return;
    setLoading(true);
    try {
      const response = await api.removeUser(activeHome._id, userName); 
      setActiveHome(prev => ({
        ...prev,
        users: response.users
      }));
      setError(null);
      return true;
    } catch (err) {
      console.error("Failed to remove user:", err);
      setError(err.response?.data?.message || 'Failed to remove user');
      return false;
    } finally {
      setLoading(false);
    }
  }, [activeHome?._id]); // תלוי רק ב-ID של הבית


  const changeActiveTab = useCallback((tabName) => {
    setActiveTab(tabName);
  }, []); // אין תלויות, כי setActiveTab הוא מ-useState

  const contextValue = {
    activeHome,
    loading,
    error,
    initializeHome,
    logoutHome,
    updateHome,
    saveItem,
    modifyItem,
    removeItem,
    saveBill,
    modifyBill,
    deleteBill,
    payExistingBill,
    saveIncome,
    saveSavingsGoal,
    addFundsToSavingsGoal, 
    saveBudgets,
    fetchUserMonthlyFinanceSummary, 
    addHomeUser,
    removeHomeUser,
    homes,
    createHome,
    activeTab,      
    changeActiveTab 
  };
  
  return (
    <HomeContext.Provider value={contextValue}>
      {children}
    </HomeContext.Provider>
  );
};