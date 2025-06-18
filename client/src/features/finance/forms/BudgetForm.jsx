import React, { useState, useEffect } from 'react';
import { useHome } from '../../../context/HomeContext';
import { useModal } from '../../../context/ModalContext';

const DEFAULT_NEW_CATEGORY_COLOR = '#cccccc'; // צבע ברירת מחדל לקטגוריה חדשה

const BudgetForm = () => {
  const { activeHome, saveBudgets } = useHome();
  const { hideModal } = useModal();
  
  // State for existing budgets (amount and color)
  const [budgets, setBudgets] = useState({});
  // State for new categories to be added (array of objects)
  const [newCategories, setNewCategories] = useState([{ name: '', amount: '', color: DEFAULT_NEW_CATEGORY_COLOR }]);

  useEffect(() => {
    // Initialize existing budgets with their current amounts and colors
    const initialBudgets = activeHome.finances.expenseCategories.reduce((acc, cat) => {
      acc[cat.name] = { 
        amount: cat.budgetAmount || '',
        color: cat.color || DEFAULT_NEW_CATEGORY_COLOR 
      };
      return acc;
    }, {});
    setBudgets(initialBudgets);
  }, [activeHome.finances.expenseCategories]);

  // Handler for changes in existing budget categories
  const handleBudgetChange = (categoryName, field, value) => {
    setBudgets(prev => ({
      ...prev,
      [categoryName]: { ...prev[categoryName], [field]: value }
    }));
  };

  // Handler for changes in new category input fields
  const handleNewCategoryChange = (index, field, value) => {
    const updatedNewCategories = [...newCategories];
    updatedNewCategories[index][field] = value;
    setNewCategories(updatedNewCategories);
  };

  // Add a new blank row for a new category
  const addCategoryRow = () => {
    setNewCategories(prev => [...prev, { name: '', amount: '', color: DEFAULT_NEW_CATEGORY_COLOR }]);
  };

  // Remove a new category row
  const removeCategoryRow = (index) => {
    setNewCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Prepare updated existing categories
    const updatedExistingCategories = Object.entries(budgets).map(([name, data]) => ({
      name,
      budgetAmount: parseFloat(data.amount) || 0,
      color: data.color,
    }));

    // Prepare new categories, filtering out empty ones
    const categoriesToAdd = newCategories
      .filter(cat => cat.name.trim() !== '' && (parseFloat(cat.amount) || 0) >= 0)
      .map(cat => ({
        name: cat.name.trim(),
        budgetAmount: parseFloat(cat.amount) || 0,
        color: cat.color,
      }));

    // Combine existing and new categories, ensuring uniqueness by name (new ones override if name exists)
    const finalCategoriesMap = new Map();
    
    // Add existing categories first
    updatedExistingCategories.forEach(cat => {
        finalCategoriesMap.set(cat.name, cat);
    });

    // Add new categories, overriding existing if names conflict
    categoriesToAdd.forEach(cat => {
        finalCategoriesMap.set(cat.name, cat);
    });

    const payload = Array.from(finalCategoriesMap.values());
    
    await saveBudgets(payload); // saveBudgets will now receive an array of category objects
    hideModal();
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const itemStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 120px 40px auto',
    gap: '10px',
    alignItems: 'center'
  };

  const newItemStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 120px 40px 30px',
    gap: '10px',
    alignItems: 'center'
  };

  // הסגנון עבור אזור התוכן הניתן לגלילה בתוך הטופס (אם המודאל עצמו לא גליל)
  const scrollableContentStyle = {
    maxHeight: '1000px', 
    overflowY: 'auto',
    paddingRight: '10px', 
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {/* עוטף את תוכן הטופס הראשי לגלילה */}
      <div style={scrollableContentStyle}>
        <h4>הגדר תקציב חודשי וצבע לכל קטגוריה קיימת:</h4>
        <div>
          {Object.entries(budgets).map(([categoryName, data]) => (
            <div key={categoryName} style={itemStyle}>
              <label htmlFor={`budget-cat-${categoryName}`}>{categoryName}</label>
              <input
                type="number"
                id={`budget-cat-${categoryName}`}
                value={data.amount}
                onChange={(e) => handleBudgetChange(categoryName, 'amount', e.target.value)}
                placeholder="0"
              />
              <input 
                type="color" 
                value={data.color}
                onChange={(e) => handleBudgetChange(categoryName, 'color', e.target.value)}
                style={{ width: '40px', height: '35px', padding: '2px', border: 'none' }}
              />
              {/* אין כפתור הסרה לקטגוריות קיימות כאן, זה ידרוש לוגיקה נוספת בשרת */}
            </div>
          ))}
        </div>

        <hr style={{margin: '10px 0'}} />

        <h4>הוסף קטגוריות תקציב חדשות:</h4>
        <div> 
          {newCategories.map((cat, index) => (
            <div key={index} style={newItemStyle}>
              <input
                type="text"
                value={cat.name}
                onChange={e => handleNewCategoryChange(index, 'name', e.target.value)}
                placeholder="שם קטגוריה חדשה"
              />
              <input
                type="number"
                value={cat.amount}
                onChange={e => handleNewCategoryChange(index, 'amount', e.target.value)}
                placeholder="סכום תקציב"
              />
              <input 
                type="color" 
                value={cat.color}
                onChange={(e) => handleNewCategoryChange(index, 'color', e.target.value)}
                style={{ width: '40px', height: '35px', padding: '2px', border: 'none' }}
              />
              {newCategories.length > 1 && ( // Allow removing only if there's more than one row
                <button type="button" onClick={() => removeCategoryRow(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '1.2em' }}>
                  <i className="fas fa-times-circle"></i>
                </button>
              )}
            </div>
          ))}
        </div>
        <button 
          type="button" 
          onClick={addCategoryRow} 
          className="secondary-action" 
          style={{ 
            marginTop: '10px', 
            alignSelf: 'flex-start',
            padding: '10px 20px', // הוספת padding מפורש
            borderRadius: '4px', // הוספת border-radius מפורש
            border: '1px solid var(--border-grey)', // הוספת border מפורש
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px'
          }}
        >
          <i className="fas fa-plus-circle"></i> הוסף שורה נוספת
        </button>
      </div> {/* סוף עוטף הגלילה */}

      <div className="modal-footer">
        <button type="submit" className="primary-action">שמור תקציבים</button>
      </div>
    </form>
  );
};

export default BudgetForm;