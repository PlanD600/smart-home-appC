import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A form for creating or editing a savings goal.
 */
const SavingsGoalForm = ({ initialData }) => {
    const { activeHome } = useAppContext();
    const { saveSavingsGoal, loading } = useFinanceActions(); // Assuming a future 'updateSavingsGoal' might exist
    const { hideModal } = useModal();

    const [name, setName] = useState(initialData?.name || '');
    const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount || '');
    const [error, setError] = useState('');
    
    const isEditMode = Boolean(initialData);
    const currency = activeHome?.finances?.financeSettings?.currency || 'ש"ח';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !targetAmount) {
            setError('נא למלא את כל השדות.');
            return;
        }
        
        const numericAmount = parseFloat(targetAmount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('סכום היעד חייב להיות מספר חיובי.');
            return;
        }

        const goalData = { 
            name: name.trim(), 
            targetAmount: numericAmount, 
            // In edit mode, we would preserve the current amount
            currentAmount: initialData?.currentAmount || 0 
        };

        try {
            // TODO: Add logic for updating a goal if isEditMode is true
            await saveSavingsGoal(goalData);
            hideModal();
        } catch (err) {
            setError(err.message || 'שגיאה בשמירת היעד.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="savings-goal-form">
            <h3 className="form-title">{isEditMode ? 'עריכת יעד חיסכון' : 'יצירת יעד חיסכון חדש'}</h3>
            
            <div className="form-group">
                <label htmlFor="goal-name">שם היעד</label>
                <input
                    id="goal-name"
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="למשל: חופשה בתאילנד" 
                    required 
                    autoFocus
                />
            </div>
            <div className="form-group">
                <label htmlFor="goal-amount">סכום היעד</label>
                <div className="input-with-currency">
                    <input
                        id="goal-amount"
                        type="number" 
                        value={targetAmount} 
                        onChange={e => setTargetAmount(e.target.value)} 
                        placeholder="0" 
                        required 
                        min="1"
                        className="amount-input"
                    />
                    <span className="currency-symbol">{currency}</span>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}
            
            <div className="modal-footer">
                <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : (isEditMode ? 'שמור שינויים' : 'הוסף יעד')}
                </button>
                <button type="button" className="secondary-action" onClick={hideModal}>בטל</button>
            </div>
        </form>
    );
};

export default SavingsGoalForm;

