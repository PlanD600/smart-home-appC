import React, { useState, useEffect } from 'react';
import { useHome } from 'src/context/HomeContext'; // נתיב יבוא תקין
import { useModal } from 'src/context/ModalContext'; // נתיב יבוא תקין

/**
 * @file BudgetForm component
 * @description Manages monthly budget tracking for expense categories, including adding new categories.
 * @param {object} props - Component props
 * @param {function} props.onClose - Function to close the modal
 */
const BudgetForm = ({ onClose }) => {
  const { currentHome, updateCurrentHome, loading } = useHome();
  const { showAlert } = useModal();

  // State to hold the budget amounts for existing categories
  // Initialized with current budget amounts from home.finances.expenseCategories
  const [budgets, setBudgets] = useState({});
  // State for a new expense category name
  const [newCategoryName, setNewCategoryName] = useState('');
  // State for the budget amount of the new category
  const [newCategoryAmount, setNewCategoryAmount] = useState('');

  // Effect hook to initialize budgets state when currentHome changes
  useEffect(() => {
    if (currentHome && currentHome.finances && currentHome.finances.expenseCategories) {
      const initialBudgets = currentHome.finances.expenseCategories.reduce((acc, cat) => {
        acc[cat.id] = cat.budgetAmount || 0;
        return acc;
      }, {});
      setBudgets(initialBudgets);
    }
  }, [currentHome]);

  /**
   * Handles changes to an existing category's budget input.
   * @param {string} categoryId - The ID of the category being updated
   * @param {string} value - The new value from the input field
   */
  const handleBudgetChange = (categoryId, value) => {
    // Update the budgets state with the new value, ensuring it's a number
    setBudgets(prevBudgets => ({
      ...prevBudgets,
      [categoryId]: parseFloat(value) || 0, // Convert to number, default to 0 if invalid
    }));
  };

  /**
   * Handles the form submission to save all budget changes and add a new category if specified.
   */
  const handleSubmit = async () => {
    // Ensure currentHome and finances object exist before proceeding
    if (!currentHome || !currentHome.finances) {
      showAlert("Home data not available.", "Error");
      return;
    }

    // Create a deep copy of the finances object to modify
    const updatedFinances = { ...currentHome.finances };

    // Update existing expense categories with new budget amounts
    updatedFinances.expenseCategories = updatedFinances.expenseCategories.map(cat => ({
      ...cat,
      budgetAmount: budgets[cat.id] !== undefined ? budgets[cat.id] : cat.budgetAmount,
    }));

    // Add a new category if both name and amount are provided
    if (newCategoryName.trim() && newCategoryAmount !== '') {
      // Check if category already exists to prevent duplicates
      const categoryExists = updatedFinances.expenseCategories.some(
        cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      );

      if (categoryExists) {
        showAlert(`קטגוריה "${newCategoryName.trim()}" כבר קיימת.`, "שגיאה");
        return; // Prevent adding duplicate and stop submission
      }

      // Add the new category with a unique ID and parsed amount
      updatedFinances.expenseCategories.push({
        id: `cat_exp_${Date.now()}`, // Unique ID for the new category
        name: newCategoryName.trim(),
        budgetAmount: parseFloat(newCategoryAmount) || 0, // Ensure it's a number
        icon: "fas fa-tag", // Default icon for new categories
        color: "#CCCCCC", // Default color for new categories (can be improved later)
      });
    }

    try {
      // Update the home context, which will then send the updated finances to the backend
      await updateCurrentHome({ finances: updatedFinances });
      showAlert("תקציבים עודכנו בהצלחה!", "הצלחה");
      onClose(); // Close the modal after successful update
    } catch (error) {
      console.error("Failed to update budgets:", error);
      showAlert("Failed to update budgets. Please try again.", "Error");
    }
  };

  // If home data is loading, show a loading message or spinner
  if (loading) {
    return <div className="modal-loader"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h4>הגדר תקציב חודשי לכל קטגוריה:</h4>
      {/* Loop through existing expense categories to display their budget inputs */}
      {currentHome?.finances?.expenseCategories?.map(cat => (
        <div className="budget-item-field" key={cat.id}>
          <label htmlFor={`budget-cat-${cat.id}`} style={{ flexGrow: 1, marginBottom: 0 }}>
            {cat.name}
          </label>
          <input
            type="number"
            id={`budget-cat-${cat.id}`}
            data-id={cat.id}
            value={budgets[cat.id] || ''} // Display current budget or empty string
            onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
          />
          <span>{currentHome?.finances?.financeSettings?.currency || '₪'}</span>
        </div>
      ))}

      <hr />

      <h4>הוסף קטגוריית תקציב חדשה</h4>
      <div className="budget-item-field">
        <input
          type="text"
          id="new-budget-cat-name"
          placeholder="שם קטגוריה"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <input
          type="number"
          id="new-budget-cat-amount"
          placeholder="סכום"
          value={newCategoryAmount}
          onChange={(e) => setNewCategoryAmount(e.target.value)}
        />
        <span>{currentHome?.finances?.financeSettings?.currency || '₪'}</span>
      </div>

      <div className="modal-footer">
        <button className="primary-action" onClick={handleSubmit}>
          שמור
        </button>
        <button className="secondary-action" onClick={onClose}>
          בטל
        </button>
      </div>
    </div>
  );
};

export default BudgetForm;
