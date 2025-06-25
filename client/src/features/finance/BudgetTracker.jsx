import React, { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import BudgetForm from './forms/BudgetForm';
import LoadingSpinner from '@/components/LoadingSpinner';

const BudgetCategoryBar = ({ category, spent, budget, currency, onEdit }) => {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const isOverBudget = spent > budget;

    const getBarColor = () => {
        if (isOverBudget) return '#ef4444';
        if (percentage > 80) return '#f59e0b';
        return '#22c55e';
    };

    return (
        <div className="budget-category-bar" onClick={onEdit} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onEdit()}>
            <div className="bar-info">
                <span className="category-name">{category.name}</span>
                <span className="category-amount">
                    {spent.toLocaleString()} / {budget.toLocaleString()} {currency}
                </span>
            </div>
            <div className="progress-track">
                <div 
                    className="progress-fill" 
                    style={{ 
                        width: `${Math.min(percentage, 100)}%`, 
                        backgroundColor: getBarColor() 
                    }}
                ></div>
                {isOverBudget && (
                     <div 
                        className="over-budget-indicator"
                        style={{ width: `100%` }}
                     ></div>
                )}
            </div>
            <div className="bar-footer">
                <span className={`remaining-amount ${isOverBudget ? 'over' : ''}`}>
                    {isOverBudget 
                        ? `חריגה של ${(spent - budget).toLocaleString()}`
                        : `נותרו ${(budget - spent).toLocaleString()}`
                    }
                </span>
            </div>
        </div>
    );
};

const BudgetTracker = () => {
    const { activeHome, loading } = useAppContext();
    const { showModal } = useModal();

    const { 
        paidBills = [],
        expenseCategories = [],
        financeSettings
    } = activeHome?.finances || {};

    const currency = financeSettings?.currency || 'ש"ח';

    const categoryTotals = useMemo(() => {
        const now = new Date();
        return paidBills
            .filter(bill => {
                const billDate = new Date(bill.datePaid);
                return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
            })
            .reduce((acc, bill) => {
                acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
                return acc;
            }, {});
    }, [paidBills]);

    const openEditBudgetModal = () => {
        showModal(<BudgetForm />, { title: 'עריכת תקציבים' });
    };

    const budgetsToDisplay = expenseCategories.filter(cat => cat.budgetAmount > 0);

    return (
        <div className="budget-tracker-container">
            <div className="budget-bars-list">
                {loading && budgetsToDisplay.length === 0 ? (
                    <LoadingSpinner />
                ) : budgetsToDisplay.length === 0 ? (
                    <div className="no-items-message">
                        <i className="fas fa-chart-pie"></i>
                        <p>לא הוגדרו תקציבים.</p>
                    </div>
                ) : (
                    budgetsToDisplay.map(cat => (
                        <BudgetCategoryBar 
                            key={cat.name}
                            category={cat}
                            spent={categoryTotals[cat.name] || 0}
                            budget={cat.budgetAmount}
                            currency={currency}
                            onEdit={openEditBudgetModal}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default BudgetTracker;