// This is the full, final version of HomeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../services/api';

const HomeContext = createContext();

export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }) => {
  const [homes, setHomes] = useState([]);
  const [activeHome, setActiveHome] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  
  const login = async (homeId, accessCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.loginToHome(homeId, accessCode);
      setActiveHome(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => setActiveHome(null);
  
  const createHome = async (homeData) => {
    setIsLoading(true);
    try {
        const { data } = await api.createNewHome(homeData);
        setHomes(prevHomes => [...prevHomes, data]);
        return data;
    } catch(err) {
        setError(err.response?.data?.message || 'Failed to create home');
        return null;
    } finally {
        setIsLoading(false);
    }
  }

  // Generic item management
  const addItemToList = async (listType, itemData) => {
    if (!activeHome) return;
    try {
      const { data: newItem } = await api.addItem(activeHome._id, listType, itemData);
      const listKey = listType === 'shopping' ? 'shoppingItems' : 'taskItems';
      setActiveHome(prev => ({ ...prev, [listKey]: [...prev[listKey], newItem] }));
    } catch (err) { console.error(`Failed to add ${listType} item:`, err); }
  };
  
  const updateItemInList = async (listType, itemId, updates) => {
    if (!activeHome) return;
    try {
        const { data: updatedItem } = await api.updateItem(activeHome._id, listType, itemId, updates);
        const listKey = listType === 'shopping' ? 'shoppingItems' : 'taskItems';
        const updatedList = activeHome[listKey].map(item => item._id === itemId ? updatedItem : item);
        setActiveHome(prev => ({ ...prev, [listKey]: updatedList }));
    } catch (err) { console.error(`Failed to update ${listType} item:`, err); }
  };
  
  const deleteItemFromList = async (listType, itemId) => {
    if (!activeHome) return;
    try {
        await api.deleteItem(activeHome._id, listType, itemId);
        const listKey = listType === 'shopping' ? 'shoppingItems' : 'taskItems';
        const updatedList = activeHome[listKey].filter(item => item._id !== itemId);
        setActiveHome(prev => ({ ...prev, [listKey]: updatedList }));
    } catch (err) { console.error(`Failed to delete ${listType} item:`, err); }
  };

  // Finance management
  const addBill = async (billData) => {
    if (!activeHome) return;
    try {
      const { data: newBill } = await api.addExpectedBill(activeHome._id, billData);
      setActiveHome(prev => ({ ...prev, finances: { ...prev.finances, expectedBills: [...prev.finances.expectedBills, newBill] }}));
    } catch (err) { console.error("Failed to add bill:", err); }
  };

  const updateBill = async (billId, billData) => {
    if (!activeHome) return;
    try {
        const { data: updatedBill } = await api.updateExpectedBill(activeHome._id, billId, billData);
        const updatedBills = activeHome.finances.expectedBills.map(b => b._id === billId ? updatedBill : b);
        setActiveHome(prev => ({ ...prev, finances: { ...prev.finances, expectedBills: updatedBills }}));
    } catch(err) { console.error("Failed to update bill:", err); }
  };

  const deleteBill = async (billId) => {
    if (!activeHome) return;
    try {
      await api.deleteExpectedBill(activeHome._id, billId);
      const updatedBills = activeHome.finances.expectedBills.filter(b => b._id !== billId);
      setActiveHome(prev => ({ ...prev, finances: { ...prev.finances, expectedBills: updatedBills }}));
    } catch (err) { console.error("Failed to delete bill:", err); }
  };
  
  const handlePayBill = async (billId) => {
    if (!activeHome) return;
    setIsLoading(true);
    try {
      const { data: updatedFinances } = await api.payBill(activeHome._id, billId);
      setActiveHome(prev => ({ ...prev, finances: updatedFinances }));
    } catch (err) { console.error("Failed to pay bill:", err); } 
    finally { setIsLoading(false); }
  };

  const saveBudgets = async (budgets) => {
    if (!activeHome) return;
    try {
      const { data: updatedCategories } = await api.updateBudgets(activeHome._id, budgets);
      setActiveHome(prev => ({ ...prev, finances: { ...prev.finances, expenseCategories: updatedCategories }}));
    } catch (err) { console.error("Failed to save budgets:", err); }
  };
  
  const addIncomeEntry = async (incomeData) => {
    if(!activeHome) return;
    try {
        const {data: newIncome} = await api.addIncome(activeHome._id, incomeData);
        setActiveHome(prev => ({ ...prev, finances: {...prev.finances, income: [...prev.finances.income, newIncome]} }));
    } catch(err) { console.error("Failed to add income:", err); }
  };
  
  const addGoal = async (goalData) => {
    if (!activeHome) return;
    try {
      const { data: newGoal } = await api.addSavingsGoal(activeHome._id, goalData);
      setActiveHome(prev => ({ ...prev, finances: { ...prev.finances, savingsGoals: [...prev.finances.savingsGoals, newGoal] }}));
    } catch (err) { console.error("Failed to add savings goal:", err); }
  };
  
  const addFundsToGoal = async (goalId, amountToAdd) => {
    if (!activeHome) return;
    try {
      const { data: updatedGoal } = await api.addToSavingsGoal(activeHome._id, goalId, amountToAdd);
      const updatedGoals = activeHome.finances.savingsGoals.map(g => g._id === goalId ? updatedGoal : g);
      setActiveHome(prev => ({ ...prev, finances: { ...prev.finances, savingsGoals: updatedGoals }}));
    } catch (err) { console.error("Failed to add funds to goal:", err); }
  };

  const addUser = async (name) => {
    if (!activeHome) return;
    try {
      const { data: updatedUsers } = await api.addUser(activeHome._id, name);
      setActiveHome(prev => ({ ...prev, users: updatedUsers }));
    } catch(err) { console.error("Failed to add user:", err); }
  };
  
  const value = { activeHome, homes, isLoading, error, login, logout, createHome, addItemToList, updateItemInList, deleteItemFromList, addBill, updateBill, deleteBill, handlePayBill, saveBudgets, addIncomeEntry, addGoal, addFundsToGoal, addUser };

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};