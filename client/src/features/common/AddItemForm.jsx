import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext'; 

// הגדרת קטגוריות ברירת מחדל, כפי שהיה בקוד המקורי
const DEFAULT_CATEGORIES = ['כללית', 'מצרכים', 'חשבונות', 'בידור', 'שונות', 'עבודה', 'לימודים'];

const AddItemForm = ({ onAddItem, onCancel }) => {
  const { activeHome } = useHome(); 
  
  // FIX: חזרה להשתמש במשתנה 'text' כפי שהשרת מצפה
  const [text, setText] = useState(''); 
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  
  const users = activeHome?.users && Array.isArray(activeHome.users) ? activeHome.users : [];
  const [assignedTo, setAssignedTo] = useState(users.length > 0 ? users[0].name : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    // FIX: בדיקה של המשתנה 'text' ושליחת אובייקט עם השדה 'text'
    if (text.trim() && onAddItem) {
      // קריאה לפונקציה שהועברה מהאב עם המידע הנכון שהשרת מצפה לו
      onAddItem({ text, category, assignedTo });
      
      // איפוס הטופס למצב התחלתי
      setText(''); // איפוס המשתנה הנכון
      setCategory(DEFAULT_CATEGORIES[0]);
      if (onCancel) onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-700 rounded-lg shadow-inner space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* FIX: המשתנה והפונקציה המעודכנת הם 'text' ו-'setText' */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"הוסף פריט או משימה..."}
          className="w-full sm:col-span-2 p-2 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button 
          type="submit" 
          className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          הוסף
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DEFAULT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full p-2 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {/* התיקון למניעת קריסת האפליקציה נשאר */}
          {users.map((user) => (
            <option key={user._id} value={user.name}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="w-full mt-2 px-4 py-2 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 focus:outline-none"
          >
            ביטול
          </button>
        )}
    </form>
  );
};

export default AddItemForm;
