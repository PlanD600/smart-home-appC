import React from 'react';
import { useModal } from '@/context/ModalContext';
import BillForm from './forms/BillForm';
import IncomeForm from './forms/IncomeForm';
import SavingsGoalForm from './forms/SavingsGoalForm';
import BudgetForm from './forms/BudgetForm';

const FinanceActions = () => {
    const { showModal } = useModal();
    
    // These would trigger the API calls via context, which are already set up.
    const openAddBillModal = () => showModal(<BillForm />, { title: 'הוספת חשבון חדש' });
    const openAddIncomeModal = () => showModal(<IncomeForm />, { title: 'הוספת הכנסה חדשה' });
    const openAddSavingsGoalModal = () => showModal(<SavingsGoalForm />, { title: 'הוספת יעד חיסכון' });
    const openEditBudgetModal = () => showModal(<BudgetForm />, { title: 'עריכת תקציב' });

    return (
        <div className="finance-actions-bar">
            <button onClick={openAddBillModal} className="action-button">
                <i className="fas fa-receipt"></i><span>הוסף חשבון</span>
            </button>
            <button onClick={openAddIncomeModal} className="action-button">
                <i className="fas fa-hand-holding-usd"></i><span>הוסף הכנסה</span>
            </button>
            <button onClick={openAddSavingsGoalModal} className="action-button">
                <i className="fas fa-piggy-bank"></i><span>הוסף יעד</span>
            </button>
            <button onClick={openEditBudgetModal} className="action-button">
                 <i className="fas fa-sliders-h"></i><span>ערוך תקציב</span>
            </button>
        </div>
    );
};

export default FinanceActions;
