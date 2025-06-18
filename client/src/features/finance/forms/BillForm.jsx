import React, { useState, useEffect } from 'react';
import { useHome } from '../../../context/HomeContext';
import { useModal } from '../../../context/ModalContext';

const BillForm = ({ existingBill }) => {
  const { activeHome, saveBill, modifyBill } = useHome(); // עדכנתי addBill ל-saveBill ו-updateBill ל-modifyBill להתאמה לקונטקסט
  const { hideModal } = useModal();
  
  // Initialize state with existing bill data if in edit mode, otherwise empty
  const [text, setText] = useState(existingBill?.text || '');
  const [amount, setAmount] = useState(existingBill?.amount || '');
  const [dueDate, setDueDate] = useState(existingBill ? new Date(existingBill.dueDate).toISOString().split('T')[0] : '');
  const [category, setCategory] = useState(existingBill?.category || activeHome?.finances?.expenseCategories[0]?.name || 'כללי'); // שיניתי ברירת מחדל לקטגוריה
  const [isRecurring, setIsRecurring] = useState(existingBill?.recurring != null);
  // מצב חדש עבור assignedTo
  const [assignedTo, setAssignedTo] = useState(existingBill?.assignedTo || 'משותף'); 

  // רשימת המשתמשים הזמינים, כולל ברירת המחדל 'משותף'
  const availableUsers = activeHome?.users || ['אני'];
  // נוודא ש'משותף' תמיד קיים כאפשרות
  if (!availableUsers.includes('משותף')) {
    availableUsers.push('משותף');
  }

  // וודא שקטגוריה ברירת מחדל קיימת ברשימת הקטגוריות
  useEffect(() => {
    if (activeHome?.finances?.expenseCategories && activeHome.finances.expenseCategories.length > 0) {
      const defaultCategory = activeHome.finances.expenseCategories.find(cat => cat.name === category);
      if (!defaultCategory) {
        setCategory(activeHome.finances.expenseCategories[0].name);
      }
    }
  }, [activeHome?.finances?.expenseCategories, category]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || !amount || !dueDate) { // וודא ששדות הטקסט אינם ריקים
      alert('נא למלא את כל השדות הנדרשים.');
      return;
    }
    
    const billData = {
      text,
      amount: parseFloat(amount),
      dueDate,
      category,
      recurring: isRecurring ? { frequency: 'monthly' } : null,
      assignedTo, // הוספת assignedTo למטען הנתונים
    };

    if (existingBill) {
      modifyBill(existingBill._id, billData);
    } else {
      saveBill(billData); // שימוש ב-saveBill
    }
    
    hideModal();
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  };

  const inputStyle = {
    width: 'calc(100% - 22px)', // Adjusted width considering padding
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid var(--border-grey)',
    borderRadius: '4px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  };

  const selectStyle = {
    width: '100%', // Full width
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid var(--border-grey)',
    borderRadius: '4px',
    backgroundColor: 'var(--white)',
  };

  const checkboxContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  };

  const checkboxInputStyle = {
    width: 'auto',
    margin: 0,
    accentColor: 'var(--mint-green)',
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
      <select id="bill-category" value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
        {activeHome?.finances?.expenseCategories.map(cat => (
          <option key={cat.name} value={cat.name}>{cat.name}</option>
        ))}
      </select>

      {/* רשימה נפתחת לבחירת משתמש */}
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
        <button type="submit" className="primary-action">{existingBill ? 'שמור שינויים' : 'הוסף חשבון'}</button>
        <button type="button" className="secondary-action" onClick={hideModal}>ביטול</button>
      </div>
    </form>
  );
};

export default BillForm;