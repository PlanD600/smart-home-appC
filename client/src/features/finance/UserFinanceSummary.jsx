import React, { useState, useEffect } from 'react';
import { useHome } from '../../context/HomeContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserFinanceSummary = () => {
  const { activeHome, fetchUserMonthlyFinanceSummary, loading, error } = useHome();
  const [summaryData, setSummaryData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-indexed month
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const getSummary = async () => {
      if (activeHome?._id) {
        const data = await fetchUserMonthlyFinanceSummary(currentYear, currentMonth);
        setSummaryData(data);
      }
    };
    getSummary();
  }, [activeHome?._id, fetchUserMonthlyFinanceSummary, currentYear, currentMonth]);

  const handleMonthChange = (offset) => {
    const date = new Date(currentYear, currentMonth - 1); // JS month is 0-indexed
    date.setMonth(date.getMonth() + offset);
    setCurrentMonth(date.getMonth() + 1);
    setCurrentYear(date.getFullYear());
  };

  if (loading && !summaryData) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p style={{ color: 'var(--coral-red)', textAlign: 'center' }}>שגיאה בטעינת סיכום פיננסי: {error.message}</p>;
  }

  const hasSummaryData = summaryData && Object.keys(summaryData).some(user => user !== 'משותף' || summaryData[user].income > 0 || summaryData[user].expenses > 0);

  return (
    <div id="user-finance-summary-section">
      <div className="sub-section-header">
        <h4 data-lang-key="user_finance_summary">סיכום פיננסי לפי משתמש</h4>
        <div className="month-navigation">
          <button className="header-style-button" onClick={() => handleMonthChange(-1)}>
            <i className="fas fa-chevron-right"></i>
          </button>
          <span id="summary-month-display">
            {new Date(currentYear, currentMonth - 1).toLocaleString('he-IL', { month: 'long', year: 'numeric' })}
          </span>
          <button className="header-style-button" onClick={() => handleMonthChange(1)}>
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
      </div>

      {!hasSummaryData ? (
        <p style={{ textAlign: 'center', padding: '15px', color: '#777' }}>אין נתונים פיננסיים בחודש זה עבור משתמשים.</p>
      ) : (
        <div className="user-summary-grid">
          {Object.entries(summaryData).map(([user, data]) => (
            (data.income > 0 || data.expenses > 0) && ( // רק אם יש הכנסות או הוצאות
              <div key={user} className="summary-card">
                <h5>{user}</h5>
                <p>הכנסות: {data.income.toLocaleString()} {activeHome?.finances?.financeSettings?.currency}</p>
                <p>הוצאות: {data.expenses.toLocaleString()} {activeHome?.finances?.financeSettings?.currency}</p>
                <p className={data.net >= 0 ? 'positive' : 'negative'}>
                  נטו: {data.net.toLocaleString()} {activeHome?.finances?.financeSettings?.currency}
                </p>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFinanceSummary;