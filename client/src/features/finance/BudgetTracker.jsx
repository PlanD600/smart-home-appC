// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/finance/BudgetTracker.jsx
import React, { useMemo } from 'react';

function BudgetTracker({ finances, onManageBudgets }) {
    
    const budgetData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 1. חשב כמה הוצאנו החודש בכל קטגוריה
        const monthlyExpenses = (finances.paidBills || []).reduce((acc, bill) => {
            const billDate = new Date(bill.datePaid);
            if (billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear) {
                acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
            }
            return acc;
        }, {});

        // 2. צור את המידע עבור כל פס התקדמות
        return (finances.expenseCategories || [])
            .filter(cat => cat.budgetAmount > 0) // הצג רק קטגוריות עם תקציב
            .map(cat => {
                const spent = monthlyExpenses[cat.name] || 0;
                const budget = cat.budgetAmount;
                const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                
                let colorClass = '';
                if (percentage >= 90) colorClass = 'high';
                else if (percentage >= 70) colorClass = 'medium';

                return {
                    id: cat._id,
                    name: cat.name,
                    spent,
                    budget,
                    percentage,
                    colorClass
                };
            });

    }, [finances.paidBills, finances.expenseCategories]);
    
    const currency = finances.financeSettings?.currency || '₪';

    return (
        <div id="budget-tracking-section">
            <div className="sub-section-header">
                <h4>מעקב תקציב חודשי</h4>
                <button className="header-style-button" onClick={onManageBudgets}>
                    <i className="fas fa-cogs"></i> נהל תקציבים
                </button>
            </div>
            <div id="budget-bars-container">
                {budgetData.length > 0 ? budgetData.map(bar => (
                    <div key={bar.id} className="budget-bar">
                        <div className="budget-bar-info">
                            <span>{bar.name}</span>
                            <span>{bar.spent.toLocaleString()} / {bar.budget.toLocaleString()} {currency}</span>
                        </div>
                        <div className="budget-bar-progress" role="progressbar" aria-valuenow={bar.percentage.toFixed(0)}>
                            <div 
                                className={`budget-bar-fill ${bar.colorClass}`} 
                                style={{ width: `${bar.percentage}%` }}
                            >
                                {bar.percentage.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                )) : <p style={{textAlign: 'center'}}>לא הוגדרו תקציבים. לחץ על "נהל תקציבים".</p>}
            </div>
        </div>
    );
}

export default BudgetTracker;