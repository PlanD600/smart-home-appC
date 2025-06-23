import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A form for adding or editing an expected bill.
 * @param {object} props - Component props.
 * @param {object} [props.initialData] - The bill data to edit. If not provided, the form is in 'add' mode.
 */
const BillForm = ({ initialData }) => {
    const { activeHome } = useAppContext();
    const { saveBill, modifyBill, loading } = useFinanceActions();
    const { hideModal } = useModal();
    
    const [bill, setBill] = useState({
        text: '',
        amount: '',
        dueDate: new Date().toISOString().split('T')[0],
        category: '',
        assignedTo: '',
        recurring: 'no',
    });
    const [error, setError] = useState('');
    
    const isEditMode = Boolean(initialData);

    useEffect(() => {
        if (isEditMode) {
            setBill({
                text: initialData.text || '',
                amount: initialData.amount || '',
                dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
                category: initialData.category || '',
                assignedTo: initialData.assignedTo || (activeHome.users[0]?.name || ''),
                recurring: initialData.recurring?.frequency || 'no',
            });
        } else if (activeHome.users.length > 0) {
            // Set default assignee for new bills
            setBill(prev => ({ ...prev, assignedTo: activeHome.users[0].name }));
        }
    }, [initialData, isEditMode, activeHome.users]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBill(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!bill.text || !bill.amount || !bill.dueDate || !bill.category) {
            setError('נא למלא את כל השדות המסומנים בכוכבית (*).');
            return;
        }

        const billData = {
            text: bill.text,
            amount: parseFloat(bill.amount),
            dueDate: bill.dueDate,
            category: bill.category,
            assignedTo: bill.assignedTo,
            recurring: { isRecurring: bill.recurring !== 'no', frequency: bill.recurring },
        };
        
        try {
            if (isEditMode) {
                await modifyBill(initialData._id, billData);
            } else {
                await saveBill(billData);
            }
            hideModal();
        } catch (err) {
            setError(err.message || 'שגיאה בשמירת החשבון.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bill-form">
            <h3 className="form-title">{isEditMode ? 'עריכת חשבון' : 'הוספת חשבון צפוי'}</h3>
            
            <div className="form-group">
                <label htmlFor="bill-text">תיאור החשבון *</label>
                <input id="bill-text" name="text" type="text" value={bill.text} onChange={handleChange} placeholder="לדוגמה: חשבון חשמל" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                    <label htmlFor="bill-amount">סכום *</label>
                    <input id="bill-amount" name="amount" type="number" value={bill.amount} onChange={handleChange} placeholder="0.00" required min="0.01" step="0.01" />
                </div>
                <div className="form-group">
                    <label htmlFor="bill-dueDate">תאריך לתשלום *</label>
                    <input id="bill-dueDate" name="dueDate" type="date" value={bill.dueDate} onChange={handleChange} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="form-group">
                    <label htmlFor="bill-category">קטגוריה *</label>
                    <select id="bill-category" name="category" value={bill.category} onChange={handleChange} required>
                        <option value="" disabled>בחר קטגוריה...</option>
                        {activeHome?.finances?.expenseCategories.map(cat => (
                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="bill-assignedTo">שייך ל</label>
                    <select id="bill-assignedTo" name="assignedTo" value={bill.assignedTo} onChange={handleChange}>
                        {activeHome?.users.map(user => (
                            <option key={user.name} value={user.name}>{user.name}</option>
                        ))}
                         <option value="משותף">משותף</option>
                    </select>
                </div>
            </div>
            
            <div className="form-group">
                <label htmlFor="bill-recurring">תשלום קבוע</label>
                <select id="bill-recurring" name="recurring" value={bill.recurring} onChange={handleChange}>
                    <option value="no">לא</option>
                    <option value="monthly">חודשי</option>
                    <option value="bimonthly">דו-חודשי</option>
                    <option value="quarterly">רבעוני</option>
                    <option value="annually">שנתי</option>
                </select>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="modal-footer">
                <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : (isEditMode ? 'שמור שינויים' : 'הוסף חשבון')}
                </button>
                <button type="button" className="secondary-action" onClick={hideModal}>בטל</button>
            </div>
        </form>
    );
};

export default BillForm;
