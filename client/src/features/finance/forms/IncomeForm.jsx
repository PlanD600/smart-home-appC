import React, { useState } from 'react';
import { useHome } from '../../../context/HomeContext';
import { useModal } from '../../../context/ModalContext';

const IncomeForm = () => {
  const { addIncomeEntry } = useHome();
  const { hideModal } = useModal();
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!text || !amount) return;
    addIncomeEntry({ text, amount: parseFloat(amount), date });
    hideModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>תיאור ההכנסה:</label>
      <input type="text" value={text} onChange={e => setText(e.target.value)} required />
      <label>סכום:</label>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
      <label>תאריך:</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      <div className="modal-footer">
        <button type="submit" className="primary-action">הוסף</button>
      </div>
    </form>
  );
};

export default IncomeForm;