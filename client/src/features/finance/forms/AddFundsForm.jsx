import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A form for adding funds to a specific savings goal.
 * @param {object} props - Component props.
 * @param {object} props.goal - The savings goal object to add funds to.
 */
const AddFundsForm = ({ goal }) => {
    const { activeHome } = useAppContext();
    const { addFundsToSavingsGoal, loading } = useFinanceActions();
    const { hideModal } = useModal();
    
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const currency = activeHome?.finances?.financeSettings?.currency || 'ש"ח';

    const handleAddFunds = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('אנא הזן סכום חיובי ותקני.');
            return;
        }

        try {
            await addFundsToSavingsGoal(goal._id, numericAmount);
            hideModal(); // Close modal only on success
        } catch (err) {
            setError(err.message || 'שגיאה בהוספת הכספים.');
        }
    };

    return (
        <form onSubmit={handleAddFunds} className="add-funds-form">
            <h3 className="form-title">הוספת כספים ליעד: <span className="goal-name">"{goal.name}"</span></h3>
            
            <div className="goal-summary">
                <div className="summary-item">
                    <span>סכום נוכחי:</span>
                    <strong>{goal.currentAmount.toLocaleString()} {currency}</strong>
                </div>
                <div className="summary-item">
                    <span>יעד:</span>
                    <strong>{goal.targetAmount.toLocaleString()} {currency}</strong>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="fund-amount">הסכום להוספה</label>
                <div className="input-with-currency">
                    <input
                        id="fund-amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="amount-input"
                        required
                        min="0.01"
                        step="0.01"
                        autoFocus
                    />
                    <span className="currency-symbol">{currency}</span>
                </div>
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="modal-footer">
                <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'הוסף כספים'}
                </button>
                 <button type="button" className="secondary-action" onClick={hideModal}>
                    בטל
                </button>
            </div>
        </form>
    );
};

export default AddFundsForm;
