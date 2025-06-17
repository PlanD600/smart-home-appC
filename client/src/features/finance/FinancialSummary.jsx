import React from 'react';

const FinancialSummary = ({ finances }) => {
  const { income, paidBills, financeSettings } = finances;
  const currency = financeSettings?.currency || 'ש"ח';

  // Helper function to get totals for the current month
  const getMonthlyTotals = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalIncome = income
      .filter(i => {
        const d = new Date(i.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, i) => sum + i.amount, 0);

    const totalExpenses = paidBills
      .filter(p => {
        const d = new Date(p.datePaid);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, (balance / totalIncome) * 100) : 0;

    return { totalIncome, totalExpenses, balance, savingsRate };
  };

  const { totalIncome, totalExpenses, balance, savingsRate } = getMonthlyTotals();

  // The classNames are taken from your style.css
  return (
    <div className="financial-summary-grid">
      <div className="summary-card">
        <h5>סך הכנסות (החודש)</h5>
        <p className="positive">{totalIncome.toLocaleString()} {currency}</p>
      </div>
      <div className="summary-card">
        <h5>סך הוצאות (החודש)</h5>
        <p className="negative">{totalExpenses.toLocaleString()} {currency}</p>
      </div>
      <div className={`summary-card ${balance >= 0 ? 'positive' : 'negative'}`}>
        <h5>מאזן</h5>
        <p>{balance.toLocaleString()} {currency}</p>
      </div>
      <div className="summary-card">
        <h5>שיעור חיסכון</h5>
        <p>{savingsRate.toFixed(0)}%</p>
      </div>
    </div>
  );
};

export default FinancialSummary;