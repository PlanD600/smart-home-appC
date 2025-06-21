// client/src/features/finance/forms/BudgetForm.jsx

import React, { useState, useEffect } from 'react';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';

const BudgetForm = () => {
    const { activeHome } = useAppContext();
    const { saveBudgets } = useFinanceActions(); // ✅ שינוי שם הפונקציה ל-saveBudgets
    const { hideModal } = useModal();
    const [budgets, setBudgets] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const initialBudgets = {};
        activeHome.finances.expenseCategories.forEach(cat => {
            initialBudgets[cat.name] = cat.budget || 0;
        });
        setBudgets(initialBudgets);
    }, [activeHome.finances.expenseCategories]);

    const handleBudgetChange = (categoryName, value) => {
        setBudgets(prev => ({ ...prev, [categoryName]: Number(value) }));
    };

    const handleUpdateBudgets = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const budgetsData = Object.entries(budgets).map(([name, budget]) => ({ name, budget }));
        await saveBudgets(budgetsData); // ✅ שינוי שם הפונקציה ל-saveBudgets
        setIsLoading(false);
        hideModal();
    };

    return (
        <form onSubmit={handleUpdateBudgets} className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-center">עדכון תקציב חודשי לקטגוריות</h3>
            <div className="max-h-60 overflow-y-auto pr-2">
                {activeHome.finances.expenseCategories.map(cat => (
                    <div key={cat.name} className="flex items-center justify-between mb-3">
                        <label htmlFor={`budget-${cat.name}`} className="text-sm font-medium text-gray-700">
                            {cat.name}
                        </label>
                        <input
                            type="number"
                            id={`budget-${cat.name}`}
                            value={budgets[cat.name] || ''}
                            onChange={(e) => handleBudgetChange(cat.name, e.target.value)}
                            className="input input-bordered w-32 text-left"
                            dir="ltr"
                            min="0"
                            step="10"
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-4 border-t">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'שומר...' : 'שמור שינויים'}
                </button>
            </div>
        </form>
    );
};

export default BudgetForm;