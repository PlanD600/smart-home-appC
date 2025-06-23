import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A form for setting and updating monthly budget amounts for all expense categories.
 */
const BudgetForm = () => {
    const { activeHome } = useAppContext();
    const { saveBudgets, loading } = useFinanceActions();
    const { hideModal } = useModal();
    
    const [budgets, setBudgets] = useState({});
    const [error, setError] = useState('');

    // Initialize the form state with the current budget values from the home context.
    useEffect(() => {
        const initialBudgets = {};
        if (activeHome?.finances?.expenseCategories) {
            activeHome.finances.expenseCategories.forEach(cat => {
                // The key is the category name, the value is its budget amount
                initialBudgets[cat.name] = cat.budgetAmount || 0;
            });
        }
        setBudgets(initialBudgets);
    }, [activeHome?.finances?.expenseCategories]);

    /**
     * Handles changes to a specific category's budget input.
     * @param {string} categoryName - The name of the category being updated.
     * @param {string} value - The new value from the input field.
     */
    const handleBudgetChange = (categoryName, value) => {
        // Allow empty string for user input, but treat as 0 for state
        const numericValue = value === '' ? '' : parseFloat(value);
        if (!isNaN(numericValue) || value === '') {
             setBudgets(prev => ({ ...prev, [categoryName]: numericValue }));
        }
    };

    /**
     * Handles the form submission.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Prepare the data in the format the API expects: an array of category objects
        const updatedCategories = activeHome.finances.expenseCategories.map(cat => ({
            ...cat,
            budgetAmount: Number(budgets[cat.name]) || 0, // Ensure it's a number, default to 0
        }));

        try {
            await saveBudgets(updatedCategories);
            hideModal();
        } catch (err) {
            setError(err.message || 'שגיאה בעדכון התקציבים.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="budget-form">
            <h3 className="form-title">עריכת תקציב חודשי</h3>
            <p className="form-subtitle">הגדר את סכום התקציב המקסימלי לכל קטגוריה.</p>
            
            <div className="budget-items-list">
                {activeHome?.finances?.expenseCategories.map(cat => (
                    <div key={cat.name} className="budget-item-row">
                        <label htmlFor={`budget-${cat.name}`} className="category-label">
                             <i className={`fas ${cat.icon || 'fa-tag'}`} style={{ color: cat.color }}></i>
                            {cat.name}
                        </label>
                        <input
                            type="number"
                            id={`budget-${cat.name}`}
                            value={budgets[cat.name] ?? ''}
                            onChange={(e) => handleBudgetChange(cat.name, e.target.value)}
                            className="budget-input"
                            placeholder="0"
                            min="0"
                            step="10"
                        />
                    </div>
                ))}
            </div>
            
            {error && <p className="error-message">{error}</p>}

            <div className="modal-footer">
                <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'שמור תקציבים'}
                </button>
                 <button type="button" className="secondary-action" onClick={hideModal}>
                    בטל
                </button>
            </div>
        </form>
    );
};

export default BudgetForm;
