import React from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import AssignUserForm from '../common/AssignUserForm';
import CommentForm from '../common/CommentForm';


const TaskItem = ({ item }) => {
  const { modifyItem, removeItem } = useHome();
  // Get both showModal and hideModal from the context
  const { showModal, hideModal } = useModal();


  // Handle checkbox change to mark as complete/incomplete
  const handleToggleComplete = () => {
    modifyItem('tasks', item._id, { completed: !item.completed });
  };

  // Handle priority change
  const handleToggleUrgent = () => {
    modifyItem('tasks', item._id, { isUrgent: !item.isUrgent });
  };

  // --- התיקון כאן ---
  // Handle item deletion with the custom modal
  const handleDelete = () => {
    showModal(
        <div className="p-4 bg-white rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4">האם למחוק את המשימה "{item.text}"?</h3>
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => {
                        removeItem('tasks', item._id);
                        hideModal();
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    אישור
                </button>
                <button
                    onClick={hideModal}
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                    ביטול
                </button>
            </div>
        </div>,
        { title: 'אישור מחיקה' }
    );
  };

  const handleAssignClick = () => {
    showModal(<AssignUserForm item={item} onSave={(itemId, data) => modifyItem('tasks', itemId, data)} />, { title: 'שיוך משתמש למשימה' });
  };

  const handleCommentClick = () => {
    showModal(<CommentForm item={item} onSave={(itemId, data) => modifyItem('tasks', itemId, data)} />, { title: 'הוספת הערה למשימה' });
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
          {item.comment && ` | הערה: ${item.comment}`}
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
        <button className="action-btn assign-user-btn" title="שייך למשתמש" onClick={handleAssignClick}>
          <i className="fas fa-user-tag"></i>
        </button>
        <button className="action-btn comment-btn" title="הערה" onClick={handleCommentClick}>
          <i className="fas fa-comment"></i>
        </button>
        {/* This button now correctly uses the updated handleDelete function */}
        <button className="action-btn delete-btn" title="מחק" onClick={handleDelete}>
          <i className="far fa-trash-alt"></i>
        </button>
      </div>
    </li>
  );
};

export default TaskItem;