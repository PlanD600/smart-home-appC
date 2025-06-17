import React from 'react';

/**
 * @file TaskItem component
 * @description Renders a single task list item with its details and action buttons.
 * @param {object} props - Component props
 * @param {object} props.item - The task item object
 * @param {function} props.onToggleComplete - Callback for toggling item completion
 * @param {function} props.onTogglePriority - Callback for toggling item urgency/priority
 * @param {function} props.onDeleteItem - Callback for deleting an item
 * @param {function} props.onArchiveItem - Callback for archiving an item
 * @param {function} props.onAssignUser - Callback for assigning a user to an item
 * @param {function} props.onItemComment - Callback for adding/editing a comment on an item
 */
const TaskItem = ({ item, onToggleComplete, onTogglePriority, onDeleteItem, onArchiveItem, onAssignUser, onItemComment }) => {
  // Determine if assignedTo is 'משותף' or 'משותפת' for display purposes
  const isAssignedToShared = item.assignedTo && (item.assignedTo === 'משותף' || item.assignedTo === 'משותפת');

  return (
    <li className={item.isUrgent ? 'urgent-item' : ''}>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={(e) => onToggleComplete(item.id, e.target.checked)}
        aria-label={`סמן כהושלם עבור ${item.text}`}
      />
      <div className="item-text">
        {item.text}
        <span className="item-details">
          קטגוריה: {item.category || 'כללית'}
          {item.assignedTo && !isAssignedToShared && (
            <> | <i className="fas fa-user" aria-hidden="true"></i> {item.assignedTo}</>
          )}
          {item.comment && (
            <> | <button className="action-btn-inline comment-display-btn" title="הצג הערה" aria-label={`הצג הערה עבור ${item.text}`} onClick={() => onItemComment(item.id)}><i className="fas fa-sticky-note" aria-hidden="true"></i></button></>
          )}
        </span>
      </div>
      <div className="item-actions">
        <button
          className="action-btn priority-btn"
          title="דחיפות"
          aria-label={`שנה דחיפות עבור ${item.text}`}
          onClick={() => onTogglePriority(item.id)}
        >
          <i className="far fa-star" aria-hidden="true"></i>
        </button>
        <button
          className="action-btn assign-user-btn"
          title="שייך למשתמש"
          aria-label={`שייך משתמש עבור ${item.text}`}
          onClick={() => onAssignUser(item.id)}
        >
          <i className="fas fa-user-tag" aria-hidden="true"></i>
        </button>
        <button
          className="action-btn comment-btn"
          title="הערה"
          aria-label={`הוסף או ערוך הערה עבור ${item.text}`}
          onClick={() => onItemComment(item.id)}
        >
          <i className="fas fa-comment" aria-hidden="true"></i>
        </button>
        <button
          className="action-btn archive-btn"
          title="ארכיון"
          aria-label={`העבר לארכיון את ${item.text}`}
          onClick={() => onArchiveItem(item.id, item.text)}
        >
          <i className="fas fa-archive" aria-hidden="true"></i>
        </button>
        <button
          className="action-btn delete-btn"
          title="מחק"
          aria-label={`מחק את ${item.text}`}
          onClick={() => onDeleteItem(item.id, item.text)}
        >
          <i className="far fa-trash-alt" aria-hidden="true"></i>
        </button>
      </div>
    </li>
  );
};

export default TaskItem;
