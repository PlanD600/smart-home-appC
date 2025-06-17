// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/finance/FinanceManagement.jsx
import React from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext.jsx'; // <-- הנה התיקון!
import LoadingSpinner from '../../components/LoadingSpinner';
import FinancialSummary from './FinancialSummary';
import ExpenseChart from './ExpenseChart';
import ExpectedBills from './ExpectedBills';
import BudgetTracker from './BudgetTracker';
import SavingsGoals from './SavingsGoals';
import PaidBillsList from './PaidBillsList';  // ייבוא הרכיב החדש
import IncomeList from './IncomeList'; 
import BillForm from './forms/BillForm'; // ייבוא טופס החשבונות

function FinanceManagement() {
    const { currentHome, loading, updateCurrentHome } = useHome();
    const { openModal } = useModal(); // שימוש ב-Context של המודאל

    // אם המידע עדיין נטען, או שאין בית נבחר, נציג הודעה מתאימה
    if (loading && !currentHome) {
        return <LoadingSpinner />;
    }
    
    if (!currentHome || !currentHome.finances) {
        return <p>לא נמצא מידע פיננסי עבור בית זה.</p>;
    }

    const { finances } = currentHome;

const handleEditBill = (bill) => {
        // TODO: Open modal for adding/editing a bill
        console.log("Editing bill:", bill);
        openModal(<BillForm bill={bill} />);
    };
    
  //const handleManageBudgets = () => openModal(<h4>WIP: Budget Management Form</h4>);
  //const handleAddGoal = () => openModal(<h4>WIP: Savings Goal Form</h4>);
  //const handleAddIncome = () => openModal(<h4>WIP: Income Form</h4>);

    const handleManageBudgets = () => {
        // TODO: Open modal for managing budgets
        console.log("Managing budgets");
        alert("WIP: Modal for managing budgets");
    };

const handleActionPlaceholder = (action) => {
        alert(`WIP: Modal for ${action}`);
    };
    return (
        <section id="finance-management" className="list-section active">
            <div className="list-title-container">
                <h3>ניהול כספים</h3>
            </div>

            <div className="finance-section-content">
                {/* רכיב כרטיסיות הסיכום */}
                <FinancialSummary 
                    income={finances.income} 
                    paidBills={finances.paidBills} 
                    settings={finances.financeSettings} 
                />
                
                <hr />
                
                {/* רכיב הגרפים */}
                <ExpenseChart 
                    paidBills={finances.paidBills} 
                    expenseCategories={finances.expenseCategories}
                    settings={finances.financeSettings}
                />
                <ExpectedBills finances={finances} onEditBill={handleEditBill} />
                <hr />
                <BudgetTracker finances={finances} onManageBudgets={handleManageBudgets} />
                <hr />
                <PaidBillsList finances={finances} />
                <hr />
                <SavingsGoals finances={finances} onAddGoal={() => handleActionPlaceholder("adding savings goal")} />
                <hr />
                <IncomeList finances={finances} onAddIncome={() => handleActionPlaceholder("adding income")} />
                <hr />

                <p style={{textAlign: 'center', color: '#888'}}>בקרוב: חשבונות לתשלום, מעקב תקציב ויעדי חיסכון...</p>

            </div>
        </section>
    );
}

export default FinanceManagement;