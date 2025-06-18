import React from 'react';
import { useModal } from '../../context/ModalContext';
import BudgetForm from './forms/BudgetForm';

const BudgetTracker = ({ paidBills, expenseCategories, currency }) => {
  const { showModal } = useModal();
  
  const openBudgetModal = () => showModal(<BudgetForm />, { title: 'ניהול תקציבים' });

  const now = new Date();
  const monthlyExpenses = paidBills
    .filter(bill => {
      const d = new Date(bill.datePaid);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, bill) => {
      acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
      return acc;
    }, {});

  // **תיקון קריטי: טיפול ב-expenseCategories כאובייקט**
  // ממיר את האובייקט למערך של [שם קטגוריה, סכום תקציב] שניתן לסנן ולמפות
  const budgetedCategories = Object.entries(expenseCategories || {}) // לוודא שזה אובייקט ולא null/undefined
    .filter(([categoryName, budgetAmount]) => budgetAmount > 0) // מסנן תקציבים מעל 0
    .map(([name, budgetAmount]) => ({ name, budgetAmount })); // ממיר בחזרה למבנה אובייקט לכל קטגוריה

  return (
    <div id="budget-tracking-section">
      <div className="sub-section-header">
        <h4 data-lang-key="monthly_budget_tracking">מעקב תקציב חודשי</h4>
        <button id="manage-budgets-btn" className="header-style-button" onClick={openBudgetModal}>
          <i className="fas fa-cogs"></i> <span className="btn-text">נהל תקציבים</span>
        </button>
      </div>
      <div id="budget-bars-container">
        {budgetedCategories.length > 0 ? (
          budgetedCategories.map(cat => {
            // cat הוא כעת אובייקט עם name ו-budgetAmount
            const spent = monthlyExpenses[cat.name] || 0;
            const budget = cat.budgetAmount;
            const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
            let colorClass = '';
            if (percentage >= 90) colorClass = 'high';
            else if (percentage >= 70) colorClass = 'medium';

            return (
              <div key={cat.name} className="budget-bar">
                <div className="budget-bar-info">
                  <span>{cat.name}</span>
                  <span>{spent.toLocaleString()} / {budget.toLocaleString()} {currency}</span>
                </div>
                <div className="budget-bar-progress">
                  <div className={`budget-bar-fill ${colorClass}`} style={{ width: `${percentage}%` }}>
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', color: '#777' }}>לא הוגדרו תקציבים. לחץ על "נהל תקציבים" כדי להתחיל.</p>
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;