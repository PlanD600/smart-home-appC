import React, { useContext, useMemo } from 'react';
import HomeContext from '../../context/HomeContext.jsx';

function BudgetTracker() {
  const { activeHome, openModal } = useContext(HomeContext);

  const handleManageBudgets = () => {
    // נממש את פתיחת המודל בשלב הבא, כרגע נוסיף התראה
    alert('פונקציונליות ניהול תקציבים תמומש בקרוב!');
  };

  // לוגיקת חישוב ההוצאות החודשיות לכל קטגוריה
  const monthlyExpenses = useMemo(() => {
    if (!activeHome || !activeHome.finances) return {};

    const expenses = {};
    const now = new Date();
    activeHome.finances.paidBills.forEach(bill => {
      const billDate = new Date(bill.datePaid);
      if (billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear()) {
        expenses[bill.category] = (expenses[bill.category] || 0) + bill.amount;
      }
    });
    return expenses;
  }, [activeHome]);
  
  if (!activeHome || !activeHome.finances) return null;

  const budgetedCategories = activeHome.finances.expenseCategories.filter(cat => cat.budgetAmount > 0);

  return (
    <div id="budget-tracking-section">
      <div className="sub-section-header">
        <h4 data-lang-key="monthly_budget_tracking">מעקב תקציב חודשי</h4>
        <button id="manage-budgets-btn" className="header-style-button" onClick={handleManageBudgets}>
          <i className="fas fa-cogs"></i> <span className="btn-text">נהל תקציבים</span>
        </button>
      </div>
      <div id="budget-bars-container">
        {budgetedCategories.length > 0 ? (
          budgetedCategories.map(cat => {
            const spent = monthlyExpenses[cat.name] || 0;
            const budget = cat.budgetAmount;
            const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
            
            let colorClass = '';
            if (percentage >= 90) colorClass = 'high';
            else if (percentage >= 70) colorClass = 'medium';

            return (
              <div key={cat._id || cat.name} className="budget-bar">
                <div className="budget-bar-info">
                  <span>{cat.name}</span>
                  <span>{spent.toLocaleString()} / {budget.toLocaleString()} {activeHome.finances.financeSettings.currency}</span>
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
          <p style={{ textAlign: 'center', color: '#777' }}>לא הוגדרו תקציבים.</p>
        )}
      </div>
    </div>
  );
}

export default BudgetTracker;