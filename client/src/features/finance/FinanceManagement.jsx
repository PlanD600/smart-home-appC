import React, { useContext } from 'react';
import { HomeContext } from '../../context/HomeContext.jsx';
import FinancialSummary from './FinancialSummary.jsx';
import ExpenseChart from './ExpenseChart.jsx';
import BudgetTracker from './BudgetTracker.jsx';
import SavingsGoals from './SavingsGoals.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function FinanceManagement() {
  const { activeHome } = useContext(HomeContext);

  // בזמן שהנתונים נטענים, נציג אנימציה
  if (!activeHome || !activeHome.finances) {
    return <LoadingSpinner />;
  }

  // שולפים את המידע הפיננסי מתוך הבית הפעיל
  const { expectedBills, paidBills, income } = activeHome.finances;

  return (
    <section id="finance-management" className="list-section active">
      <div className="list-title-container">
        <h3><span data-lang-key="finance_management">ניהול כספים</span></h3>
      </div>

      <div className="finance-section-content">
        {/* יציג את 4 הריבועים בראש העמוד */}
        <FinancialSummary />
        
        {/* יציג את גרף ההוצאות */}
        <ExpenseChart />

        {/* חשבונות לתשלום */}
        <div id="bills-section">
          <div className="sub-section-header">
            <h4 data-lang-key="expected_bills">חשבונות לתשלום (חיובים צפויים)</h4>
            <button id="add-expected-bill-btn" className="header-style-button"><i className="fas fa-plus"></i> <span className="btn-text">הוסף חשבון</span></button>
          </div>
          <div className="item-list">
            <ul id="expected-bills-ul">
              {expectedBills && expectedBills.length > 0 ? (
                expectedBills.map(bill => <li key={bill._id}>{bill.text} - {bill.amount} ש"ח</li>)
              ) : (
                <li>אין חיובים צפויים.</li>
              )}
            </ul>
          </div>
        </div>
        <hr />

        {/* מעקב תקציב */}
        <BudgetTracker />
        <hr />

        {/* יעדי חיסכון */}
        <SavingsGoals />
        <hr />
        
        {/* תשלומים שבוצעו */}
        <div id="paid-bills-section">
          <div className="sub-section-header">
            <h4 data-lang-key="paid_bills">תשלומים שבוצעו</h4>
            {/* נוסיף את ניווט החודשים בהמשך */}
          </div>
          <div className="item-list">
            <ul id="paid-bills-ul">
              {paidBills && paidBills.length > 0 ? (
                paidBills.map(bill => <li key={bill._id}>{bill.text} - {bill.amount} ש"ח</li>)
              ) : (
                <li>לא בוצעו תשלומים.</li>
              )}
            </ul>
          </div>
        </div>
        <hr />

        {/* הכנסות */}
        <div id="income-section">
          <div className="sub-section-header">
            <h4 data-lang-key="income">הכנסות</h4>
            <button id="add-income-btn" className="header-style-button"><i className="fas fa-plus"></i> <span className="btn-text">הוסף הכנסה</span></button>
          </div>
          <div className="item-list">
            <ul id="income-list-ul">
              {income && income.length > 0 ? (
                income.map(inc => <li key={inc._id}>{inc.text} - {inc.amount} ש"ח</li>)
              ) : (
                <li>אין הכנסות.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinanceManagement;