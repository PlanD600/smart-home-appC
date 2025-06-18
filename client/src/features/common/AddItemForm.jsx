import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext'; // ייבוא useHome
// אין צורך ב-useModal כאן

const AddItemForm = ({ onAddItem, categories, placeholder }) => {
  const { activeHome } = useHome(); // שליפת activeHome
  const [text, setText] = useState('');
  const [category, setCategory] = useState('כללית');
  const [assignedTo, setAssignedTo] = useState('משותף'); // מצב חדש עבור assignedTo

  // רשימת המשתמשים הזמינים, כולל ברירת המחדל 'משותף'
  const availableUsers = activeHome?.users || ['אני'];
  // נוודא ש'משותף' תמיד קיים כאפשרות
  if (!availableUsers.includes('משותף')) {
    availableUsers.push('משותף');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      // הוספת assignedTo למטען הנתונים הנשלח
      onAddItem({ text, category, assignedTo }); 
      setText(''); // ניקוי שדה טקסט
      // אין צורך לאפס את category או assignedTo אם רוצים שהבחירה האחרונה תשמר
      // setCategory('כללית'); 
      // setAssignedTo('משותף');
    }
  };

  const formStyle = {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '25px', // מונע מגע עם כפתור 'הוסף פריט'
  };

  const inputStyle = {
    flexGrow: 1,
    padding: '10px',
    border: '1px solid var(--border-grey)',
    borderRadius: '4px',
    fontSize: '16px',
  };

  const selectStyle = {
    padding: '10px',
    border: '1px solid var(--border-grey)',
    borderRadius: '4px',
    backgroundColor: 'var(--white)',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: 'var(--mint-green)',
    color: 'var(--white)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };


  return (
    <form className="add-item-form" onSubmit={handleSubmit} style={formStyle}>
      <select 
        className="add-item-category-select" 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        style={selectStyle}
      >
        {/* וודא ש"כללית" תמיד תהיה אפשרות */}
        {!categories.includes('כללית') && <option value="כללית">כללית</option>}
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      
      {/* רשימה נפתחת לבחירת משתמש */}
      <select 
        className="add-item-assigned-select" 
        value={assignedTo} 
        onChange={(e) => setAssignedTo(e.target.value)}
        style={selectStyle}
      >
        {availableUsers.map(user => (
          <option key={user} value={user}>{user}</option>
        ))}
      </select>

      <input 
        type="text" 
        className="add-item-input" 
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={inputStyle}
      />
      <button type="submit" className="add-item-btn" style={buttonStyle}>
        <i className="fas fa-plus"></i>
      </button>
    </form>
  );
};

export default AddItemForm;