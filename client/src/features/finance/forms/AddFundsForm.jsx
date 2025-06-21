import React, { useState } from 'react';
// ✅ תיקון: פיצול הייבוא לשתי שורות נפרדות
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';

const AddFundsForm = ({ goal, onSuccess }) => {
    // ✅ שימוש בשני ה-hooks, כל אחד מהמקור הנכון שלו
    const { activeHome } = useAppContext();
    const { addFundsToSavingsGoal } = useFinanceActions();
    const { hideModal } = useModal();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const currency = activeHome?.finances?.financeSettings?.currency || 'ש"ח';

    const handleAddFunds = async (e) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('אנא הזן סכום חיובי.');
            return;
        }
        setIsLoading(true);
        await addFundsToSavingsGoal(goal._id, numericAmount);
        setIsLoading(false);
        if (onSuccess) onSuccess();
        hideModal();
    };

    return (
        <form onSubmit={handleAddFunds} className="p-4 space-y-3">
            <h3 className="text-lg font-semibold text-center">הוספת כספים ליעד: {goal.name}</h3>
            
            <div className="text-center text-sm text-gray-600">
                <p>יעד: {goal.targetAmount.toLocaleString()} {currency}</p>
                <p>סכום נוכחי: {goal.currentAmount.toLocaleString()} {currency}</p>
            </div>

            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="הזן סכום להוספה"
                className="input input-bordered w-full"
                required
                min="0.01"
                step="0.01"
            />
            
            <div className="flex justify-end pt-4">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'מוסיף...' : 'הוסף כספים'}
                </button>
            </div>
        </form>
    );
};

export default AddFundsForm;