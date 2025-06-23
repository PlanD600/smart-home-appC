import React, { useMemo } from 'react';
import { useListActions } from '@/context/ListActionsContext';
import { useModal } from '@/context/ModalContext';
import AssignUserForm from '../common/AssignUserForm';
import ViewAndEditComment from '../common/ViewAndEditComment';

/**
 * [FIXED] This is an internal helper component. It is defined here
 * and should not be imported from a separate file.
 * Renders a list of sub-tasks recursively.
 */
const SubTasksList = ({ subItems }) => {
    if (!subItems || subItems.length === 0) {
        return null;
    }

    return (
        <ul className="sub-task-list">
            {subItems.map(subItem => (
                <TaskItem key={subItem._id} item={subItem} isSubItem={true} />
            ))}
        </ul>
    );
};

/**
 * Displays a single task item, handling user interactions and recursive rendering of sub-tasks.
 */
const TaskItem = ({ item, isSubItem = false }) => {
    const { modifyItem, removeItem } = useListActions();
    const { showModal } = useModal();

    const itemClasses = useMemo(() => {
        let classes = 'task-item';
        if (item.completed) classes += ' completed';
        if (item.isUrgent) classes += ' urgent';
        if (isSubItem) classes += ' is-sub-item';
        return classes;
    }, [item.completed, item.isUrgent, isSubItem]);

    // --- Action Handlers ---
    const handleToggleComplete = () => {
        modifyItem('tasks', item._id, { completed: !item.completed });
    };

    const handleToggleUrgent = () => {
        modifyItem('tasks', item._id, { isUrgent: !item.isUrgent });
    };

    const handleArchiveItem = () => {
        removeItem('tasks', item._id);
    };

    const handleAssignClick = () => {
        showModal(
            <AssignUserForm 
                item={item} 
                onSave={(itemId, updates) => modifyItem('tasks', itemId, updates)}
            />, 
            { title: 'שייך משימה למשתמש' }
        );
    };

    const handleCommentClick = () => {
        showModal(
            <ViewAndEditComment 
                item={item} 
                onSave={(itemId, updates) => modifyItem('tasks', itemId, updates)}
            />, 
            { title: 'הערה' }
        );
    };
    
    return (
        <li className={itemClasses} data-id={item._id}>
            <div className="task-item-content">
                <div className="item-main-content">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={handleToggleComplete}
                            aria-label={`Mark ${item.text} as complete`}
                        />
                        <span className="custom-checkbox"></span>
                    </label>
                    <div className="item-text-details">
                        <span className="item-text">{item.text}</span>
                        <div className="item-sub-details">
                            <span><i className="fas fa-tag"></i> {item.category || 'כללית'}</span>
                            {item.assignedTo && <span><i className="fas fa-user"></i> {item.assignedTo}</span>}
                            {item.comment && (
                                <span className="comment-indicator" title={item.comment} onClick={handleCommentClick}>
                                    <i className="fas fa-info-circle"></i> הערה
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="item-actions">
                    <button className="action-btn" title="סמן כדחוף" onClick={handleToggleUrgent}>
                        <i className={`fas fa-star ${item.isUrgent ? 'urgent-active' : ''}`}></i>
                    </button>
                    <button className="action-btn" title="שייך למשתמש" onClick={handleAssignClick}>
                        <i className="fas fa-user-tag"></i>
                    </button>
                    <button className="action-btn" title="הוסף/ערוך הערה" onClick={handleCommentClick}>
                        <i className="fas fa-comment-dots"></i>
                    </button>
                    <button className="action-btn archive-btn" title="העבר לארכיון" onClick={handleArchiveItem}>
                        <i className="fas fa-archive"></i>
                    </button>
                </div>
            </div>
            
            {/* Render sub-tasks if they exist */}
            <SubTasksList subItems={item.subItems} />
        </li>
    );
};

export default TaskItem;
