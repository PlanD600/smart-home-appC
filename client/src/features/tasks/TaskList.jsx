import React from 'react';
import { useHome } from '../../context/HomeContext'; //
import AddItemForm from '../common/AddItemForm';
import TaskItem from './TaskItem';
import LoadingSpinner from '../../components/LoadingSpinner';

const TaskList = () => {
  const { activeHome, saveItem, loading } = useHome(); // שינוי: מ-addItemToList, isLoading ל-saveItem, loading

  if (!activeHome) return <p>טוען נתונים...</p>;

  const { taskItems, taskCategories } = activeHome;
  const handleAddItem = (itemData) => saveItem('tasks', itemData); // שינוי: מ-addItemToList ל-saveItem

  const sortedItems = [...taskItems].sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));

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
          categories={taskCategories || ['כללית']}
          placeholder="הוסף מטלה חדשה..."
        />
      </div>
      {loading && <LoadingSpinner />} {/* שימוש ב-loading מהקונטקסט */}
      <div className="item-list">
        <ul className="item-list-ul">
          {sortedItems && sortedItems.length > 0 ? (
            sortedItems.map(item => <TaskItem key={item._id} item={item} />)
          ) : (
            <li style={{ textAlign: 'center', padding: '15px', color: '#777' }}>אין משימות להצגה.</li>
          )}
        </ul>
      </div>
    </section>
  );
};

export default TaskList;