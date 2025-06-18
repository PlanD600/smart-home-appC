import React from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import BudgetForm from './forms/BudgetForm';

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: currency }).format(amount);
};

const BudgetTracker = () => {
  const { activeHome } = useHome();
  const { openModal } = useModal();

  if (!activeHome || !activeHome.finances) {
    return null;
  }

  const { finances } = activeHome;
  const currency = finances.financeSettings?.currency || 'ILS';

  // *** התיקון נמצא כאן ***
  // אנחנו בודקים אם expenseCategories הוא מערך. אם לא, אנחנו מניחים שהוא אובייקט
  // והופכים אותו למערך של הערכים שלו באמצעות Object.values().
  const expenseCategoriesArray = Array.isArray(finances.expenseCategories)
    ? finances.expenseCategories
    : Object.values(finances.expenseCategories || {});

  // עכשיו, כשאנחנו בטוחים שיש לנו מערך, אפשר להשתמש ב-filter בבטחה.
  const budgetedCategories = expenseCategoriesArray.filter(category => category.budgetAmount > 0);

  // חישוב ההוצאות החודשיות לפי קטגוריה
  const monthlyExpenses = {};
  budgetedCategories.forEach(cat => {
    // השתמש בשם או במזהה, תלוי במבנה הנתונים שלך
    monthlyExpenses[cat.name] = 0; 
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  (finances.paidBills || []).forEach(bill => {
    const billDate = new Date(bill.datePaid);
    if (billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear) {
      if (monthlyExpenses[bill.category] !== undefined) {
        monthlyExpenses[bill.category] += bill.amount;
      }
    }
  });
  
  const totalBudget = budgetedCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0);
  const totalSpent = Object.values(monthlyExpenses).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">מעקב תקציב חודשי</h2>
          <button className="btn btn-primary btn-sm" onClick={() => openModal(<BudgetForm />)}>
            עדכון תקציב
          </button>
        </div>

        {budgetedCategories.length === 0 ? (
          <p>לא הוגדר תקציב לקטגוריות. לחץ על "עדכון תקציב" כדי להתחיל.</p>
        ) : (
          <>
            {/* Progress bar for overall budget */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>סה"כ הוצאות: {formatCurrency(totalSpent, currency)}</span>
                <span>סה"כ תקציב: {formatCurrency(totalBudget, currency)}</span>
              </div>
              <progress 
                className="progress progress-accent w-full" 
                value={totalSpent} 
                max={totalBudget > 0 ? totalBudget : 1} // מניעת חלוקה באפס
              ></progress>
            </div>
            
            {/* Individual category trackers */}
            <div className="space-y-3">
              {budgetedCategories.map(({ name, budgetAmount }) => { // הסרתי את color כדי לפשט
                const spent = monthlyExpenses[name] || 0;
                const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                
                let progressColorClass = 'progress-success';
                if (percentage > 75 && percentage <= 100) {
                  progressColorClass = 'progress-warning';
                } else if (percentage > 100) {
                  progressColorClass = 'progress-error';
                }

                return (
                  <div key={name}>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold">{name}</span>
                      <span>
                        {formatCurrency(spent, currency)} / {formatCurrency(budgetAmount, currency)}
                      </span>
                    </div>
                    <progress
                      className={`progress ${progressColorClass} w-full`}
                      value={spent}
                      max={budgetAmount}
                    ></progress>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;