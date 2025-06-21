// client/src/context/FinanceActionsContext.jsx

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import * as api from '@/services/api';

const FinanceActionsContext = createContext();
export const useFinanceActions = () => useContext(FinanceActionsContext);

export const FinanceActionsProvider = ({ children }) => {
    const { activeHome, setActiveHome, setError } = useAppContext();
    const HOME_DATA_STORAGE_KEY = 'smart-home-data';

    // פונקציית עזר לעדכון המצב ושמירה ב-localStorage
    const updateAndPersistHome = (updatedHome) => {
        setActiveHome(updatedHome);
        localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
    };

    // --- ניהול חשבונות (Bills) ---

    const saveBill = useCallback(async (billData) => {
        if (!activeHome?._id) return;
        const tempId = `temp_${Date.now()}`;
        const newBillWithTempId = { ...billData, _id: tempId };

        const previousHome = activeHome;
        const updatedHomeOptimistic = {
            ...activeHome,
            finances: {
                ...activeHome.finances,
                expectedBills: [...(activeHome.finances?.expectedBills || []), newBillWithTempId]
            }
        };
        updateAndPersistHome(updatedHomeOptimistic);

        try {
            const finalBillFromServer = await api.addExpectedBill(activeHome._id, billData);
            const finalHomeState = {
                ...updatedHomeOptimistic,
                finances: {
                    ...updatedHomeOptimistic.finances,
                    expectedBills: updatedHomeOptimistic.finances.expectedBills.map(b =>
                        b._id === tempId ? finalBillFromServer : b
                    )
                }
            };
            updateAndPersistHome(finalHomeState);
        } catch (err) {
            setError('Failed to save bill');
            updateAndPersistHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);

    const modifyBill = useCallback(async (billId, updates) => {
        if (!activeHome?._id) return;
        const previousHome = activeHome;

        const updatedHomeOptimistic = {
            ...activeHome,
            finances: {
                ...activeHome.finances,
                expectedBills: activeHome.finances.expectedBills.map(bill =>
                    bill._id === billId ? { ...bill, ...updates } : bill
                )
            }
        };
        updateAndPersistHome(updatedHomeOptimistic);

        try {
            await api.updateExpectedBill(activeHome._id, billId, updates);
        } catch (err) {
            setError('Failed to update bill');
            updateAndPersistHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);

    const deleteBill = useCallback(async (billId) => {
        if (!activeHome?._id) return;
        const previousHome = activeHome;

        const updatedHomeOptimistic = {
            ...activeHome,
            finances: {
                ...activeHome.finances,
                expectedBills: activeHome.finances.expectedBills.filter(bill => bill._id !== billId)
            }
        };
        updateAndPersistHome(updatedHomeOptimistic);

        try {
            await api.deleteExpectedBill(activeHome._id, billId);
        } catch (err) {
            setError('Failed to delete bill');
            updateAndPersistHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);

    const payExistingBill = useCallback(async (billId, paymentDetails) => {
        if (!activeHome?._id) return;
        try {
            const updatedHomeFromServer = await api.payBill(activeHome._id, billId, paymentDetails);
            updateAndPersistHome(updatedHomeFromServer);
        } catch (err) {
            setError('Failed to pay bill');
        }
    }, [activeHome, setActiveHome, setError]);

    // --- ניהול הכנסות (Income) ---
    const saveIncome = useCallback(async (incomeData) => {
        if (!activeHome?._id) return;
        const tempId = `temp_${Date.now()}`;
        const newIncomeWithTempId = { ...incomeData, _id: tempId };

        const previousHome = activeHome;
        const updatedHomeOptimistic = {
            ...activeHome,
            finances: {
                ...activeHome.finances,
                income: [...(activeHome.finances?.income || []), newIncomeWithTempId]
            }
        };
        updateAndPersistHome(updatedHomeOptimistic);

        try {
            const finalIncomeFromServer = await api.addIncome(activeHome._id, incomeData);
            const finalHomeState = {
                ...updatedHomeOptimistic,
                finances: {
                    ...updatedHomeOptimistic.finances,
                    income: updatedHomeOptimistic.finances.income.map(i =>
                        i._id === tempId ? finalIncomeFromServer : i
                    )
                }
            };
            updateAndPersistHome(finalHomeState);
        } catch (err) {
            setError('Failed to save income');
            updateAndPersistHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);

    // --- ניהול יעדי חיסכון (Savings Goals) ---
    const saveSavingsGoal = useCallback(async (goalData) => {
        if (!activeHome?._id) return;
        const tempId = `temp_${Date.now()}`;
        const newGoalWithTempId = { ...goalData, _id: tempId };

        const previousHome = activeHome;
        const updatedHomeOptimistic = {
            ...activeHome,
            finances: {
                ...activeHome.finances,
                savingsGoals: [...(activeHome.finances?.savingsGoals || []), newGoalWithTempId]
            }
        };
        updateAndPersistHome(updatedHomeOptimistic);

        try {
            const finalGoalFromServer = await api.addSavingsGoal(activeHome._id, goalData);
            const finalHomeState = {
                ...updatedHomeOptimistic,
                finances: {
                    ...updatedHomeOptimistic.finances,
                    savingsGoals: updatedHomeOptimistic.finances.savingsGoals.map(g =>
                        g._id === tempId ? finalGoalFromServer : g
                    )
                }
            };
            updateAndPersistHome(finalHomeState);
        } catch (err) {
            setError('Failed to save savings goal');
            updateAndPersistHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);

    const addFundsToSavingsGoal = useCallback(async (goalId, amount) => {
        if (!activeHome?._id) return;
        try {
            const updatedGoal = await api.addFundsToSavingsGoal(activeHome._id, goalId, { amount });
            const updatedHome = {
                ...activeHome,
                finances: {
                    ...activeHome.finances,
                    savingsGoals: activeHome.finances.savingsGoals.map(g =>
                        g._id === goalId ? updatedGoal : g
                    )
                }
            };
            updateAndPersistHome(updatedHome);
        } catch (err) {
            setError('Failed to add funds');
        }
    }, [activeHome, setActiveHome, setError]);

    // --- ניהול תקציב (Budgets) ---
    const saveBudgets = useCallback(async (budgetsData) => {
        if (!activeHome?._id) return;
        const previousHome = activeHome;
        const updatedHomeOptimistic = {
             ...activeHome,
             finances: { ...activeHome.finances, expenseCategories: budgetsData }
        };
        updateAndPersistHome(updatedHomeOptimistic);
        
        try {
            const updatedFinancesFromServer = await api.updateBudgets(activeHome._id, budgetsData);
            const updatedHome = { ...activeHome, finances: updatedFinancesFromServer };
            updateAndPersistHome(updatedHome);
        } catch (err) {
            setError('Failed to save budgets');
            updateAndPersistHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);

    // --- קריאה לנתונים מסוכמים ---
    const fetchUserMonthlyFinanceSummary = useCallback(async (year, month) => {
        if (!activeHome?._id) return null;
        try {
            return await api.getUserMonthlyFinanceSummary(activeHome._id, year, month);
        } catch (err) {
            console.error("Failed to fetch user monthly summary:", err);
            throw err; 
        }
    }, [activeHome?._id]);

    const contextValue = useMemo(() => ({
        saveBill,
        modifyBill,
        deleteBill,
        payExistingBill,
        saveIncome,
        saveSavingsGoal,
        addFundsToSavingsGoal,
        saveBudgets,
        fetchUserMonthlyFinanceSummary
    }), [
        saveBill, modifyBill, deleteBill, payExistingBill, saveIncome,
        saveSavingsGoal, addFundsToSavingsGoal, saveBudgets, fetchUserMonthlyFinanceSummary
    ]);

    return (
        <FinanceActionsContext.Provider value={contextValue}>
            {children}
        </FinanceActionsContext.Provider>
    );
};