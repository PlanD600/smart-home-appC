// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/finance/PaidBillsList.jsx
import React, { useState, useMemo } from 'react';

function PaidBillsList({ finances }) {
    const [monthOffset, setMonthOffset] = useState(0);

    const monthlyData = useMemo(() => {
        const targetDate = new Date();
        targetDate.setDate(1);
        targetDate.setMonth(targetDate.getMonth() - monthOffset);

        const monthName = targetDate.toLocaleString('he-IL', { month: 'long', year: 'numeric' });

        const filteredBills = (finances.paidBills || [])
            .filter(bill => {
                const billDate = new Date(bill.datePaid);
                return billDate.getFullYear() === targetDate.getFullYear() && billDate.getMonth() === targetDate.getMonth();
            })
            .sort((a, b) => new Date(b.datePaid) - new Date(a.datePaid));
        
        return { monthName, filteredBills };
    }, [monthOffset, finances.paidBills]);

    const currency = finances.financeSettings?.currency || '₪';

    return (
        <div id="paid-bills-section">
            <div className="sub-section-header">
                <h4>תשלומים שבוצעו</h4>
                <div className="month-navigation">
                    <button className="header-style-button" onClick={() => setMonthOffset(monthOffset + 1)}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                    <span id="paid-bills-month-display">{monthlyData.monthName}</span>
                    <button 
                        className="header-style-button" 
                        onClick={() => setMonthOffset(monthOffset - 1)}
                        disabled={monthOffset <= 0}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                </div>
            </div>
            <div className="item-list">
                <ul id="paid-bills-ul">
                    {monthlyData.filteredBills.length > 0 ? monthlyData.filteredBills.map(bill => (
                        <li key={bill._id}>
                            <div className="item-text">
                                <span>{bill.text} - {bill.amount.toLocaleString()} {currency}</span>
                                <span className="item-details">
                                    שולם ב: {new Date(bill.datePaid).toLocaleDateString('he-IL')} | קטגוריה: {bill.category}
                                </span>
                            </div>
                            {/* אפשר להוסיף כפתור מחיקה או עריכה כאן בעתיד */}
                        </li>
                    )) : <p style={{textAlign: 'center'}}>אין תשלומים בחודש זה.</p>}
                </ul>
            </div>
        </div>
    );
}

export default PaidBillsList;