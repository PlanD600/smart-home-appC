import React, { useContext, useState } from 'react';
import { HomeContext } from '../../context/HomeContext.jsx'; // שים לב לנתיב המעודכן
import TaskItem from './TaskItem.jsx'; // שים לב לנתיב המעודכן

function TaskList() {
  // --- השורה הזו הייתה חסרה או שגויה ---
  const { activeHome, addItemToHome } = useContext(HomeContext);
  
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = () => {
    if (newItemText.trim() === '') return;
    addItemToHome('taskItems', { text: newItemText });
    setNewItemText('');
  };

  // בדיקה חשובה: אם activeHome עדיין לא נטען, הצג הודעת טעינה
  if (!activeHome || !activeHome.taskItems) {
    return <div>טוען את רשימת המטלות...</div>;
  }

  return (
    <section id="task-list" className="list-section active">
      <div className="list-title-container">
        <h3><span>רשימת מטלות</span></h3>
      </div>
      
      <div className="add-area">
        <div className="add-item-form">
          <input 
            type="text" 
            className="add-item-input" 
            placeholder="הוסף מטלה חדשה..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <button className="add-item-btn" onClick={handleAddItem}>
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
      
      <div className="item-list">
        <ul className="item-list-ul">
          {activeHome.taskItems.length === 0 ? (
            <li>אין מטלות ברשימה.</li>
          ) : (
            [...activeHome.taskItems]
              .sort((a, b) => b.isUrgent - a.isUrgent)
              .map(item => (
                <TaskItem key={item._id} item={item} />
              ))
          )}
        </ul>
      </div>
    </section>
  );
}

export default TaskList;