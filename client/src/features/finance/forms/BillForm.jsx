// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/finance/forms/BillForm.jsx
import React, { useState, useEffect } from 'react';
import { useHome } from '../../../context/HomeContext';
import { useModal } from '../../../context/ModalContext';

function BillForm({ bill }) { // We receive the bill to edit, or null if adding
    const { currentHome, updateCurrentHome } = useHome();
    const { closeModal } = useModal();
    const [formData, setFormData] = useState({
        text: '',
        amount: '',
        dueDate: '',
        category: 'חשבונות',
    });

    const isEditing = bill !== null;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                text: bill.text,
                amount: bill.amount,
                dueDate: bill.dueDate.split('T')[0], // Format date for input
                category: bill.category,
            });
        }
    }, [bill, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { finances } = currentHome;
        let updatedBills;

        if (isEditing) {
            updatedBills = finances.expectedBills.map(b => 
                b._id === bill._id ? { ...b, ...formData } : b
            );
        } else {
            updatedBills = [...finances.expectedBills, { ...formData, _id: `temp_${Date.now()}` }];
        }
        
        updateCurrentHome({ finances: { ...finances, expectedBills: updatedBills } });
        closeModal();
        
    };

    // --- THIS IS THE FIX ---
    // Add a guard clause to ensure currentHome exists before rendering the form
    if (!currentHome || !currentHome.finances) {
        return <div>טוען נתונים...</div>;
    }

    return (
        <div>
            <h4>{isEditing ? 'עריכת חשבון' : 'הוספת חשבון חדש'}</h4>
            <form onSubmit={handleSubmit} id="generic-modal-body">
                <label>שם החשבון:</label>
                <input type="text" name="text" value={formData.text} onChange={handleChange} required />
                
                <label>סכום:</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />

                <label>תאריך לתשלום:</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
                
                <label>קטגוריה:</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                    {currentHome.finances.expenseCategories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>

                <div className="modal-footer">
                    <button type="submit" className="primary-action">{isEditing ? 'שמור שינויים' : 'הוסף חשבון'}</button>
                    <button type="button" className="secondary-action" onClick={closeModal}>בטל</button>
                </div>
            </form>
        </div>
    );
}

export default BillForm;