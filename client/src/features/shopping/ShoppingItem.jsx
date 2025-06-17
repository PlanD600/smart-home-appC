import React from 'react';
import { useHome } from '../../context/HomeContext';

const ShoppingItem = ({ item }) => {
  const { updateItemInList, deleteItemFromList } = useHome();

  // Handle checkbox change
  const handleToggleComplete = () => {
    updateItemInList('shopping', item._id, { completed: !item.completed });
  };

  // Handle priority change
  const handleToggleUrgent = () => {
    updateItemInList('shopping', item._id, { isUrgent: !item.isUrgent });
  };

  // Handle item deletion
  const handleDelete = () => {
    if (window.confirm(`האם למחוק את "${item.text}"?`)) {
      deleteItemFromList('shopping', item._id);
    }
  };
  
  // Combine class names based on item state
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
            style={{ color: item.isUrgent ? 'var(--coral-red)' : '#aaa' }}
        >
          <i className="fas fa-star"></i>
        </button>
        {/* We will add assign user and comment functionality later */}
        <button className="action-btn assign-user-btn" title="שייך למשתמש"><i className="fas fa-user-tag"></i></button>
        <button className="action-btn comment-btn" title="הערה"><i className="fas fa-comment"></i></button>
        <button className="action-btn delete-btn" title="מחק" onClick={handleDelete}>
          <i className="far fa-trash-alt"></i>
        </button>
      </div>
    </li>
  );
};

export default ShoppingItem;