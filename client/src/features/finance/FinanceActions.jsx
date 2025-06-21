// client/src/features/finance/FinanceActions.jsx

import { useFinanceActions } from '../../context/FinanceActionsContext';
import { useModal } from '../../context/ModalContext';
// import { useHome } from '../../context/HomeContext'; // ✅ שורה זו הוסרה, אין בה צורך כאן

// ייבוא כל הטפסים
import BillForm from './forms/BillForm';
import IncomeForm from './forms/IncomeForm';
import SavingsGoalForm from './forms/SavingsGoalForm';
import BudgetForm from './forms/BudgetForm';

const FinanceActions = () => {
    const { showModal, hideModal } = useModal();
    
    // ✅ שלב 2: קבלת פונקציות השמירה מהקונטקסט
    const { 
        saveBill, 
        saveIncome, 
        saveSavingsGoal, 
        saveBudgets 
    } = useFinanceActions();

    // ✅ שלב 3: יצירת פונקציות handler שיודעות לשמור ולסגור
    const handleSaveBill = async (billData) => {
        await saveBill(billData);
        hideModal(); // סגור את המודאל רק לאחר שהשמירה הסתיימה
    };

    const handleSaveIncome = async (incomeData) => {
        await saveIncome(incomeData);
        hideModal();
    };

    const handleSaveSavingsGoal = async (goalData) => {
        await saveSavingsGoal(goalData);
        hideModal();
    };
    
    const handleSaveBudgets = async (budgetsData) => {
        await saveBudgets(budgetsData);
        hideModal();
    };


    // ✅ שלב 4: חיבור הטפסים ל-handlers הנכונים
    const openAddBillModal = () => showModal(
        <BillForm onSave={handleSaveBill} onCancel={hideModal} />, 
        { title: 'הוספת חשבון חדש' }
    );
    const openAddIncomeModal = () => showModal(
        <IncomeForm onSave={handleSaveIncome} onCancel={hideModal} />, 
        { title: 'הוספת הכנסה חדשה' }
    );
    const openAddSavingsGoalModal = () => showModal(
        <SavingsGoalForm onSave={handleSaveSavingsGoal} onCancel={hideModal} />, 
        { title: 'הוספת יעד חיסכון' }
    );
    const openEditBudgetModal = () => showModal(
        <BudgetForm onSave={handleSaveBudgets} onCancel={hideModal} />, 
        { title: 'עריכת תקציב' }
    );

    return (
        <div className="p-4 bg-gray-50 rounded-lg mb-6 flex flex-wrap gap-3 justify-center">
            <button onClick={openAddBillModal} className="btn-primary">הוסף חשבון</button>
            <button onClick={openAddIncomeModal} className="btn-primary">הוסף הכנסה</button>
            <button onClick={openAddSavingsGoalModal} className="btn-secondary">הוסף יעד חיסכון</button>
            <button onClick={openEditBudgetModal} className="btn-secondary">ערוך תקציב</button>
        </div>
    );
};

export default FinanceActions;