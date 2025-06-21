import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext'; // ✅ שימוש ב-@
import * as api from '@/services/api'; // ✅ שימוש ב-@

const FinanceActionsContext = createContext();
export const useFinanceActions = () => useContext(FinanceActionsContext);

export const FinanceActionsProvider = ({ children }) => {
    // ✅ קבלת המצב וה-setters מהקונטקסט הראשי
    const { activeHome, setActiveHome, setError } = useAppContext();

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
        setActiveHome(updatedHomeOptimistic);
        localStorage.setItem('smart-home-data', JSON.stringify(updatedHomeOptimistic));

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
            setActiveHome(finalHomeState);
            localStorage.setItem('smart-home-data', JSON.stringify(finalHomeState));
        } catch (err) {
            setError('Failed to save bill');
            setActiveHome(previousHome);
            localStorage.setItem('smart-home-data', JSON.stringify(previousHome));
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
        setActiveHome(updatedHomeOptimistic);

        try {
            await api.updateExpectedBill(activeHome._id, billId, updates);
        } catch (err) {
            setError('Failed to update bill');
            setActiveHome(previousHome);
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
        setActiveHome(updatedHomeOptimistic);

        try {
            await api.deleteExpectedBill(activeHome._id, billId);
        } catch (err) {
            setError('Failed to delete bill');
            setActiveHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);
    
    const payExistingBill = useCallback(async (billId) => {
        if (!activeHome?._id) return;
        // לפעולה זו, שמשנה שני מערכים, בטוח יותר לחכות לתשובת השרת
        try {
            const updatedFinances = await api.payBill(activeHome._id, billId);
            const updatedHome = { ...activeHome, finances: updatedFinances };
            setActiveHome(updatedHome);
            localStorage.setItem('smart-home-data', JSON.stringify(updatedHome));
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
        setActiveHome(updatedHomeOptimistic);

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
            setActiveHome(finalHomeState);
        } catch (err) {
            setError('Failed to save income');
            setActiveHome(previousHome);
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
        setActiveHome(updatedHomeOptimistic);

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
            setActiveHome(finalHomeState);
        } catch (err) {
            setError('Failed to save savings goal');
            setActiveHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);

    const addFundsToSavingsGoal = useCallback(async (goalId, amount) => {
        if (!activeHome?._id) return;
        // כאן נמתין לתשובת השרת כי הלוגיקה יכולה להיות מורכבת
        try {
            const updatedGoal = await api.addFundsToSavingsGoal(activeHome._id, goalId, amount);
            const updatedHome = {
                ...activeHome,
                finances: {
                    ...activeHome.finances,
                    savingsGoals: activeHome.finances.savingsGoals.map(g =>
                        g._id === goalId ? updatedGoal : g
                    )
                }
            };
            setActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to add funds');
        }
    }, [activeHome, setActiveHome, setError]);

    // --- ניהול תקציב (Budgets) ---
    const saveBudgets = useCallback(async (budgetsData) => {
        if (!activeHome?._id) return;
        try {
            const updatedCategories = await api.updateBudgets(activeHome._id, budgetsData);
            const updatedHome = {
                ...activeHome,
                finances: { ...activeHome.finances, expenseCategories: updatedCategories }
            };
            setActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to save budgets');
        }
    }, [activeHome, setActiveHome, setError]);

    // --- קריאה לנתונים מסוכמים ---
    const fetchUserMonthlyFinanceSummary = useCallback(async (year, month) => {
        if (!activeHome?._id) return null;
        try {
            return await api.getUserMonthlyFinanceSummary(activeHome._id, year, month);
        } catch (err) {
            console.error("Failed to fetch user monthly summary:", err);
            throw err; // זרוק את השגיאה לקומפוננטה שתטפל בה
        }
    }, [activeHome?._id]);


    // ✅ הרכבת כל הפונקציות לאובייקט הקונטקסט
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