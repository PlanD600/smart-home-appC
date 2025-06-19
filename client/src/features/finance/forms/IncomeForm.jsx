// client/src/features/finance/forms/IncomeForm.jsx

import React, { useState } from 'react';
import { useHome } from '../../../context/HomeContext';
import { useModal } from '../../../context/ModalContext';
import LoadingSpinner from '../../../components/LoadingSpinner';

const IncomeForm = ({ initialData }) => {
    const { activeHome, saveIncome } = useHome();
    const { hideModal } = useModal();
    
    // State לניהול הטופס, הטעינה והשגיאות
    const [formData, setFormData] = useState({
        description: initialData?.description || '',
        amount: initialData?.amount || '',
        user: initialData?.user || 'משותף',
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) {
            setError('יש למלא תיאור וסכום.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await saveIncome(formData);
            hideModal(); // סגירת הפופ-אפ בהצלחה
        } catch (err) {
            console.error("Failed to save income:", err);
            setError(err.message || 'שגיאה בשמירת ההכנסה.');
        } finally {
            // נוודא שהכפתור חוזר למצבו הרגיל גם אם יש שגיאה
            setIsSubmitting(false);
        }
    };

    return (
        // אנחנו משאירים את הלוגיקה בתוך קובץ זה
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <h3 className="text-lg font-bold">{initialData ? 'עריכת הכנסה' : 'הוספת הכנסה חדשה'}</h3>
            
            {/* כל שדות הטופס נשארים זהים */}
            <div className="form-control">
                <label className="label"><span className="label-text">תיאור</span></label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} className="input input-bordered" required />
            </div>
            <div className="form-control">
                <label className="label"><span className="label-text">סכום</span></label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="input input-bordered" required />
            </div>
            <div className="form-control">
                <label className="label"><span className="label-text">משתמש</span></label>
                <select name="user" value={formData.user} onChange={handleChange} className="select select-bordered">
                    <option value="משותף">משותף</option>
                    {activeHome?.users?.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
            <div className="form-control">
                <label className="label"><span className="label-text">תאריך</span></label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="input input-bordered" />
            </div>

            {error && <p className="text-error text-sm text-center">{error}</p>}

            {/* ================================================================= */}
            {/* מבנה הכפתורים הסטנדרטי של DaisyUI - בלי קומפוננטה חיצונית */}
            <div className="modal-action mt-6">
                <button type="button" onClick={hideModal} className="btn btn-ghost">ביטול</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner size="sm" /> : (initialData ? 'עדכן' : 'הוסף')}
                </button>
            </div>
            {/* ================================================================= */}
        </form>
    );
};

export default IncomeForm;