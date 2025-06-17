import React from 'react';
import { useHome } from '../../context/HomeContext';
import FinancialSummary from './FinancialSummary';
import ExpenseChart from './ExpenseChart';
import ExpectedBills from './ExpectedBills';
import PaidBillsList from './PaidBillsList';
import BudgetTracker from './BudgetTracker';
import SavingsGoals from './SavingsGoals';
import IncomeList from './IncomeList';

const FinanceManagement = () => {
  const { activeHome } = useHome();

  if (!activeHome || !activeHome.finances) {
    return <div>טוען נתונים פיננסיים...</div>;
  }
  
  const { finances } = activeHome;
  const currency = finances.financeSettings?.currency || 'ש"ח';

  return (
    <section id="finance-management" className="list-section active">
      <div className="list-title-container">
        <h3><span data-lang-key="finance_management">ניהול כספים</span></h3>
      </div>
      <div className="finance-section-content">
        <FinancialSummary finances={finances} />
        <hr />
        <ExpenseChart paidBills={finances.paidBills} currency={currency} />
        <hr />
        <ExpectedBills />
        <hr />
        <BudgetTracker paidBills={finances.paidBills} expenseCategories={finances.expenseCategories} currency={currency} />
        <hr />
        <SavingsGoals savingsGoals={finances.savingsGoals} currency={currency} />
        <hr />
        <PaidBillsList paidBills={finances.paidBills} currency={currency} />
        <hr />
        <IncomeList income={finances.income} currency={currency} />
      </div>
    </section>
  );
};

export default FinanceManagement;