import React, { useState } from 'react';

const PaidBillsList = ({ paidBills, currency }) => {
  const [monthOffset, setMonthOffset] = useState(0);

  const getTargetMonth = () => {
    const date = new Date();
    date.setDate(1); // Avoid issues with day numbers
    date.setMonth(date.getMonth() - monthOffset);
    return date;
  };

  const targetDate = getTargetMonth();

  const filteredBills = paidBills
    .filter(bill => {
      const billDate = new Date(bill.datePaid);
      return billDate.getMonth() === targetDate.getMonth() && billDate.getFullYear() === targetDate.getFullYear();
    })
    .sort((a, b) => new Date(b.datePaid) - new Date(a.datePaid));

  return (
    <div id="paid-bills-section">
      <div className="sub-section-header">
        <h4 data-lang-key="paid_bills">תשלומים שבוצעו</h4>
        <div className="month-navigation">
          <button id="paid-bills-prev-month" className="header-style-button" onClick={() => setMonthOffset(prev => prev + 1)}>
            <i className="fas fa-chevron-right"></i>
          </button>
          <span id="paid-bills-month-display">
            {targetDate.toLocaleString('he-IL', { month: 'long', year: 'numeric' })}
          </span>
          <button id="paid-bills-next-month" className="header-style-button" onClick={() => setMonthOffset(prev => Math.max(0, prev - 1))} disabled={monthOffset === 0}>
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
      </div>
      <div className="item-list">
        <ul id="paid-bills-ul">
          {filteredBills.length > 0 ? (
            filteredBills.map(bill => (
              <li key={bill._id}>
                <div className="item-text">
                  <span>{bill.text} - {bill.amount.toLocaleString()} {currency}</span>
                  <span className="item-details">
                    שולם ב: {new Date(bill.datePaid).toLocaleDateString('he-IL')} | קטגוריה: {bill.category}
                    {/* הוספת הצגת המשתמש המשויך */}
                    {bill.assignedTo && ` | שולם ע"י: ${bill.assignedTo}`}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li style={{ textAlign: 'center', padding: '15px', color: '#777' }}>אין תשלומים בחודש זה.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PaidBillsList;