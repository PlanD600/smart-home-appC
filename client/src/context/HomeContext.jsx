import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { useModal } from './ModalContext';

const HomeContext = createContext();

export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }) => {
  const [activeHome, setActiveHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homes, setHomes] = useState([]); // מצב חדש: רשימת כל הבתים
  const { showModal, hideModal } = useModal();

  // פונקציה לטעינת כל הבתים הזמינים למסך ההתחברות
  const fetchHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allHomes = await api.getHomes(); // קורא ל-API כדי לקבל את כל הבתים
      setHomes(allHomes);
      console.log("Fetched homes:", allHomes); // לניפוי באגים
    } catch (err) {
      console.error("Failed to fetch homes:", err);
      setError(err.response?.data?.message || 'Failed to fetch available homes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load homeId from localStorage on initial render and try to re-login or fetch homes
  useEffect(() => {
    const storedHomeId = localStorage.getItem('homeId');
    const attemptReLogin = async () => {
      if (storedHomeId) {
        setLoading(true);
        setError(null);
        try {
          // Attempt to re-login - in a real app, you'd use a token or a more secure re-authentication
          // For now, we're assuming a simple re-login by homeId if possible without access code on frontend.
          // If the backend requires access code for ALL logins, even re-logins, this needs to be adjusted.
          // For now, let's try to get home details if homeId exists.
          const homeDetails = await api.getHomeDetails(storedHomeId); // Assuming an API to get home details by ID
          setActiveHome(homeDetails);
          localStorage.setItem('homeId', homeDetails._id);
          console.log("Re-logged in to home:", homeDetails); // לניפוי באגים
        } catch (err) {
          console.error("Failed to re-login automatically:", err);
          localStorage.removeItem('homeId'); // Clear invalid ID
          setActiveHome(null); // Ensure no active home
          setError(err.response?.data?.message || 'Failed to reconnect to home. Please log in again.');
          await fetchHomes(); // If re-login fails, fetch homes for new login
        } finally {
          setLoading(false);
        }
      } else {
        // Only fetch homes if no homeId is stored, or after a re-login attempt fails.
        fetchHomes();
      }
    };

    attemptReLogin();
  }, [fetchHomes]);


  // Function to initialize/login a home
  const initializeHome = useCallback(async (homeId, accessCode) => {
    setLoading(true);
    setError(null);
    try {
      const home = await api.loginHome(homeId, accessCode);
      setActiveHome(home);
      localStorage.setItem('homeId', home._id); // Store home ID
      hideModal(); // Hide any login modal
      console.log("Logged in to home:", home); // לניפוי באגים
      return true;
    } catch (err) {
      console.error("Initialization error:", err);
      setError(err.response?.data?.message || 'Failed to connect to home');
      return false;
    } finally {
      setLoading(false);
    }
  }, [hideModal]);

  // פונקציה ליצירת בית חדש (חדש בקונטקסט)
  const createHome = useCallback(async (homeData) => {
    setLoading(true);
    setError(null);
    try {
      const newHome = await api.createHome(homeData); // קורא ל-API ליצירת בית
      await fetchHomes(); // רענן את רשימת הבתים במסך הלוגין
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
    setHomes([]); // ננקה את רשימת הבתים כדי לטעון אותה מחדש בלוגין
    fetchHomes(); // נטען מחדש את רשימת הבתים למסך ההתחברות
  }, [fetchHomes]);

  // General update function for any home field - placeholder
  const updateHome = useCallback(async (updatedFields) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      // In a real app, you'd have a specific update API endpoint for general home details.
      // For now, if activeHome itself changes, we'd need to re-fetch it or re-set it.
      // Assuming updateHome is primarily for fields like `templates`, `users` etc. that are
      // handled by separate API calls or sub-updates.
      // If this function is meant to update the *current activeHome object* directly in state,
      // it should ideally call an API that returns the updated home object.
      // For now, let's refresh the entire home state to reflect changes.
      const refreshedHome = await api.getHomeDetails(activeHome._id); // Assuming getHomeDetails API exists
      setActiveHome(refreshedHome);
      setError(null);
    } catch (err) {
      console.error("Failed to update home:", err);
      setError(err.response?.data?.message || 'Failed to update home');
    } finally {
      setLoading(false);
    }
  }, [activeHome]);


  // Item specific actions (Shopping & Tasks)
  const saveItem = useCallback(async (listType, itemData) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      const newItem = await api.addItem(activeHome._id, listType, itemData);
      setActiveHome(prev => ({
        ...prev,
        [listType + 'Items']: [...prev[listType + 'Items'], newItem]
      }));
      setError(null);
    } catch (err) {
      console.error(`Failed to add ${listType} item:`, err);
      setError(err.response?.data?.message || `Failed to add ${listType} item`);
    } finally {
      setLoading(false);
    }
  }, [activeHome]);

  const modifyItem = useCallback(async (listType, itemId, itemData) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      const updatedItem = await api.updateItem(activeHome._id, listType, itemId, itemData);
      setActiveHome(prev => ({
        ...prev,
        [listType + 'Items']: prev[listType + 'Items'].map(item =>
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
  }, [activeHome]);

  const removeItem = useCallback(async (listType, itemId) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      await api.deleteItem(activeHome._id, listType, itemId);
      setActiveHome(prev => ({
        ...prev,
        [listType + 'Items']: prev[listType + 'Items'].filter(item => item._id !== itemId)
      }));
      setError(null);
    } catch (err) {
      console.error(`Failed to delete ${listType} item:`, err);
      setError(err.response?.data?.message || `Failed to delete ${listType} item`);
    } finally {
      setLoading(false);
    }
  }, [activeHome]);


  // Finance specific actions
  const saveBill = useCallback(async (billData) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      const newBill = await api.addExpectedBill(activeHome._id, billData);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          expectedBills: [...prev.finances.expectedBills, newBill]
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to add bill:", err);
      setError(err.response?.data?.message || 'Failed to add bill');
    } finally {
      setLoading(false);
    }
  }, [activeHome]);

  const modifyBill = useCallback(async (billId, billData) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      const updatedBill = await api.updateExpectedBill(activeHome._id, billId, billData);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          expectedBills: prev.finances.expectedBills.map(bill =>
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
  }, [activeHome]);

  const deleteBill = useCallback(async (billId) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      await api.deleteExpectedBill(activeHome._id, billId);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          expectedBills: prev.finances.expectedBills.filter(bill => bill._id !== billId)
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to delete bill:", err);
      setError(err.response?.data?.message || 'Failed to delete bill');
    } finally {
      setLoading(false);
    }
  }, [activeHome]);

  const payExistingBill = useCallback(async (billId) => {
    if (!activeHome) return;
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
  }, [activeHome]);

  const saveIncome = useCallback(async (incomeData) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      const newIncome = await api.addIncome(activeHome._id, incomeData);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          income: [...prev.finances.income, newIncome]
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to add income:", err);
      setError(err.response?.data?.message || 'Failed to add income');
    } finally {
      setLoading(false);
    }
  }, [activeHome]);

  const saveSavingsGoal = useCallback(async (goalData) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      const newGoal = await api.addSavingsGoal(activeHome._id, goalData);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          savingsGoals: [...prev.finances.savingsGoals, newGoal]
        }
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to add savings goal:", err);
      setError(err.response?.data?.message || 'Failed to add savings goal');
    } finally {
      setLoading(false);
    }
  }, [activeHome]);

  const addFundsToSavingsGoal = useCallback(async (goalId, amount) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      const updatedGoal = await api.addToSavingsGoal(activeHome._id, goalId, amount);
      setActiveHome(prev => ({
        ...prev,
        finances: {
          ...prev.finances,
          savingsGoals: prev.finances.savingsGoals.map(goal =>
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
  }, [activeHome]);


  const saveBudgets = useCallback(async (budgetsData) => {
    if (!activeHome) return;
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
  }, [activeHome]);

  const fetchUserMonthlyFinanceSummary = useCallback(async (year, month) => {
    if (!activeHome) return null;
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
  }, [activeHome]);


  // --- User Management Actions ---
  const addHomeUser = useCallback(async (userName) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      const response = await api.addUser(activeHome._id, userName);
      setActiveHome(prev => ({
        ...prev,
        users: response // Assuming API returns the updated users array directly
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
  }, [activeHome]);

  const removeHomeUser = useCallback(async (userName) => {
    if (!activeHome) return;
    setLoading(true);
    try {
      const response = await api.removeUser(activeHome._id, userName);
      setActiveHome(prev => ({
        ...prev,
        users: response.users // API returns an object with 'users' key
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
  }, [activeHome]);


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
    createHome, // לוודא שזה קיים!
  };
  
  return (
    <HomeContext.Provider value={contextValue}>
      {children}
    </HomeContext.Provider>
  );
};