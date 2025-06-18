import React from 'react';
import { useHome } from '../../context/HomeContext';
import AddItemForm from '../common/AddItemForm';
import TaskItem from './TaskItem'; // וודא שזה TaskItem ולא ShoppingItem
import LoadingSpinner from '../../components/LoadingSpinner';

const TaskList = () => {
  // הוספת modifyItem, removeItem ל-destructuring מ-useHome
  const { activeHome, saveItem, loading, modifyItem, removeItem } = useHome(); 

  if (!activeHome) return <p>טוען נתונים...</p>;

  // **תיקון: שינוי מ-taskItems ל-tasks. הסרנו taskCategories.**
  const tasks = activeHome.tasks || []; 
  
  const handleAddItem = (itemData) => saveItem('tasks', itemData);

  // ממיין את המערך לפני ההצגה. פריטים עם isUrgent=true יופיעו ראשונים.
  const sortedItems = [...tasks].sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));

  return (
    <section id="task-list" className="list-section active">
       <div className="list-title-container">
        <h3><span>רשימת מטלות</span></h3>
        <div className="list-title-actions">
           <button id="breakdown-task-btn" className="header-style-button gemini-btn" title="✨ פרק משימה מורכבת לתתי-משימות">✨ <span>פרק משימה</span></button>
        </div>
      </div>
      
      <div className="add-area">
        <AddItemForm 
          onAddItem={handleAddItem}
          // **תיקון: הסרת categories prop שהיה מבוסס על taskCategories**
          placeholder="הוסף מטלה חדשה..."
        />
      </div>
      {loading && <LoadingSpinner />} 
      <div className="item-list">
        <ul className="item-list-ul">
          {sortedItems && sortedItems.length > 0 ? (
            sortedItems.map(item => (
              <TaskItem 
                key={item._id} 
                item={item} 
                listType="tasks" // **חשוב: העברת listType**
                onUpdate={modifyItem} // **העברת פונקציות העדכון והמחיקה**
                onDelete={removeItem} 
              />
            ))
          ) : (
            <li style={{ textAlign: 'center', padding: '15px', color: '#777' }}>אין משימות להצגה.</li>
          )}
        </ul>
      </div>
    </section>
  );
};

export default TaskList;