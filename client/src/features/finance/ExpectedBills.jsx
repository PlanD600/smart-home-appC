import React, { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';
import BillForm from './forms/BillForm';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A utility function to determine the status of a bill based on its due date.
 * @param {string | Date} dueDate - The due date of the bill.
 * @returns {{status: 'overdue' | 'due-soon' | 'normal', text: string, className: string}}
 */
const getBillStatus = (dueDate) => {
    const today = new Date();
    const billDate = new Date(dueDate);
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
    billDate.setHours(0, 0, 0, 0); // Normalize bill date

    const diffTime = billDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { status: 'overdue', text: 'עבר התאריך', className: 'status-overdue' };
    }
    if (diffDays <= 7) {
        return { status: 'due-soon', text: `בעוד ${diffDays} ימים`, className: 'status-due-soon' };
    }
    return { status: 'normal', text: billDate.toLocaleDateString('he-IL'), className: 'status-normal' };
};


const ExpectedBills = () => {
  const { activeHome } = useAppContext(); 
  const { payExistingBill, deleteBill, loading } = useFinanceActions();
  const { showModal, showConfirmModal } = useModal();

  const openEditBillModal = (bill) => {
    showModal(<BillForm initialData={bill} />, { title: 'עריכת חשבון' });
  };
  
  const handleDeleteClick = (bill) => {
    showConfirmModal(`האם למחוק את החשבון "${bill.text}"?`, () => {
      deleteBill(bill._id);
    });
  };
  
  const bills = useMemo(() => {
      const unsortedBills = activeHome?.finances?.expectedBills || [];
      // Sort bills by due date, ascending
      return [...unsortedBills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [activeHome?.finances?.expectedBills]);
  
  const currency = activeHome?.finances?.financeSettings?.currency || 'ש"ח';

  return (
    <div className="expected-bills-list">
        {loading && !bills.length ? (
            <LoadingSpinner text="טוען חשבונות..." />
        ) : bills.length === 0 ? (
            <div className="no-items-message">
                <i className="fas fa-check-circle"></i>
                <p>נהדר! אין חשבונות צפויים לתשלום.</p>
            </div>
        ) : (
            <ul>
                {bills.map(bill => {
                    const status = getBillStatus(bill.dueDate);
                    return (
                        <li key={bill._id} className="bill-item">
                            <div className={`status-indicator ${status.className}`}></div>
                            <div className="bill-details">
                                <span className="bill-text">{bill.text}</span>
                                <span className="bill-category">{bill.category}</span>
                            </div>
                            <div className="bill-info">
                                <span className="bill-amount">{bill.amount.toLocaleString()} {currency}</span>
                                <span className={`bill-due-date ${status.className}`}>{status.text}</span>
                            </div>
                            <div className="bill-actions">
                                <button className="action-btn pay-btn" title="שלם חשבון" onClick={() => payExistingBill(bill._id)} disabled={loading}>
                                  <i className="fas fa-check"></i>
                                </button>
                                <button className="action-btn edit-btn" title="ערוך" onClick={() => openEditBillModal(bill)} disabled={loading}>
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="action-btn delete-btn" title="מחק" onClick={() => handleDeleteClick(bill)} disabled={loading}>
                                  <i className="far fa-trash-alt"></i>
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        )}
    </div>
  );
};

export default ExpectedBills;
