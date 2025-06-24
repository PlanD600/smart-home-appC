import React, { useMemo } from 'react';
import { useListActions } from '@/context/ListActionsContext';
import { useModal } from '@/context/ModalContext';
import AssignUserForm from '../common/AssignUserForm';
import ViewAndEditComment from '../common/ViewAndEditComment';

const ShoppingItem = ({ item }) => {
    const { modifyItem, removeItem, deleteItemPermanently } = useListActions(); 
    const { showModal, showConfirmModal } = useModal();

    const itemClasses = useMemo(() => {
        let classes = "shopping-item";
        if (item.completed) classes += " completed";
        if (item.isUrgent) classes += " urgent";
        return classes;
    }, [item.completed, item.isUrgent]);

    const handleToggleComplete = () => {
        modifyItem('shopping', item._id, { completed: !item.completed });
    };

    const handleToggleUrgent = () => {
        modifyItem('shopping', item._id, { isUrgent: !item.isUrgent });
    };

    const handleAssignUser = () => {
        showModal(
            <AssignUserForm 
                item={item}
                onSave={(itemId, updates) => modifyItem('shopping', itemId, updates)}
            />,
            { title: 'שייך למשתמש' }
        );
    };

    const handleViewEditComment = () => {
        showModal(
            <ViewAndEditComment 
                item={item} 
                onSave={(itemId, updates) => modifyItem('shopping', item._id, updates)} 
            />,
            { title: 'הוסף/ערוך הערה' }
        );
    };

    const handleArchiveItem = () => removeItem('shopping', item._id);

    const handleDeletePermanently = () => {
        showConfirmModal(
            `האם אתה בטוח שברצונך למחוק את "${item.text}" לצמיתות?`,
            () => deleteItemPermanently('shopping', item._id)
        );
    };
    
    return (
        <li className={itemClasses} data-id={item._id}>
            <div className="item-main-content">
                <input 
                    type="checkbox" 
                    // ודא שהערך תמיד מוגדר (מונע אזהרות)
                    checked={item.completed ?? false} 
                    onChange={handleToggleComplete} 
                    className="item-checkbox" 
                />
                
                {/* --- קונטיינר חדש לטקסט ולהערה --- */}
                <div className="item-text-container" onClick={handleToggleComplete}>
                    <span className="item-text">{item.text}</span>
                    {/* תנאי להצגת ההערה רק אם היא קיימת */}
                    {item.comment && (
                        <span className="item-comment-text" onClick={(e) => {
                            e.stopPropagation(); // מונע מ-handleToggleComplete לפעול בלחיצה על ההערה
                            handleViewEditComment();
                        }}>
                            <i className="fas fa-comment-dots"></i>
                            {item.comment} {/* הצגת תוכן ההערה */}
                        </span>
                    )}
                </div>

                {item.assignedTo && <span className="assigned-user">{item.assignedTo}</span>}
            </div>
            
            <div className="item-actions">
                <button 
                    className={`action-btn ${item.isUrgent ? 'urgent-active' : ''}`} 
                    title="סמן כדחוף" 
                    onClick={handleToggleUrgent}
                >
                    <i className="fas fa-exclamation-triangle"></i>
                </button>
                <button 
                    className={`action-btn ${item.assignedTo ? 'assigned-active' : ''}`} 
                    title="שייך למשתמש" 
                    onClick={handleAssignUser}
                >
                    <i className="fas fa-user-plus"></i>
                </button>
                <button 
                    className="action-btn" 
                    title="הוסף/ערוך הערה" 
                    onClick={handleViewEditComment}
                >
                    <i className="fas fa-comment-dots"></i>
                </button>
                <button className="action-btn archive-btn" title="העבר לארכיון" onClick={handleArchiveItem}>
                    <i className="fas fa-archive"></i>
                </button>
                <button className="action-btn delete-btn" title="מחק לצמיתות" onClick={handleDeletePermanently}>
                    <i className="fas fa-trash-alt"></i>
                </button>
            </div>
        </li>
    );
};

export default ShoppingItem;