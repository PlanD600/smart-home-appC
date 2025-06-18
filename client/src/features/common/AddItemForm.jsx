import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext'; // ייבוא useHome

// הגדר רשימת קטגוריות ברירת מחדל.
// ניתן להתאים אותה לפי הצרכים שלך.
const DEFAULT_CATEGORIES = ['כללית', 'מצרכים', 'חשבונות', 'בידור', 'שונות', 'עבודה', 'לימודים'];

const AddItemForm = ({ onAddItem, placeholder = "הוסף פריט...", initialCategory = 'כללית' }) => {
  const { activeHome } = useHome(); // שליפת activeHome
  const [text, setText] = useState('');
  // **תיקון: הסרת שימוש ב-categories prop שהוסר. נשתמש ב-DEFAULT_CATEGORIES**
  const [category, setCategory] = useState(initialCategory || DEFAULT_CATEGORIES[0]); 
  const [assignedTo, setAssignedTo] = useState('משותף'); // מצב חדש עבור assignedTo

  // רשימת המשתמשים הזמינים, כולל ברירת המחדל 'משותף'
  let availableUsers = activeHome?.users || ['אני'];
  // נוודא ש'משותף' תמיד קיים כאפשרות
  if (!availableUsers.includes('משותף')) {
    availableUsers = [...availableUsers, 'משותף']; // יצירת מערך חדש למניעת מוטציה ישירה
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      // הוספת assignedTo למטען הנתונים הנשלח
      onAddItem({ text, category, assignedTo }); 
      setText(''); // ניקוי שדה טקסט
      // איפוס לקטגוריה/משתמשים ברירת מחדל
      setCategory(initialCategory || DEFAULT_CATEGORIES[0]); 
      setAssignedTo('משותף'); 
    }
  };

  const formStyle = {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '25px', 
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
      {/* **תיקון: שימוש ב-DEFAULT_CATEGORIES במקום categories prop** */}
      <select 
        className="add-item-category-select" 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        style={selectStyle}
        aria-label="בחר קטגוריה"
      >
        {/* אין צורך בבדיקה !categories.includes('כללית') אם DEFAULT_CATEGORIES תמיד כולל אותה */}
        {DEFAULT_CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      
      {/* רשימה נפתחת לבחירת משתמש */}
      <select 
        className="add-item-assigned-select" 
        value={assignedTo} 
        onChange={(e) => setAssignedTo(e.target.value)}
        style={selectStyle}
        aria-label="הקצה למשתמש"
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
        aria-label="טקסט פריט"
      />
      <button type="submit" className="add-item-btn" style={buttonStyle}>
        <i className="fas fa-plus"></i>
      </button>
    </form>
  );
};

export default AddItemForm;