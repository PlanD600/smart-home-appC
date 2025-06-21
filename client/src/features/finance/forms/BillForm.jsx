import React, { useState, useEffect } from 'react';
import { useHome } from '../../../../../HomeContexttest';
import { useModal } from '../../../context/ModalContext';

const BillForm = ({ existingBill }) => {
  const { activeHome, saveBill, modifyBill } = useHome();
  const { hideModal } = useModal();

  const [text, setText] = useState(existingBill?.text || '');
  const [amount, setAmount] = useState(existingBill?.amount || '');
  const [dueDate, setDueDate] = useState(existingBill ? new Date(existingBill.dueDate).toISOString().split('T')[0] : '');
  const [category, setCategory] = useState(existingBill?.category || '');
  const [isRecurring, setIsRecurring] = useState(existingBill?.recurring != null);
  const [assignedTo, setAssignedTo] = useState(existingBill?.assignedTo || 'משותף');

  const categories = Array.isArray(activeHome?.finances?.expenseCategories)
    ? activeHome.finances.expenseCategories
    : [];

  const availableUsers = ['משותף', ...(activeHome?.users || [])];
  
  // =================================================================
  // 1. משתנה חדש שבודק אם הטופס צריך להיות מנוטרל
  const isFormDisabled = categories.length === 0;
  // =================================================================

  useEffect(() => {
    if (!existingBill && !category && categories.length > 0) {
      setCategory(categories[0].name);
    }
  }, [categories, existingBill, category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormDisabled) return; // מניעת שליחה אם הטופס מנוטרל

    if (!text.trim() || !amount || !dueDate || !category) {
      alert('נא למלא את כל השדות הנדרשים.');
      return;
    }

    const billData = {
      text,
      amount: parseFloat(amount),
      dueDate,
      category,
      recurring: isRecurring ? { frequency: 'monthly' } : null,
      assignedTo,
    };

    if (existingBill) {
      modifyBill(existingBill._id, billData);
    } else {
      saveBill(billData);
    }

    hideModal();
  };
  
  // הגדרות עיצוב נשארות כפי שהן
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
  const inputStyle = { width: 'calc(100% - 22px)', padding: '10px', marginBottom: '15px', border: '1px solid var(--border-grey)', borderRadius: '4px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const selectStyle = { width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid var(--border-grey)', borderRadius: '4px', backgroundColor: 'var(--white)' };
  const checkboxContainerStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' };
  const checkboxInputStyle = { width: 'auto', margin: 0, accentColor: 'var(--mint-green)' };
  
  // סגנון מיוחד עבור ההודעה למשתמש
  const noticeStyle = {
    padding: '10px',
    border: '1px dashed var(--border-grey)',
    borderRadius: '4px',
    textAlign: 'center',
    color: '#777',
    backgroundColor: 'var(--background-grey)',
    marginBottom: '15px',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <label htmlFor="bill-name" style={labelStyle}>שם החשבון:</label>
      <input type="text" id="bill-name" value={text} onChange={(e) => setText(e.target.value)} placeholder="למשל: חשבון חשמל" required style={inputStyle} />
      
      <label htmlFor="bill-amount" style={labelStyle}>סכום:</label>
      <input type="number" id="bill-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="350" required style={inputStyle} />

      <label htmlFor="bill-due-date" style={labelStyle}>תאריך לתשלום:</label>
      <input type="date" id="bill-due-date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required style={inputStyle} />

      <label htmlFor="bill-category" style={labelStyle}>קטגוריה:</label>
      {/* ================================================================= */}
      {/* 2. תצוגה מותנית: הצג את הרשימה או את ההודעה */}
      {isFormDisabled ? (
        <div style={noticeStyle}>
          יש להגדיר קטגוריות הוצאה תחילה (במסך ניהול תקציב).
        </div>
      ) : (
        <select id="bill-category" value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle} required>
          {categories.map(cat => (
            <option key={cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      )}
      {/* ================================================================= */}
      
      <label htmlFor="bill-assigned-to" style={labelStyle}>משויך ל:</label>
      <select id="bill-assigned-to" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={selectStyle} required>
        {availableUsers.map(user => (
          <option key={user} value={user}>{user}</option>
        ))}
      </select>

      <div style={checkboxContainerStyle}>
        <input type="checkbox" id="bill-recurring-checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} style={checkboxInputStyle} />
        <label htmlFor="bill-recurring-checkbox">חיוב קבוע (חודשי)</label>
      </div>

      <div className="modal-footer">
        {/* 3. נטרול כפתור השמירה אם הטופס מנוטרל */}
        <button type="submit" className="primary-action" disabled={isFormDisabled}>
          {existingBill ? 'שמור שינויים' : 'הוסף חשבון'}
        </button>
        <button type="button" className="secondary-action" onClick={hideModal}>ביטול</button>
      </div>
    </form>
  );
};

export default BillForm;