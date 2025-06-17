import React, { useState, useEffect } from 'react';
import { useHome } from '../../../context/HomeContext';
import { useModal } from '../../../context/ModalContext';

const BudgetForm = () => {
  const { activeHome, saveBudgets } = useHome();
  const { hideModal } = useModal();
  
  // State will now hold objects with amount and color
  const [budgets, setBudgets] = useState({});
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('');

  useEffect(() => {
    const initialBudgets = activeHome.finances.expenseCategories.reduce((acc, cat) => {
      acc[cat.name] = { 
        amount: cat.budgetAmount || '',
        color: cat.color || '#cccccc' 
      };
      return acc;
    }, {});
    setBudgets(initialBudgets);
  }, [activeHome.finances.expenseCategories]);

  const handleBudgetChange = (categoryName, field, value) => {
    setBudgets(prev => ({
      ...prev,
      [categoryName]: { ...prev[categoryName], [field]: value }
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = { ...budgets };
    if (newCatName && newCatAmount) {
      payload.__newCategory = { name: newCatName, amount: newCatAmount };
    }
    saveBudgets(payload);
    hideModal();
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  };

  const itemStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 120px 40px',
    gap: '10px',
    alignItems: 'center'
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h4>הגדר תקציב חודשי וצבע לכל קטגוריה:</h4>
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
              style={{ width: '40px', height: '35px', padding: '2px' }}
            />
          </div>
        ))}
      </div>
      <hr style={{margin: '10px 0'}} />
      <h4>הוסף קטגוריית תקציב חדשה</h4>
      <div style={itemStyle}>
          <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="שם קטגוריה חדשה" />
          <input type="number" value={newCatAmount} onChange={e => setNewCatAmount(e.target.value)} placeholder="סכום תקציב" />
      </div>
      <div className="modal-footer">
        <button type="submit" className="primary-action">שמור תקציבים</button>
      </div>
    </form>
  );
};

export default BudgetForm;