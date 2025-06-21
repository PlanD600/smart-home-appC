// client/src/features/finance/forms/BillForm.jsx (מתוקן)

import React, { useState, useEffect } from 'react';
// ✅ תיקון: פיצול הייבוא לשתי שורות נפרדות, כל אחת מהמקור הנכון שלה
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';

const BillForm = ({ initialData, onSuccess }) => {
    const { activeHome } = useAppContext();
    const { saveBill, modifyBill } = useFinanceActions();
    const { hideModal } = useModal();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const [bill, setBill] = useState({
        description: '',
        amount: '',
        dueDate: '',
        category: '',
        recurring: 'no',
        paymentMethod: 'Credit Card',
        notes: '',
    });

    useEffect(() => {
        if (initialData) {
            setIsEditMode(true);
            setBill({
                description: initialData.description || '',
                amount: initialData.amount || '',
                dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
                category: initialData.category || '',
                recurring: initialData.recurring || 'no',
                paymentMethod: initialData.paymentMethod || 'Credit Card',
                notes: initialData.notes || '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBill(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveBill = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const billData = {
            ...bill,
            amount: parseFloat(bill.amount),
        };
        
        if (isEditMode) {
            await modifyBill(initialData._id, billData);
        } else {
            await saveBill(billData);
        }

        setIsLoading(false);
        if (onSuccess) onSuccess();
        hideModal();
    };

    return (
        <form onSubmit={handleSaveBill} className="p-4 space-y-3">
            <h3 className="text-lg font-semibold text-center">{isEditMode ? 'עריכת חשבון' : 'הוספת חשבון צפוי'}</h3>
            
            <input name="description" value={bill.description} onChange={handleChange} placeholder="תיאור (לדוגמה: חשבון חשמל)" className="input input-bordered w-full" required />
            <div className="grid grid-cols-2 gap-3">
                <input name="amount" type="number" value={bill.amount} onChange={handleChange} placeholder="סכום" className="input input-bordered w-full" required />
                <input name="dueDate" type="date" value={bill.dueDate} onChange={handleChange} className="input input-bordered w-full" required />
            </div>
            
            <select name="category" value={bill.category} onChange={handleChange} className="select select-bordered w-full" required>
                <option value="" disabled>בחר קטגוריה</option>
                {activeHome?.finances?.expenseCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
            </select>
            
            <select name="recurring" value={bill.recurring} onChange={handleChange} className="select select-bordered w-full">
                <option value="no">לא קבוע</option>
                <option value="monthly">חודשי</option>
                <option value="bimonthly">דו-חודשי</option>
                <option value="quarterly">רבעוני</option>
                <option value="annually">שנתי</option>
            </select>

            <textarea name="notes" value={bill.notes} onChange={handleChange} placeholder="הערות נוספות" className="textarea textarea-bordered w-full"></textarea>

            <div className="flex justify-end pt-4">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'שומר...' : (isEditMode ? 'שמור שינויים' : 'הוסף חשבון')}
                </button>
            </div>
        </form>
    );
};

export default BillForm;