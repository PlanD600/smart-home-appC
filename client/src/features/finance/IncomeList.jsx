// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/finance/IncomeList.jsx
import React from 'react';

function IncomeList({ finances, onAddIncome }) {
    
    const sortedIncome = [...(finances.income || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    const currency = finances.financeSettings?.currency || '₪';

    return (
        <div id="income-section">
            <div className="sub-section-header">
                <h4>הכנסות</h4>
                <button className="header-style-button" onClick={onAddIncome}>
                    <i className="fas fa-plus"></i> הוסף הכנסה
                </button>
            </div>
            <div className="item-list">
                <ul id="income-list-ul">
                     {sortedIncome.length > 0 ? sortedIncome.map(inc => (
                        <li key={inc._id}>
                             <div className="item-text">
                                <span>{inc.text} - {inc.amount.toLocaleString()} {currency}</span>
                                <span className="item-details">
                                    תאריך: {new Date(inc.date).toLocaleDateString('he-IL')}
                                    {inc.recurring && ` (קבוע ${inc.recurring.frequency === 'monthly' ? 'חודשי' : 'שנתי'})`}
                                </span>
                            </div>
                        </li>
                     )) : <p style={{textAlign: 'center'}}>לא הוזנו הכנסות.</p>}
                </ul>
            </div>
        </div>
    );
}

export default IncomeList;