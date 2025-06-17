import React, { useState, useEffect } from 'react';
import { useHome } from '../../../context/HomeContext';
import { useModal } from '../../../context/ModalContext';

const BillForm = ({ existingBill }) => {
  const { activeHome, addBill, updateBill } = useHome();
  const { hideModal } = useModal();
  
  // Initialize state with existing bill data if in edit mode, otherwise empty
  const [text, setText] = useState(existingBill?.text || '');
  const [amount, setAmount] = useState(existingBill?.amount || '');
  const [dueDate, setDueDate] = useState(existingBill ? new Date(existingBill.dueDate).toISOString().split('T')[0] : '');
  const [category, setCategory] = useState(existingBill?.category || activeHome?.finances?.expenseCategories[0]?.name || 'חשבונות');
  const [isRecurring, setIsRecurring] = useState(existingBill?.recurring != null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !amount || !dueDate) {
      alert('נא למלא את כל השדות.');
      return;
    }
    
    const billData = {
      text,
      amount: parseFloat(amount),
      dueDate,
      category,
      recurring: isRecurring ? { frequency: 'monthly' } : null,
    };

    if (existingBill) {
      // If we are editing, call updateBill
      updateBill(existingBill._id, billData);
    } else {
      // If we are creating, call addBill
      addBill(billData);
    }
    
    hideModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="bill-name">שם החשבון:</label>
      <input type="text" id="bill-name" value={text} onChange={(e) => setText(e.target.value)} placeholder="למשל: חשבון חשמל" required />
      
      <label htmlFor="bill-amount">סכום:</label>
      <input type="number" id="bill-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="350" required />

      <label htmlFor="bill-due-date">תאריך לתשלום:</label>
      <input type="date" id="bill-due-date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />

      <label htmlFor="bill-category">קטגוריה:</label>
      <select id="bill-category" value={category} onChange={(e) => setCategory(e.target.value)}>
        {activeHome?.finances?.expenseCategories.map(cat => (
          <option key={cat.name} value={cat.name}>{cat.name}</option>
        ))}
      </select>

      <div className="checkbox-container">
        <input type="checkbox" id="bill-recurring-checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
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