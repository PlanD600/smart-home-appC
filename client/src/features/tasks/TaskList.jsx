import React from 'react';
import { useHome } from '../../context/HomeContext';
import AddItemForm from '../common/AddItemForm';
import TaskItem from './TaskItem';
import LoadingSpinner from '../../components/LoadingSpinner';

const TaskList = () => {
  const { activeHome, addItemToList, isLoading } = useHome();

  // Show a loading message if home data is not yet available
  if (!activeHome) {
    return <p>טוען נתונים...</p>;
  }

  const { taskItems, taskCategories } = activeHome;

  // Function to handle adding a new task
  const handleAddItem = (itemData) => {
    // The 'tasks' string must match the listType in the backend route
    addItemToList('tasks', itemData);
  };

  return (
    // The section id matches the original CSS for proper styling
    <section id="task-list" className="list-section active">
      <div className="list-title-container">
        <h3><span>רשימת מטלות</span></h3>
        <div className="list-title-actions">
           <button id="breakdown-task-btn" className="header-style-button gemini-btn" title="✨ פרק משימה מורכבת לתתי-משימות">✨ <span>פרק משימה</span></button>
        </div>
      </div>
      
      {/* Filters can be added here later */}
      <div className="list-filters">
        <label>קטגוריה:</label>
        <select className="category-filter">
          <option value="all">הכל</option>
          {taskCategories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="add-area">
        <AddItemForm 
          onAddItem={handleAddItem}
          categories={taskCategories || ['כללית']}
          placeholder="הוסף מטלה חדשה או משימה לפירוק..."
        />
      </div>
      
      {/* Show a spinner while adding/deleting items */}
      {isLoading && <LoadingSpinner />}

      <div className="item-list">
        <ul className="item-list-ul">
          {taskItems && taskItems.length > 0 ? (
            taskItems.map(item => (
              <TaskItem key={item._id} item={item} />
            ))
          ) : (
            <li style={{ textAlign: 'center', padding: '15px', color: '#777' }}>
              אין משימות להצגה. כל הכבוד!
            </li>
          )}
        </ul>
      </div>
      
      <div className="list-footer">
        <button className="clear-list-btn">
          <i className="fas fa-trash-alt"></i> <span>נקה הכל</span>
        </button>
      </div>
    </section>
  );
};

export default TaskList;