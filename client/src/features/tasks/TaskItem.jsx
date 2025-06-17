import React from 'react';
import { useHome } from '../../context/HomeContext';

const TaskItem = ({ item }) => {
  const { updateItemInList, deleteItemFromList } = useHome();

  // Handle checkbox change to mark as complete/incomplete
  const handleToggleComplete = () => {
    updateItemInList('tasks', item._id, { completed: !item.completed });
  };

  // Handle priority change
  const handleToggleUrgent = () => {
    updateItemInList('tasks', item._id, { isUrgent: !item.isUrgent });
  };

  // Handle item deletion with confirmation
  const handleDelete = () => {
    if (window.confirm(`האם למחוק את המשימה "${item.text}"?`)) {
      deleteItemFromList('tasks', item._id);
    }
  };
  
  // Combine class names based on the item's state
  const liClassName = `
    ${item.completed ? 'completed' : ''}
    ${item.isUrgent ? 'urgent-item' : ''}
  `.trim();

  return (
    <li className={liClassName} data-id={item._id}>
      <input 
        type="checkbox" 
        checked={item.completed} 
        onChange={handleToggleComplete}
        aria-label={`סמן כהושלם עבור ${item.text}`} 
      />
      <div className="item-text">
        {item.text}
        <span className="item-details">
          קטגוריה: {item.category || 'כללית'}
          {item.assignedTo && ` | שויך ל: ${item.assignedTo}`}
        </span>
      </div>
      <div className="item-actions">
        <button 
            className="action-btn priority-btn" 
            title="דחיפות" 
            onClick={handleToggleUrgent}
            // Change color if the item is urgent
            style={{ color: item.isUrgent ? 'var(--coral-red)' : '#aaa' }}
        >
          <i className="fas fa-star"></i>
        </button>
        {/* Placeholder buttons for future functionality */}
        <button className="action-btn assign-user-btn" title="שייך למשתמש"><i className="fas fa-user-tag"></i></button>
        <button className="action-btn comment-btn" title="הערה"><i className="fas fa-comment"></i></button>
        <button className="action-btn delete-btn" title="מחק" onClick={handleDelete}>
          <i className="far fa-trash-alt"></i>
        </button>
      </div>
    </li>
  );
};

export default TaskItem;