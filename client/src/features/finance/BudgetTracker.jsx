// client/src/features/finance/BudgetTracker.jsx

import React, { useMemo } from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import BudgetForm from './forms/BudgetForm';

// פונקציית עזר קטנה לעיצוב מטבע, מחוץ לקומפוננטה
const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: currency }).format(amount);
};

const BudgetTracker = () => {
  const { activeHome } = useHome();
  const { showModal } = useModal();

  // 1. שימוש ב-useMemo כדי לחלץ ולנרמל את הנתונים רק פעם אחת (או כשהם משתנים)
  const finances = useMemo(() => activeHome?.finances || {}, [activeHome?.finances]);
  
  const categories = useMemo(() => {
    const expenseCats = finances.expenseCategories || [];
    return Array.isArray(expenseCats) ? expenseCats : Object.values(expenseCats);
  }, [finances.expenseCategories]);

  const budgetedCategories = useMemo(() => {
    return categories.filter(category => category.budgetAmount > 0);
  }, [categories]);

  // 2. חישוב ההוצאות החודשיות - החישוב היקר ביותר, עטוף ב-useMemo
  const monthlySpentByCategory = useMemo(() => {
    const spentMap = new Map(categories.map(cat => [cat.name, 0]));
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    (finances.paidBills || []).forEach(bill => {
      const billDate = new Date(bill.datePaid);
      if (billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear) {
        if (spentMap.has(bill.category)) {
          spentMap.set(bill.category, spentMap.get(bill.category) + bill.amount);
        }
      }
    });
    return spentMap;
  }, [categories, finances.paidBills]);

  // 3. חישוב הסכומים הכוללים - גם כן ממור"ז (memoized)
  const { totalBudget, totalSpent } = useMemo(() => {
    const budget = budgetedCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0);
    const spent = Array.from(monthlySpentByCategory.values()).reduce((sum, amount) => sum + amount, 0);
    return { totalBudget: budget, totalSpent: spent };
  }, [budgetedCategories, monthlySpentByCategory]);

  const currency = finances.financeSettings?.currency || 'ILS';

  // תנאי יציאה מוקדמת אם אין מידע פיננסי
  if (!activeHome || !finances) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">מעקב תקציב חודשי</h2>
          <button className="btn btn-primary btn-sm" onClick={() => showModal(<BudgetForm />)}>
            עדכון תקציב
          </button>
        </div>

        {budgetedCategories.length === 0 ? (
          <p>לא הוגדר תקציב לקטגוריות. לחץ על "עדכון תקציב" כדי להתחיל.</p>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>סה"כ הוצאות: {formatCurrency(totalSpent, currency)}</span>
                <span>סה"כ תקציב: {formatCurrency(totalBudget, currency)}</span>
              </div>
              <progress 
                className="progress progress-accent w-full" 
                value={totalSpent} 
                max={totalBudget > 0 ? totalBudget : 1}
              ></progress>
            </div>
            
            <div className="space-y-3">
              {budgetedCategories.map(({ name, budgetAmount }) => {
                const spent = monthlySpentByCategory.get(name) || 0;
                const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                
                let progressColorClass = 'progress-success';
                if (percentage > 100) progressColorClass = 'progress-error';
                else if (percentage > 75) progressColorClass = 'progress-warning';

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
                      max={budgetAmount > 0 ? budgetAmount : 1}
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