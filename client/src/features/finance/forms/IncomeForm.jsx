import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const IncomeForm = () => {
    const { activeHome, currentUser } = useAppContext();
    const { saveIncome, loading } = useFinanceActions();
    const { hideModal } = useModal();
    
    const [source, setSource] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    // [NEW] State for assigning the income to a user
    const [assignedTo, setAssignedTo] = useState(currentUser || '');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!source || !amount) {
            setError('יש למלא את כל השדות.');
            return;
        }

        const incomeData = {
            source,
            amount: parseFloat(amount),
            date,
            assignedTo: assignedTo // <-- תוקן: הוספת השדה החסר
        };

        try {
            await saveIncome(incomeData);
            hideModal();
        } catch (err) {
            setError(err.message || 'שגיאה בהוספת הכנסה.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4" noValidate>
            <h3 className="form-title">הוספת הכנסה חדשה</h3>
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="form-field">
                <label htmlFor="income-source">מקור ההכנסה</label>
                <input
                    id="income-source"
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="למשל: משכורת, מתנה..."
                    required
                />
            </div>
            
            <div className="form-field">
                <label htmlFor="income-amount">סכום</label>
                <input
                    id="income-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    step="0.01"
                    min="0"
                />
            </div>
            
            <div className="form-field">
                <label htmlFor="income-date">תאריך</label>
                <input
                    id="income-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            {/* [NEW] Dropdown to select a user */}
            <div className="form-field">
                <label htmlFor="income-assignedTo">שיוך ל:</label>
                <select
                    id="income-assignedTo"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                >
                    <option value="">ללא שיוך (משותף)</option>
                    {activeHome?.users?.map(user => (
                        <option key={user._id} value={user.name}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="modal-footer">
                <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'הוסף הכנסה'}
                </button>
                <button type="button" className="secondary-action" onClick={hideModal}>
                    ביטול
                </button>
            </div>
        </form>
    );
};

export default IncomeForm;