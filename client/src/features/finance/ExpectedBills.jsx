// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/finance/ExpectedBills.jsx
import React from 'react';
import { useHome } from '../../context/HomeContext';

function ExpectedBills({ finances, onEditBill }) {
    const { currentHome, updateCurrentHome } = useHome();

    const handlePayBill = (billId) => {
        if (!currentHome) return;

        const { expectedBills, paidBills } = finances;
        const billToPay = expectedBills.find(b => b._id.toString() === billId);

        if (!billToPay) return;

        // 1. הסר את החשבון מהרשימה לתשלום
        let updatedExpected = expectedBills.filter(b => b._id.toString() !== billId);

        // 2. הוסף אותו לרשימת החשבונות ששולמו
        const newPaidBill = {
            text: billToPay.text,
            amount: billToPay.amount,
            category: billToPay.category,
            assignedTo: billToPay.assignedTo,
            comment: billToPay.comment,
            datePaid: new Date().toISOString(), // תאריך התשלום הוא היום
        };
        const updatedPaid = [...paidBills, newPaidBill];

        // 3. אם החשבון הוא קבוע, צור את החשבון הבא
        if (billToPay.recurring && billToPay.recurring.frequency) {
            const nextDueDate = new Date(billToPay.dueDate);
            if (billToPay.recurring.frequency === 'monthly') {
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            } else if (billToPay.recurring.frequency === 'yearly') {
                nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            }

            const newRecurringBill = {
                ...billToPay,
                _id: undefined, // Mongoose ייתן ID חדש
                dueDate: nextDueDate.toISOString(),
                isUrgent: false,
            };
            updatedExpected.push(newRecurringBill);
        }

        // 4. עדכן את השרת עם כל השינויים
        updateCurrentHome({
            finances: {
                ...finances,
                expectedBills: updatedExpected,
                paidBills: updatedPaid,
            }
        });
    };
    
    const handleDeleteBill = (billId) => {
        const updatedExpected = finances.expectedBills.filter(b => b._id.toString() !== billId);
        updateCurrentHome({
            finances: { ...finances, expectedBills: updatedExpected }
        });
    }

    const sortedBills = [...(finances.expectedBills || [])].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return (
        <div id="bills-section">
            <div className="sub-section-header">
                <h4>חשבונות לתשלום</h4>
                <button className="header-style-button" onClick={() => onEditBill(null)}>
                    <i className="fas fa-plus"></i> הוסף חשבון
                </button>
            </div>
            <div className="item-list">
                <ul id="expected-bills-ul">
                    {sortedBills.length > 0 ? sortedBills.map(bill => (
                        <li key={bill._id} className={bill.isUrgent ? 'urgent-item' : ''}>
                             <div className="item-text">
                                <span>{bill.text} - {bill.amount} {finances.financeSettings?.currency}</span>
                                <span className="item-details">
                                    לתשלום עד {new Date(bill.dueDate).toLocaleDateString('he-IL')} | קטגוריה: {bill.category}
                                </span>
                            </div>
                            <div className="item-actions">
                                <button className="action-btn pay-bill-btn" title="שלם חשבון" onClick={() => handlePayBill(bill._id)}>
                                    <i className="fas fa-check"></i>
                                </button>
                                <button className="action-btn edit-bill-btn" title="ערוך" onClick={() => onEditBill(bill)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="action-btn delete-bill-btn" title="מחק" onClick={() => handleDeleteBill(bill._id)}>
                                    <i className="far fa-trash-alt"></i>
                                </button>
                            </div>
                        </li>
                    )) : <p style={{textAlign: 'center'}}>אין חשבונות צפויים לתשלום.</p>}
                </ul>
            </div>
        </div>
    );
}

export default ExpectedBills;