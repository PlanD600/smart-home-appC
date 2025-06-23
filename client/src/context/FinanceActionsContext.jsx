import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import * as api from '@/services/api';

const FinanceActionsContext = createContext();

export const useFinanceActions = () => useContext(FinanceActionsContext);

export const FinanceActionsProvider = ({ children }) => {
    // Depend on AppContext for core state and setters
    const { activeHome, updateActiveHome, loading, setLoading, setError } = useAppContext();

    /**
     * A generic wrapper for finance-related API calls to handle loading, errors, and state updates.
     */
    const handleFinanceApiCall = useCallback(async (apiFunction, args, options = {}) => {
        if (!activeHome?._id) return;

        let previousHomeState = activeHome;
        
        if (options.optimisticUpdate) {
            const optimisticState = options.optimisticUpdate(activeHome);
            updateActiveHome(optimisticState); // Apply optimistic update
        } else {
            setLoading(true);
        }
        
        setError(null);
        
        try {
            const result = await apiFunction(activeHome._id, ...args);
            
            // Allow the success handler to define the final state
            if (options.onSuccess) {
                const finalState = options.onSuccess(activeHome, result);
                updateActiveHome(finalState);
            }
            return result; // Return result for chaining if needed
        } catch (err) {
            setError(err.message || 'A financial action failed.');
            // On error, rollback to the previous state
            if (options.optimisticUpdate) {
                updateActiveHome(previousHomeState);
            }
            throw err; // Re-throw to allow individual components to catch it if needed
        } finally {
            if (!options.optimisticUpdate) {
                setLoading(false);
            }
        }
    }, [activeHome, updateActiveHome, setLoading, setError]);

    // --- Bill Actions ---
    const saveBill = useCallback((billData) => {
        const onSuccess = (currentHome, newBill) => ({
            ...currentHome,
            finances: {
                ...currentHome.finances,
                expectedBills: [...currentHome.finances.expectedBills, newBill],
            },
        });
        return handleFinanceApiCall(api.addExpectedBill, [billData], { onSuccess });
    }, [handleFinanceApiCall]);
    
    const modifyBill = useCallback((billId, updates) => {
        const optimisticUpdate = (currentHome) => ({
            ...currentHome,
            finances: {
                ...currentHome.finances,
                expectedBills: currentHome.finances.expectedBills.map(b => 
                    b._id === billId ? { ...b, ...updates } : b
                ),
            },
        });
        return handleFinanceApiCall(api.updateExpectedBill, [billId, updates], { optimisticUpdate });
    }, [handleFinanceApiCall]);

    const deleteBill = useCallback((billId) => {
         const optimisticUpdate = (currentHome) => ({
            ...currentHome,
            finances: {
                ...currentHome.finances,
                expectedBills: currentHome.finances.expectedBills.filter(b => b._id !== billId),
            },
        });
        return handleFinanceApiCall(api.deleteExpectedBill, [billId], { optimisticUpdate });
    }, [handleFinanceApiCall]);

    const payExistingBill = useCallback((billId) => {
        const onSuccess = (currentHome, updatedFinances) => ({
            ...currentHome,
            finances: updatedFinances,
        });
        return handleFinanceApiCall(api.payBill, [billId], { onSuccess });
    }, [handleFinanceApiCall]);

    // --- Income Actions ---
    const saveIncome = useCallback((incomeData) => {
        const onSuccess = (currentHome, newIncome) => ({
            ...currentHome,
            finances: {
                ...currentHome.finances,
                income: [...currentHome.finances.income, newIncome],
            },
        });
        return handleFinanceApiCall(api.addIncome, [incomeData], { onSuccess });
    }, [handleFinanceApiCall]);

    // --- Savings Goals Actions ---
    const saveSavingsGoal = useCallback((goalData) => {
         const onSuccess = (currentHome, newGoal) => ({
            ...currentHome,
            finances: {
                ...currentHome.finances,
                savingsGoals: [...currentHome.finances.savingsGoals, newGoal],
            },
        });
        return handleFinanceApiCall(api.addSavingsGoal, [goalData], { onSuccess });
    }, [handleFinanceApiCall]);
    
    const addFundsToSavingsGoal = useCallback((goalId, amount) => {
        const optimisticUpdate = (currentHome) => ({
            ...currentHome,
            finances: {
                ...currentHome.finances,
                savingsGoals: currentHome.finances.savingsGoals.map(g => 
                    g._id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
                ),
            },
        });
        // Passing the amount directly as an argument
        return handleFinanceApiCall(api.addFundsToSavingsGoal, [goalId, amount], { optimisticUpdate });
    }, [handleFinanceApiCall]);

    // --- Budget Actions ---
    const saveBudgets = useCallback((budgetsData) => {
        const onSuccess = (currentHome, updatedCategories) => ({
            ...currentHome,
            finances: { ...currentHome.finances, expenseCategories: updatedCategories },
        });
        return handleFinanceApiCall(api.updateBudgets, [budgetsData], { onSuccess });
    }, [handleFinanceApiCall]);

    // --- Data Fetching ---
    const fetchUserMonthlyFinanceSummary = useCallback((year, month) => {
        // This is a GET request, so no optimistic update needed.
        return handleFinanceApiCall(api.getUserMonthlyFinanceSummary, [year, month]);
    }, [handleFinanceApiCall]);

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
