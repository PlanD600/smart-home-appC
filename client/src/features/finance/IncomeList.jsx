import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';
import IncomeForm from './forms/IncomeForm';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A component that displays a list of income transactions for the home.
 */
const IncomeList = () => {
    const { activeHome, loading } = useAppContext();
    const { saveIncome } = useFinanceActions(); // We'll use this for the form
    const { showModal } = useModal();
    const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc', 'amount_desc'

    const openAddIncomeModal = () => {
        showModal(<IncomeForm onSuccess={saveIncome} />, { title: 'הוספת הכנסה חדשה' });
    };

    const incomeList = activeHome?.finances?.income || [];
    const currency = activeHome?.finances?.financeSettings?.currency || 'ש"ח';

    const processedList = useMemo(() => {
        const sorted = [...incomeList];
        if (sortBy === 'date_desc') {
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortBy === 'amount_desc') {
            sorted.sort((a, b) => b.amount - a.amount);
        }
        return sorted;
    }, [incomeList, sortBy]);
    
    const totalIncome = useMemo(() => {
        return incomeList.reduce((sum, inc) => sum + inc.amount, 0);
    }, [incomeList]);

    return (
        <div className="income-list-container">
            <header className="income-list-header">
                <div className="control-group">
                    <label htmlFor="income-sort-by">מיין לפי:</label>
                    <select id="income-sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} disabled={loading}>
                        <option value="date_desc">החדש ביותר</option>
                        <option value="amount_desc">הסכום הגבוה ביותר</option>
                    </select>
                </div>
                 <button onClick={openAddIncomeModal} className="add-income-btn" disabled={loading}>
                    <i className="fas fa-plus"></i>
                </button>
            </header>
            
            <div className="income-items-wrapper">
                {loading && processedList.length === 0 ? (
                    <LoadingSpinner />
                ) : processedList.length === 0 ? (
                    <div className="no-items-message">
                        <i className="fas fa-search-dollar"></i>
                        <p>לא הוזנו הכנסות.</p>
                    </div>
                ) : (
                    <ul>
                        {processedList.map(inc => (
                            <li key={inc._id} className="income-item">
                                <div className="income-icon">
                                    <i className="fas fa-long-arrow-alt-up"></i>
                                </div>
                                <div className="income-details">
                                    <span className="income-text">{inc.text}</span>
                                    <span className="income-date">{new Date(inc.date).toLocaleDateString('he-IL')}</span>
                                </div>
                                <div className="income-amount">
                                    + {inc.amount.toLocaleString()} {currency}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <footer className="income-list-footer">
                <span>סה"כ הכנסות:</span>
                <span className="total-amount">{totalIncome.toLocaleString()} {currency}</span>
            </footer>
        </div>
    );
};

export default IncomeList;
