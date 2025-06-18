import React from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import BillForm from './forms/BillForm';
import LoadingSpinner from '../../components/LoadingSpinner';

const ExpectedBills = () => {
  const { activeHome, payExistingBill, deleteBill, loading } = useHome(); // עדכנתי handlePayBill ל-payExistingBill, ו-isLoading ל-loading
  const { showModal } = useModal();

  const openAddBillModal = () => {
    showModal(<BillForm />, { title: 'הוספת חשבון חדש' });
  };
  
  const openEditBillModal = (bill) => {
    showModal(<BillForm existingBill={bill} />, { title: 'עריכת חשבון' });
  };

  const handleDeleteClick = (bill) => {
    if (window.confirm(`האם למחוק את החשבון "${bill.text}"?`)) {
      deleteBill(bill._id);
    }
  };
  
  const bills = activeHome?.finances?.expectedBills || [];

  return (
    <div id="bills-section">
      <div className="sub-section-header">
        <h4 data-lang-key="expected_bills">חשבונות לתשלום</h4>
        <button id="add-expected-bill-btn" className="header-style-button" onClick={openAddBillModal}>
          <i className="fas fa-plus"></i> <span className="btn-text">הוסף חשבון</span>
        </button>
      </div>
      {loading && <LoadingSpinner />} {/* שימוש ב-loading מהקונטקסט */}
      <div className="item-list">
        <ul id="expected-bills-ul">
          {bills.length > 0 ? (
            bills.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(bill => (
              <li key={bill._id} className={bill.isUrgent ? 'urgent-item' : ''}>
                <div className="item-text">
                  <span>{bill.text} - {bill.amount} {activeHome?.finances?.financeSettings?.currency}</span> {/* הוספתי סימן שאלה עבור activeHome.finances.financeSettings כדי למנוע שגיאה */}
                  <span className="item-details">
                    לתשלום עד {new Date(bill.dueDate).toLocaleDateString('he-IL')} | קטגוריה: {bill.category}
                    {bill.recurring && ' | 🔄'}
                    {/* הוספת הצגת המשתמש המשויך */}
                    {bill.assignedTo && ` | משויך ל: ${bill.assignedTo}`}
                  </span>
                </div>
                <div className="item-actions">
                  <button className="action-btn pay-bill-btn" title="שלם חשבון" onClick={() => payExistingBill(bill._id)}>
                    <i className="fas fa-check"></i>
                  </button>
                  <button className="action-btn edit-bill-btn" title="ערוך" onClick={() => openEditBillModal(bill)}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="action-btn delete-bill-btn" title="מחק" onClick={() => handleDeleteClick(bill)}>
                    <i className="far fa-trash-alt"></i>
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li style={{ textAlign: 'center', padding: '15px', color: '#777' }}>אין חשבונות צפויים.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ExpectedBills;