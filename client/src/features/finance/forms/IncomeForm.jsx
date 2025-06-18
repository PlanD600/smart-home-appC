import React, { useState } from 'react';
import { useHome } from '../../../context/HomeContext'; // ייבוא useHome
import { useModal } from '../../../context/ModalContext';

const IncomeForm = () => {
  const { addIncome, activeHome } = useHome(); // שליפת addIncome ו-activeHome
  const { hideModal } = useModal();
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedTo, setAssignedTo] = useState('משותף'); // מצב חדש עבור assignedTo

  // רשימת המשתמשים הזמינים, כולל ברירת המחדל 'משותף'
  const availableUsers = activeHome?.users || ['אני'];
  // נוודא ש'משותף' תמיד קיים כאפשרות
  if (!availableUsers.includes('משותף')) {
    availableUsers.push('משותף');
  }

  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim() || !amount) { // וודא ששדה הטקסט אינו ריק וגם המספר אינו ריק
      return;
    }
    // קריאה ל-addIncome מהקונטקסט עם הוספת assignedTo
    addIncome({ text, amount: parseFloat(amount), date, assignedTo }); 
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

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <label style={labelStyle}>תיאור ההכנסה:</label>
      <input type="text" value={text} onChange={e => setText(e.target.value)} required style={inputStyle} />
      
      <label style={labelStyle}>סכום:</label>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required style={inputStyle} />
      
      <label style={labelStyle}>תאריך:</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={inputStyle} />
      
      {/* רשימה נפתחת לבחירת משתמש */}
      <label style={labelStyle}>משויך ל:</label>
      <select 
        value={assignedTo} 
        onChange={e => setAssignedTo(e.target.value)} 
        style={selectStyle}
        required
      >
        {availableUsers.map(user => (
          <option key={user} value={user}>{user}</option>
        ))}
      </select>

      <div className="modal-footer">
        <button type="submit" className="primary-action">הוסף</button>
      </div>
    </form>
  );
};

export default IncomeForm;