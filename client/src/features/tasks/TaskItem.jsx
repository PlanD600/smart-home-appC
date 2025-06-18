import React from 'react';
import { useHome } from '../../context/HomeContext'; //
import { useModal } from '../../context/ModalContext'; // ייבוא useModal
import AssignUserForm from '../common/AssignUserForm'; // ייבוא הקומפוננטה
import CommentForm from '../common/CommentForm'; // ייבוא הקומפוננטה


const TaskItem = ({ item }) => {
  const { modifyItem, removeItem } = useHome(); // שינוי: מ-updateItemInList, deleteItemFromList ל-modifyItem, removeItem
  const { showModal } = useModal(); //


  // Handle checkbox change to mark as complete/incomplete
  const handleToggleComplete = () => {
    modifyItem('tasks', item._id, { completed: !item.completed }); // שינוי: מ-updateItemInList ל-modifyItem
  };

  // Handle priority change
  const handleToggleUrgent = () => {
    modifyItem('tasks', item._id, { isUrgent: !item.isUrgent }); // שינוי: מ-updateItemInList ל-modifyItem
  };

  // Handle item deletion with confirmation
  const handleDelete = () => {
    if (window.confirm(`האם למחוק את המשימה "${item.text}"?`)) {
      removeItem('tasks', item._id); // שינוי: מ-deleteItemFromList ל-removeItem
    }
  };

  const handleAssignClick = () => {
    showModal(<AssignUserForm item={item} onSave={(itemId, data) => modifyItem('tasks', itemId, data)} />, { title: 'שיוך משתמש למשימה' }); //
  };

  const handleCommentClick = () => {
    showModal(<CommentForm item={item} onSave={(itemId, data) => modifyItem('tasks', itemId, data)} />, { title: 'הוספת הערה למשימה' }); //
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
          {item.comment && ` | הערה: ${item.comment}`} {/* הצגת הערה אם קיימת */}
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
        <button className="action-btn assign-user-btn" title="שייך למשתמש" onClick={handleAssignClick}> {/* הוספת onClick */}
          <i className="fas fa-user-tag"></i>
        </button>
        <button className="action-btn comment-btn" title="הערה" onClick={handleCommentClick}> {/* הוספת onClick */}
          <i className="fas fa-comment"></i>
        </button>
        <button className="action-btn delete-btn" title="מחק" onClick={handleDelete}>
          <i className="far fa-trash-alt"></i>
        </button>
      </div>
    </li>
  );
};

export default TaskItem;