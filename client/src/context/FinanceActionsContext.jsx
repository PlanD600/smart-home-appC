import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import * as api from '@/services/api';

const FinanceActionsContext = createContext();

export const useFinanceActions = () => useContext(FinanceActionsContext);

export const FinanceActionsProvider = ({ children }) => {
    const { activeHome, updateActiveHome, loading, setLoading, setError } = useAppContext();

    // A single, reliable way to handle API calls that return the full home object
    const handleApiCall = useCallback(async (apiFunction, args) => {
        if (!activeHome?._id) return;
        setLoading(true);
        setError(null);
        try {
            const updatedHome = await apiFunction(activeHome._id, ...args);
            if (updatedHome && updatedHome._id) {
                updateActiveHome(updatedHome);
            }
        } catch (err) {
            setError(err.message || 'A financial action failed.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [activeHome, updateActiveHome, setLoading, setError]);

    // Simplified actions that now rely on handleApiCall
    const saveBill = useCallback((billData) => handleApiCall(api.addExpectedBill, [billData]), [handleApiCall]);
    const modifyBill = useCallback((billId, updates) => handleApiCall(api.updateExpectedBill, [billId, updates]), [handleApiCall]);
    const deleteBill = useCallback((billId) => handleApiCall(api.deleteExpectedBill, [billId]), [handleApiCall]);
    const payExistingBill = useCallback((billId) => handleApiCall(api.payBill, [billId]), [handleApiCall]);
    
    // Updated actions to use the main handler for consistency
    const saveIncome = useCallback((incomeData) => handleApiCall(api.addIncome, [incomeData]), [handleApiCall]);
    const saveSavingsGoal = useCallback((goalData) => handleApiCall(api.addSavingsGoal, [goalData]), [handleApiCall]);
    const addFundsToSavingsGoal = useCallback((goalId, amount) => handleApiCall(api.addFundsToSavingsGoal, [goalId, amount]), [handleApiCall]);
    const saveBudgets = useCallback((budgetsData) => handleApiCall(api.updateBudgets, [budgetsData]), [handleApiCall]);

    // Data fetching remains separate as it doesn't modify state in the same way
    const fetchUserMonthlyFinanceSummary = useCallback(async (year, month) => {
        if (!activeHome?._id) return null;
        setLoading(true);
        setError(null);
        try {
            return await api.getUserMonthlyFinanceSummary(activeHome._id, year, month);
        } catch (err) {
            setError(err.message || 'Failed to fetch summary.');
            return null;
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id, setLoading, setError]);

    const contextValue = useMemo(() => ({
        loading,
        saveBill,
        modifyBill,
        deleteBill,
        payExistingBill,
        saveIncome,
        saveSavingsGoal,
        addFundsToSavingsGoal,
        saveBudgets,
        fetchUserMonthlyFinanceSummary,
    }), [
        loading, saveBill, modifyBill, deleteBill, payExistingBill, saveIncome,
        saveSavingsGoal, addFundsToSavingsGoal, saveBudgets, fetchUserMonthlyFinanceSummary
    ]);

    return (
        <FinanceActionsContext.Provider value={contextValue}>
            {children}
        </FinanceActionsContext.Provider>
    );
};