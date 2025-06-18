import React from 'react';
import { useHome } from '../../context/HomeContext'; 
import AddItemForm from '../common/AddItemForm';
import TaskItem from './TaskItem'; // **תיקון: שונה מ-TaskItem22 ל-TaskItem**
import LoadingSpinner from '../../components/LoadingSpinner';

const TaskList = () => {
  const { activeHome, saveItem, loading, modifyItem, removeItem } = useHome(); 

  if (!activeHome) return <p>טוען נתונים...</p>;

  const tasks = activeHome.tasks || []; 
  
  const handleAddItem = (itemData) => saveItem('tasks', itemData);

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
                listType="tasks" 
                onUpdate={modifyItem} 
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