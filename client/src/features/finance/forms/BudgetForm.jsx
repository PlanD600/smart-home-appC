import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

// A default icon for new categories
const DEFAULT_ICON = 'fa-tag';

/**
 * [Upgraded] A form for setting, adding, and updating monthly budget categories and amounts.
 */
const BudgetForm = () => {
    const { activeHome } = useAppContext();
    const { saveBudgets, loading } = useFinanceActions();
    const { hideModal } = useModal();
    
    // State to manage the list of categories being edited
    const [categories, setCategories] = useState([]);
    
    // State for the "add new category" form fields
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryAmount, setNewCategoryAmount] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#CCCCCC');

    const [error, setError] = useState('');

    useEffect(() => {
        // Initialize the local state with a deep copy of the categories from the context
        if (activeHome?.finances?.expenseCategories) {
            setCategories(JSON.parse(JSON.stringify(activeHome.finances.expenseCategories)));
        }
    }, [activeHome?.finances?.expenseCategories]);

    /**
     * Handles changes to an existing category's budget input.
     * @param {number} index - The index of the category being updated.
     * @param {string} value - The new value from the input field.
     */
    const handleBudgetChange = (index, value) => {
        const updatedCategories = [...categories];
        // Allow empty string for user input, but treat as 0 for state
        updatedCategories[index].budgetAmount = value === '' ? '' : parseFloat(value);
        setCategories(updatedCategories);
    };
    
    /**
     * [NEW] Adds a new category to the local state list.
     */
    const handleAddNewCategory = (e) => {
        e.preventDefault();
        setError('');
        if (!newCategoryName.trim()) {
            setError('יש להזין שם לקטגוריה החדשה.');
            return;
        }
        if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
            setError('קטגוריה עם שם זה כבר קיימת.');
            return;
        }

        const newCategory = {
            name: newCategoryName.trim(),
            budgetAmount: parseFloat(newCategoryAmount) || 0,
            color: newCategoryColor,
            icon: DEFAULT_ICON, // Assign a default icon
        };

        setCategories(prev => [...prev, newCategory]);

        // Reset the form fields
        setNewCategoryName('');
        setNewCategoryAmount('');
        setNewCategoryColor('#CCCCCC');
    };

    /**
     * Handles the final form submission to save all changes.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Ensure all budgetAmounts are valid numbers before saving
        const finalCategories = categories.map(cat => ({
            ...cat,
            budgetAmount: Number(cat.budgetAmount) || 0,
        }));

        try {
            await saveBudgets(finalCategories);
            hideModal();
        } catch (err) {
            setError(err.message || 'שגיאה בעדכון התקציבים.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="budget-form">
            <h3 className="form-title">ניהול קטגוריות ותקציבים</h3>
            
            {/* Section for adding a new category */}
            <div className="add-category-form-section">
                <h4>הוספת קטגוריה חדשה</h4>
                <div className="new-category-inputs">
                    <input
                        type="text"
                        placeholder="שם הקטגוריה"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="סכום תקציב"
                        value={newCategoryAmount}
                        onChange={(e) => setNewCategoryAmount(e.target.value)}
                        step="0.01" // Allow decimals
                        min="0"
                    />
                    <input
                        type="color"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                        title="בחר צבע"
                    />
                    <button type="button" onClick={handleAddNewCategory} className="add-btn" disabled={!newCategoryName.trim()}>
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
            </div>

            <hr className="form-divider"/>

            {/* List of existing categories for editing */}
            <div className="budget-items-list">
                <h4>עריכת תקציבים קיימים</h4>
                {categories.map((cat, index) => (
                    <div key={index} className="budget-item-row">
                        <label htmlFor={`budget-${cat.name}`} className="category-label">
                             <i className={`fas ${cat.icon || 'fa-tag'}`} style={{ color: cat.color }}></i>
                            {cat.name}
                        </label>
                        <input
                            type="number"
                            id={`budget-${cat.name}`}
                            value={cat.budgetAmount ?? ''}
                            onChange={(e) => handleBudgetChange(index, e.target.value)}
                            className="budget-input"
                            placeholder="0.00"
                            min="0"
                            step="0.01" // [FIXED] Allow decimal values
                        />
                    </div>
                ))}
            </div>
            
            {error && <p className="error-message">{error}</p>}

            <div className="modal-footer">
                <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'שמור שינויים'}
                </button>
                 <button type="button" className="secondary-action" onClick={hideModal}>
                    בטל
                </button>
            </div>
        </form>
    );
};

export default BudgetForm;
