import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../services/api';

const HomeContext = createContext();

export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }) => {
  const [homes, setHomes] = useState([]); // List of homes for login
  const [activeHome, setActiveHome] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch homes for login screen on initial load
  useEffect(() => {
    const fetchHomes = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.getHomesForLogin();
        setHomes(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch homes');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomes();
  }, []);
  
  // --- Actions ---

  const login = async (homeId, accessCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.loginToHome(homeId, accessCode);
      setActiveHome(data);
      // Save homeId to local storage to persist login across page reloads (optional)
      localStorage.setItem('activeHomeId', data._id);
      localStorage.setItem('accessCode', accessCode); // Note: Storing password is not secure
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setActiveHome(null);
    localStorage.removeItem('activeHomeId');
    localStorage.removeItem('accessCode');
  };
  
  const createHome = async (homeData) => {
    setIsLoading(true);
    try {
        const { data } = await api.createNewHome(homeData);
        // Add the new home to the list of homes for the login screen
        setHomes(prevHomes => [...prevHomes, data]);
        return data; // Return the new home data
    } catch(err) {
        setError(err.response?.data?.message || 'Failed to create home');
        return null;
    } finally {
        setIsLoading(false);
    }
  }

  // Generic function to update the active home state
  const updateActiveHome = (updatedData) => {
    setActiveHome(prevHome => ({...prevHome, ...updatedData}));
  }

  // --- Item Management ---
  const addItemToList = async (listType, itemData) => {
    if (!activeHome) return;
    try {
      const { data: newItem } = await api.addItem(activeHome._id, listType, itemData);
      
      // Update local state correctly
      const listKey = listType === 'shopping' ? 'shoppingItems' : 'taskItems';
      const updatedList = [...activeHome[listKey], newItem];
      setActiveHome(prevHome => ({
        ...prevHome,
        [listKey]: updatedList,
      }));

    } catch (err) {
      console.error(`Failed to add ${listType} item:`, err);
      // Optionally set an error state to show in the UI
    }
  };
  
  const updateItemInList = async (listType, itemId, updates) => {
    if (!activeHome) return;
    try {
        const { data: updatedItem } = await api.updateItem(activeHome._id, listType, itemId, updates);
        
        const listKey = listType === 'shopping' ? 'shoppingItems' : 'taskItems';
        const updatedList = activeHome[listKey].map(item => 
            item._id === itemId ? updatedItem : item
        );
        setActiveHome(prevHome => ({ ...prevHome, [listKey]: updatedList }));
    } catch (err) {
        console.error(`Failed to update ${listType} item:`, err);
    }
  };
  
  const deleteItemFromList = async (listType, itemId) => {
    if (!activeHome) return;
    try {
        await api.deleteItem(activeHome._id, listType, itemId);
        
        const listKey = listType === 'shopping' ? 'shoppingItems' : 'taskItems';
        const updatedList = activeHome[listKey].filter(item => item._id !== itemId);
        setActiveHome(prevHome => ({ ...prevHome, [listKey]: updatedList }));
    } catch (err) {
        console.error(`Failed to delete ${listType} item:`, err);
    }
  };

  const addBill = async (billData) => {
    if (!activeHome) return;
    try {
      const { data: newBill } = await api.addExpectedBill(activeHome._id, billData);
      const updatedBills = [...activeHome.finances.expectedBills, newBill];
      setActiveHome(prev => ({
        ...prev,
        finances: { ...prev.finances, expectedBills: updatedBills }
      }));
    } catch (err) {
      console.error("Failed to add bill:", err);
    }
  };

  const handlePayBill = async (billId) => {
    if (!activeHome) return;
    setIsLoading(true);
    try {
      // The backend returns the entire updated finances object
      const { data: updatedFinances } = await api.payBill(activeHome._id, billId);
      setActiveHome(prev => ({ ...prev, finances: updatedFinances }));
    } catch (err) {
      console.error("Failed to pay bill:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add these functions inside your HomeProvider and export them in the 'value' object

  const saveBudgets = async (budgets) => {
    if (!activeHome) return;
    try {
      const { data: updatedCategories } = await api.updateBudgets(activeHome._id, budgets);
      setActiveHome(prev => ({
        ...prev,
        finances: { ...prev.finances, expenseCategories: updatedCategories }
      }));
    } catch (err) { console.error("Failed to save budgets:", err); }
  };
  
  const addIncomeEntry = async (incomeData) => {
    if(!activeHome) return;
    try {
        const {data: newIncome} = await api.addIncome(activeHome._id, incomeData);
        setActiveHome(prev => ({
            ...prev,
            finances: {...prev.finances, income: [...prev.finances.income, newIncome]}
        }));
    } catch(err) { console.error("Failed to add income:", err); }
  };
  
  const addGoal = async (goalData) => {
    if (!activeHome) return;
    try {
      const { data: newGoal } = await api.addSavingsGoal(activeHome._id, goalData);
      setActiveHome(prev => ({
        ...prev,
        finances: { ...prev.finances, savingsGoals: [...prev.finances.savingsGoals, newGoal] }
      }));
    } catch (err) { console.error("Failed to add savings goal:", err); }
  };
  
  const addFundsToGoal = async (goalId, amountToAdd) => {
    if (!activeHome) return;
    try {
      const { data: updatedGoal } = await api.addToSavingsGoal(activeHome._id, goalId, amountToAdd);
      const updatedGoals = activeHome.finances.savingsGoals.map(g => g._id === goalId ? updatedGoal : g);
      setActiveHome(prev => ({
        ...prev,
        finances: { ...prev.finances, savingsGoals: updatedGoals }
      }));
    } catch (err) { console.error("Failed to add funds to goal:", err); }
  };

  const value = {
    homes,
    activeHome,
    isLoading,
    error,
    login,
    logout,
    createHome,
    updateActiveHome,
    addItemToList,
    updateItemInList,
    deleteItemFromList,
    addBill,
    handlePayBill,
    saveBudgets,
    addIncomeEntry,
    addGoal,
    addFundsToGoal,
  };

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};