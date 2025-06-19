import React, { useState, useEffect } from 'react';
import { useHome } from '../../../context/HomeContext';
import { useModal } from '../../../context/ModalContext';

const DEFAULT_NEW_CATEGORY_COLOR = '#cccccc';

const BudgetForm = () => {
  const { activeHome, saveBudgets } = useHome();
  const { hideModal } = useModal();
  
  const [budgets, setBudgets] = useState({});
  const [newCategories, setNewCategories] = useState([{ name: '', amount: '', color: DEFAULT_NEW_CATEGORY_COLOR }]);

  useEffect(() => {
    // =================================================================
    // כאן התיקון: אנחנו בודקים שהנתון הוא מערך לפני הפעלת reduce
    // 1. ניצור משתנה "בטוח" שיהיה תמיד מערך
    const categoriesArray = Array.isArray(activeHome?.finances?.expenseCategories) 
      ? activeHome.finances.expenseCategories 
      : [];
    // =================================================================

    // 2. נשתמש במשתנה הבטוח שיצרנו
    const initialBudgets = categoriesArray.reduce((acc, cat) => {
      acc[cat.name] = { 
        amount: cat.budgetAmount || '',
        color: cat.color || DEFAULT_NEW_CATEGORY_COLOR 
      };
      return acc;
    }, {});
    setBudgets(initialBudgets);

  // אנו תלויים במערך המקורי מהקונטקסט
  }, [activeHome?.finances?.expenseCategories]);

  // --- שאר הקוד נשאר זהה לחלוטין ---

  const handleBudgetChange = (categoryName, field, value) => {
    setBudgets(prev => ({
      ...prev,
      [categoryName]: { ...prev[categoryName], [field]: value }
    }));
  };

  const handleNewCategoryChange = (index, field, value) => {
    const updatedNewCategories = [...newCategories];
    updatedNewCategories[index][field] = value;
    setNewCategories(updatedNewCategories);
  };

  const addCategoryRow = () => {
    setNewCategories(prev => [...prev, { name: '', amount: '', color: DEFAULT_NEW_CATEGORY_COLOR }]);
  };

  const removeCategoryRow = (index) => {
    setNewCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    const updatedExistingCategories = Object.entries(budgets).map(([name, data]) => ({
      name,
      budgetAmount: parseFloat(data.amount) || 0,
      color: data.color,
    }));

    const categoriesToAdd = newCategories
      .filter(cat => cat.name.trim() !== '' && (parseFloat(cat.amount) || 0) >= 0)
      .map(cat => ({
        name: cat.name.trim(),
        budgetAmount: parseFloat(cat.amount) || 0,
        color: cat.color,
      }));

    const finalCategoriesMap = new Map();
    
    updatedExistingCategories.forEach(cat => {
        finalCategoriesMap.set(cat.name, cat);
    });

    categoriesToAdd.forEach(cat => {
        finalCategoriesMap.set(cat.name, cat);
    });

    const payload = Array.from(finalCategoriesMap.values());
    
    await saveBudgets(payload);
    hideModal();
  };

  const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
  const itemStyle = { display: 'grid', gridTemplateColumns: '1fr 120px 40px auto', gap: '10px', alignItems: 'center' };
  const newItemStyle = { display: 'grid', gridTemplateColumns: '1fr 120px 40px 30px', gap: '10px', alignItems: 'center' };
  const scrollableContentStyle = { maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
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
              {newCategories.length > 1 && (
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
            padding: '10px 20px',
            borderRadius: '4px',
            border: '1px solid var(--border-grey)',
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px'
          }}
        >
          <i className="fas fa-plus-circle"></i> הוסף שורה נוספת
        </button>
      </div>

      <div className="modal-footer">
        <button type="submit" className="primary-action">שמור תקציבים</button>
      </div>
    </form>
  );
};

export default BudgetForm;