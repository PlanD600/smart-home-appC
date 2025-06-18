import React from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import BudgetForm from './forms/BudgetForm';

// Helper to format currency
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
  // הקוד הקודם השתמש ב-Object.entries והתייחס ל-expenseCategories כאובייקט.
  // הקוד החדש מתייחס ל-expenseCategories כמערך של אובייקטים, כפי שהוא מגיע כעת מהשרת.
  // הוא פשוט מסנן את הקטגוריות שהוגדר להן תקציב.
  const budgetedCategories = (finances.expenseCategories || [])
    .filter(category => category.budgetAmount > 0);

  // חישוב ההוצאות החודשיות לפי קטגוריה
  const monthlyExpenses = {};
  budgetedCategories.forEach(cat => {
    monthlyExpenses[cat.name] = 0;
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  finances.paidBills.forEach(bill => {
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
                max={totalBudget}
              ></progress>
            </div>
            
            {/* Individual category trackers */}
            <div className="space-y-3">
              {budgetedCategories.map(({ name, budgetAmount, color }) => {
                const spent = monthlyExpenses[name] || 0;
                const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                
                let progressColor = 'progress-success'; // Green
                if (percentage > 75 && percentage <= 100) {
                    progressColor = 'progress-warning'; // Yellow
                } else if (percentage > 100) {
                    progressColor = 'progress-error'; // Red
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
                      className={`progress ${progressColor} w-full`}
                      value={spent}
                      max={budgetAmount}
                      style={{'--progress-color': color}} // Custom color for the bar
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