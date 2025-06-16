import React, { useContext, useState } from 'react';
import { HomeContext } from '../../context/HomeContext.jsx';

// רכיב קטן פנימי לניהול טופס ההערה (זהה לחלוטין לקודם)
const CommentForm = ({ initialValue, onSave, onCancel }) => {
  const [comment, setComment] = useState(initialValue);

  return (
    <div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows="4"
        style={{ width: '100%', boxSizing: 'border-box' }}
      />
      <div className="modal-footer">
        <button className="primary-action" onClick={() => onSave(comment)}>שמור</button>
        <button className="secondary-action" onClick={onCancel}>בטל</button>
      </div>
    </div>
  );
};

function TaskItem({ item }) {
  const { updateItemInHome, deleteItemFromHome, archiveItemInHome, openModal, closeModal } = useContext(HomeContext);
  
  // ההבדל היחיד - סוג הפריט
  const itemType = 'taskItems';

  const handleToggleComplete = () => updateItemInHome(itemType, item._id, { completed: !item.completed });
  const handleToggleUrgent = () => updateItemInHome(itemType, item._id, { isUrgent: !item.isUrgent });

  const handleDelete = () => {
    if (window.confirm(`האם למחוק את המטלה "${item.text}"?`)) {
      deleteItemFromHome(itemType, item._id);
    }
  };

  const handleArchive = () => {
    if (window.confirm(`האם להעביר לארכיון את המטלה "${item.text}"?`)) {
      archiveItemInHome(itemType, item._id);
    }
  };

  const handleComment = () => {
    openModal(
      `הערה עבור: ${item.text}`,
      <CommentForm
        initialValue={item.comment || ''}
        onSave={(newComment) => {
          updateItemInHome(itemType, item._id, { comment: newComment });
          closeModal();
        }}
        onCancel={closeModal}
      />
    );
  };

  return (
    <li className={`${item.completed ? 'completed' : ''} ${item.isUrgent ? 'urgent-item' : ''}`}>
      <input type="checkbox" checked={item.completed} onChange={handleToggleComplete} />
      <div className="item-text">
        {item.text}
        <span className="item-details">
          {item.category}
          {item.assignedTo !== 'משותף' && ` | ${item.assignedTo}`}
          {item.comment && <i className="fas fa-sticky-note" style={{ marginLeft: '8px', cursor: 'pointer', color: '#E9A825' }} onClick={handleComment}></i>}
        </span>
      </div>
      <div className="item-actions">
        <button className="action-btn" onClick={handleToggleUrgent} title="דחיפות"><i className="far fa-star"></i></button>
        <button className="action-btn" onClick={handleComment} title="הערה"><i className="fas fa-comment"></i></button>
        <button className="action-btn" onClick={handleArchive} title="ארכיון"><i className="fas fa-archive"></i></button>
        <button className="action-btn" onClick={handleDelete} title="מחק"><i className="far fa-trash-alt"></i></button>
      </div>
    </li>
  );
}

export default TaskItem;