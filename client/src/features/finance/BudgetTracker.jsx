import React from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import BudgetForm from './forms/BudgetForm';
import { useLanguage } from '../../context/LanguageContext';
import translations from './translations'; // הייבוא הזה יעבוד עכשיו

// פונקציית עיצוב המטבע העמידה שכתבנו קודם
const formatCurrency = (amount, currencySymbol) => {
  const currencyMap = {
    'ש"ח': 'ILS',
    '$': 'USD',
    '€': 'EUR',
  };
  const currencyCode = currencyMap[currencySymbol] || currencySymbol;
  try {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${amount} ${currencySymbol}`;
  }
};

const BudgetTracker = () => {
  const { activeHome, loading } = useHome();
  const { openModal } = useModal();
  const { language } = useLanguage();
  const t = translations[language];

  if (loading) {
    return <div>{t.loading}</div>;
  }

  if (!activeHome || !activeHome.finances) {
    return <div>{t.noFinanceData}</div>;
  }

  const { budgets = [], expenseCategories = [] } = activeHome.finances;
  const homeCurrency = activeHome.currency || 'ILS';

  const handleEditBudget = (budget) => {
    openModal(<BudgetForm existingBudget={budget} />);
  };

  const safeExpenseCategories = Array.isArray(expenseCategories) ? expenseCategories : [];

  const getCategoryTotal = (categoryName) => {
    const category = safeExpenseCategories.find(c => c.name === categoryName);
    return category ? category.totalAmount : 0;
  };

  const getCategoryColor = (categoryName) => {
    const category = safeExpenseCategories.find(c => c.name === categoryName);
    return category ? category.color : '#cccccc';
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-white">{t.budgetTracker}</h3>
      <div className="space-y-4">
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const spent = getCategoryTotal(budget.category);
            const remaining = budget.amount - spent;
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            const isOverBudget = remaining < 0;
            const categoryColor = getCategoryColor(budget.category);

            return (
              <div key={budget._id} className="text-white cursor-pointer" onClick={() => handleEditBudget(budget)}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{budget.category}</span>
                  <span>
                    {formatCurrency(spent, homeCurrency)} / {formatCurrency(budget.amount, homeCurrency)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: isOverBudget ? '#ef4444' : categoryColor
                    }}
                  ></div>
                   {isOverBudget && (
                    <div 
                      className="absolute h-full bg-red-500 opacity-50"
                      style={{ 
                        width: `${Math.min((Math.abs(remaining) / budget.amount) * 100, 100)}%`,
                        left: `${100}%`
                      }}
                    ></div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1 text-sm">
                  <span>{isOverBudget ? t.overBudget : t.remaining}</span>
                  <span className={`${isOverBudget ? 'text-red-500' : 'text-green-400'} font-bold`}>
                    {formatCurrency(remaining, homeCurrency)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400">{t.noBudgetsSet}</p>
        )}
      </div>
      <button 
        onClick={() => openModal(<BudgetForm />)}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        {t.addNewBudget}
      </button>
    </div>
  );
};

export default BudgetTracker;