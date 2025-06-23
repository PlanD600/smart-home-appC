import React, { useState } from 'react';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A form for adding a new income record.
 */
const IncomeForm = () => {
    const { saveIncome, loading } = useFinanceActions();
    const { hideModal } = useModal();
    
    const [income, setIncome] = useState({
        text: '',
        amount: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        source: '',
        isRecurring: false,
    });
    const [error, setError] = useState('');

    /**
     * Handles changes in form inputs.
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setIncome(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    /**
     * Handles form submission.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!income.text || !income.amount) {
            setError('נא למלא את שדות התיאור והסכום.');
            return;
        }

        const incomeData = {
            ...income,
            amount: parseFloat(income.amount),
        };

        try {
            await saveIncome(incomeData);
            hideModal();
        } catch (err) {
            setError(err.message || 'שגיאה בשמירת ההכנסה.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="income-form">
            <h3 className="form-title">הוספת הכנסה חדשה</h3>
            
            <div className="form-group">
                <label htmlFor="income-text">תיאור ההכנסה *</label>
                <input id="income-text" name="text" type="text" value={income.text} onChange={handleChange} placeholder="לדוגמה: משכורת חודש יוני" required autoFocus />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                    <label htmlFor="income-amount">סכום *</label>
                    <input id="income-amount" name="amount" type="number" value={income.amount} onChange={handleChange} placeholder="0.00" required min="0.01" step="0.01" />
                </div>
                <div className="form-group">
                    <label htmlFor="income-date">תאריך קבלה</label>
                    <input id="income-date" name="date" type="date" value={income.date} onChange={handleChange} required />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="income-source">מקור ההכנסה</label>
                <input id="income-source" name="source" type="text" value={income.source} onChange={handleChange} placeholder="לדוגמה: מקום עבודה" />
            </div>

            <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                    <input type="checkbox" name="isRecurring" checked={income.isRecurring} onChange={handleChange} className="checkbox checkbox-primary" />
                    <span className="label-text">הכנסה קבועה?</span> 
                </label>
            </div>

            {error && <p className="error-message">{error}</p>}
            
            <div className="modal-footer">
                <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'הוסף הכנסה'}
                </button>
                <button type="button" className="secondary-action" onClick={hideModal}>בטל</button>
            </div>
        </form>
    );
};

export default IncomeForm;
