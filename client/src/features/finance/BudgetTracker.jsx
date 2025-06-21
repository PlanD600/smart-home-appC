import React from 'react';
import { useAppContext } from '../../context/AppContext'; // ✅ נתיב מעודכן
import { useModal } from '../../context/ModalContext';
import BudgetForm from './forms/BudgetForm';
import { useLanguage } from '../../context/LanguageContext';
import translations from './translations'; 
import LoadingSpinner from '../../components/LoadingSpinner';

// פונקציית עיצוב המטבע נשארת כפי שהיא
const formatCurrency = (amount, currencySymbol) => {
    // ... (הקוד שלך נשאר זהה)
    const currencyMap = { 'ש"ח': 'ILS', '$': 'USD', '€': 'EUR' };
    const currencyCode = currencyMap[currencySymbol] || currencySymbol;
    try {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) return 'N/A';
        return new Intl.NumberFormat('he-IL', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericAmount);
    } catch (error) {
        console.error('Currency formatting error:', error);
        return `${amount} ${currencySymbol}`;
    }
};

const BudgetTracker = () => {
    // ✅ קבלת activeHome ו-loading מ-useAppContext
    const { activeHome, loading } = useAppContext();
    
    // ✅ ה-hook של המודאל מחזיר 'showModal', לא 'openModal'
    const { showModal } = useModal(); 
    const { language } = useLanguage();
    const t = translations[language] || translations['he']; // ברירת מחדל לעברית

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!activeHome?.finances) {
        return <div className="p-4 text-center text-gray-500">{t.noFinanceData}</div>;
    }

    // ✅ שלב 1: נוודא שאנחנו שולפים גם את 'paidBills' וגם את 'financeSettings'
    const { 
        budgets = [], 
        paidBills = [],
        expenseCategories = [],
        financeSettings
    } = activeHome.finances;
    
    const homeCurrency = financeSettings?.currency || 'ש"ח';

    const handleEditBudget = (budget) => {
        showModal(<BudgetForm existingBudget={budget} onSave={() => showModal(null)} onCancel={() => showModal(null)} />);
    };
    
    // ✅ שלב 2: תיקון הלוגיקה המרכזית. הפונקציה תסכום את ההוצאות מהחשבונות ששולמו.
    const getCategoryTotal = (categoryName) => {
        return paidBills
            .filter(bill => bill.category === categoryName)
            .reduce((sum, bill) => sum + bill.amount, 0);
    };
    
    const getCategoryColor = (categoryName) => {
        // המערך expenseCategories צריך להיות בשימוש כאן
        const category = expenseCategories.find(c => c.name === categoryName);
        return category ? category.color : '#cccccc';
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{t.budgetTracker}</h3>
            <div className="space-y-4">
                {budgets.length > 0 ? (
                    budgets.map((budget) => {
                        const spent = getCategoryTotal(budget.category);
                        const remaining = budget.amount - spent;
                        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                        const isOverBudget = remaining < 0;
                        const categoryColor = getCategoryColor(budget.category);

                        return (
                            <div key={budget.category} className="cursor-pointer" onClick={() => handleEditBudget(budget)}>
                                <div className="flex justify-between items-center mb-1 text-gray-700">
                                    <span className="font-semibold">{budget.category}</span>
                                    <span className="text-sm">
                                        {formatCurrency(spent, homeCurrency)} / {formatCurrency(budget.amount, homeCurrency)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
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
                                    <span className="text-gray-600">{isOverBudget ? t.overBudget : t.remaining}</span>
                                    <span className={`${isOverBudget ? 'text-red-600' : 'text-green-600'} font-bold`}>
                                        {formatCurrency(remaining, homeCurrency)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500">{t.noBudgetsSet}</p>
                )}
            </div>
            <button
                onClick={() => showModal(<BudgetForm onSave={() => showModal(null)} onCancel={() => showModal(null)} />)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                {t.addNewBudget}
            </button>
        </div>
    );
};

export default BudgetTracker;