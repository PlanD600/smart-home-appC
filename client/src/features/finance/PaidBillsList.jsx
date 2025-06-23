import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A component that displays a list of paid bills, with navigation to view past months.
 */
const PaidBillsList = () => {
    const { activeHome, loading } = useAppContext();
    const [monthOffset, setMonthOffset] = useState(0);

    const { paidBills = [], financeSettings } = activeHome?.finances || {};
    const currency = financeSettings?.currency || 'ש"ח';

    /**
     * Memoized calculation for filtering and sorting bills for the selected month.
     */
    const monthlyData = useMemo(() => {
        const targetDate = new Date();
        targetDate.setDate(1); // Avoid issues with different day numbers
        targetDate.setMonth(targetDate.getMonth() - monthOffset);

        const filtered = paidBills
            .filter(bill => {
                const billDate = new Date(bill.datePaid);
                return billDate.getMonth() === targetDate.getMonth() && billDate.getFullYear() === targetDate.getFullYear();
            })
            .sort((a, b) => new Date(b.datePaid) - new Date(a.datePaid));
        
        const total = filtered.reduce((sum, bill) => sum + bill.amount, 0);

        return {
            displayDate: targetDate.toLocaleString('he-IL', { month: 'long', year: 'numeric' }),
            bills: filtered,
            total,
        };
    }, [paidBills, monthOffset]);

    return (
        <div className="paid-bills-container">
            <header className="paid-bills-header">
                <div className="month-navigation">
                    <button 
                        className="nav-btn" 
                        onClick={() => setMonthOffset(prev => prev + 1)}
                        disabled={loading}
                        aria-label="Previous month"
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                    <span className="month-display">
                        {monthlyData.displayDate}
                    </span>
                    <button 
                        className="nav-btn" 
                        onClick={() => setMonthOffset(prev => Math.max(0, prev - 1))} 
                        disabled={monthOffset === 0 || loading}
                        aria-label="Next month"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                </div>
            </header>
            
            <div className="paid-bills-list-wrapper">
                {loading && monthlyData.bills.length === 0 ? (
                    <LoadingSpinner />
                ) : monthlyData.bills.length === 0 ? (
                    <div className="no-items-message">
                         <i className="fas fa-file-invoice-dollar"></i>
                        <p>אין תשלומים בחודש זה.</p>
                    </div>
                ) : (
                    <ul>
                        {monthlyData.bills.map(bill => (
                            <li key={bill._id} className="paid-bill-item">
                                <div className="bill-icon">
                                    <i className="fas fa-receipt"></i>
                                </div>
                                <div className="bill-details">
                                    <span className="bill-text">{bill.text}</span>
                                    <span className="bill-category">{new Date(bill.datePaid).toLocaleDateString('he-IL')} • {bill.category}</span>
                                </div>
                                <div className="bill-amount">
                                    - {bill.amount.toLocaleString()} {currency}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

             <footer className="paid-bills-footer">
                <span>סה"כ הוצאות לחודש:</span>
                <span className="total-amount">
                    {monthlyData.total.toLocaleString()} {currency}
                </span>
            </footer>
        </div>
    );
};

export default PaidBillsList;
