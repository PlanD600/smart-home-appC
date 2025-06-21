// client/src/features/finance/forms/IncomeForm.jsx (מתוקן)

import React, { useState } from 'react';
// ✅ תיקון: פיצול הייבוא לשתי שורות נפרדות
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';

const IncomeForm = ({ onSuccess }) => {
    // ✅ שימוש בשני ה-hooks, כל אחד מהמקור הנכון שלו
    const { activeHome } = useAppContext();
    const { saveIncome } = useFinanceActions();
    const { hideModal } = useModal();
    const [isLoading, setIsLoading] = useState(false);

    const [income, setIncome] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0], // ברירת מחדל להיום
        source: '',
        isRecurring: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setIncome(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSaveIncome = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const incomeData = {
            ...income,
            amount: parseFloat(income.amount)
        };
        await saveIncome(incomeData);
        setIsLoading(false);
        if (onSuccess) onSuccess();
        hideModal();
    };

    return (
        <form onSubmit={handleSaveIncome} className="p-4 space-y-3">
            <h3 className="text-lg font-semibold text-center">הוספת הכנסה</h3>

            <input name="description" value={income.description} onChange={handleChange} placeholder="תיאור (לדוגמה: משכורת)" className="input input-bordered w-full" required />
            
            <div className="grid grid-cols-2 gap-3">
                <input name="amount" type="number" value={income.amount} onChange={handleChange} placeholder="סכום" className="input input-bordered w-full" required />
                <input name="date" type="date" value={income.date} onChange={handleChange} className="input input-bordered w-full" required />
            </div>

            <input name="source" value={income.source} onChange={handleChange} placeholder="מקור ההכנסה (לדוגמה: מקום עבודה)" className="input input-bordered w-full" />

            <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                    <input type="checkbox" name="isRecurring" checked={income.isRecurring} onChange={handleChange} className="checkbox" />
                    <span className="label-text">הכנסה קבועה?</span> 
                </label>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'שומר...' : 'הוסף הכנסה'}
                </button>
            </div>
        </form>
    );
};

export default IncomeForm;