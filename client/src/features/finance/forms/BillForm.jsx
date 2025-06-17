import React, { useState } from 'react';
import { useHome } from '../../../context/HomeContext';
import { useModal } from '../../../context/ModalContext';

const BillForm = () => {
  const { activeHome, addBill } = useHome();
  const { hideModal } = useModal();
  
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState(activeHome?.finances?.expenseCategories[0]?.name || 'חשבונות');
  const [isRecurring, setIsRecurring] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !amount || !dueDate) {
      alert('נא למלא את כל השדות.');
      return;
    }
    
    addBill({
      text,
      amount: parseFloat(amount),
      dueDate,
      category,
      recurring: isRecurring ? { frequency: 'monthly' } : null,
    });
    
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
        <button type="submit" className="primary-action">הוסף חשבון</button>
        <button type="button" className="secondary-action" onClick={hideModal}>ביטול</button>
      </div>
    </form>
  );
};

export default BillForm;