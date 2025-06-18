import React from 'react';
import { useHome } from '../../context/HomeContext'; //
import { useModal } from '../../context/ModalContext'; // ייבוא useModal
import AssignUserForm from '../common/AssignUserForm'; // ייבוא הקומפוננטה
import CommentForm from '../common/CommentForm'; // ייבוא הקומפוננטה

const ShoppingItem = ({ item }) => {
  const { modifyItem, removeItem } = useHome(); // שינוי: מ-updateItemInList, deleteItemFromList ל-modifyItem, removeItem
  const { showModal } = useModal(); //

  // Handle checkbox change
  const handleToggleComplete = () => {
    modifyItem('shopping', item._id, { completed: !item.completed }); // שינוי: מ-updateItemInList ל-modifyItem
  };

  // Handle priority change
  const handleToggleUrgent = () => {
    modifyItem('shopping', item._id, { isUrgent: !item.isUrgent }); // שינוי: מ-updateItemInList ל-modifyItem
  };

  // Handle item deletion
  const handleDelete = () => {
    if (window.confirm(`האם למחוק את "${item.text}"?`)) {
      removeItem('shopping', item._id); // שינוי: מ-deleteItemFromList ל-removeItem
    }
  };

  const handleAssignClick = () => {
    showModal(<AssignUserForm item={item} onSave={(itemId, data) => modifyItem('shopping', itemId, data)} />, { title: 'שיוך משתמש לפריט' }); //
  };

  const handleCommentClick = () => {
    showModal(<CommentForm item={item} onSave={(itemId, data) => modifyItem('shopping', itemId, data)} />, { title: 'הוספת הערה לפריט' }); //
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
          {item.comment && ` | הערה: ${item.comment}`} {/* הצגת הערה אם קיימת */}
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

export default ShoppingItem;