import React, { useMemo } from 'react';
import { useListActions } from '@/context/ListActionsContext';
import { useModal } from '@/context/ModalContext';
import AssignUserForm from '../common/AssignUserForm';
import ViewAndEditComment from '../common/ViewAndEditComment';

const ShoppingItem = ({ item }) => {
    // ודא ש-deleteItemPermanently נמשך מתוך ה-hook useListActions
    const { modifyItem, removeItem, deleteItemPermanently } = useListActions(); 
    const { showModal, showConfirmModal } = useModal();

    // הנחה: itemClasses מוגדר כ-useMemo
    const itemClasses = useMemo(() => {
        let classes = "shopping-item";
        if (item.completed) classes += " completed";
        if (item.isUrgent) classes += " urgent";
        // הוסף לוגיקה נוספת עבור itemClasses אם קיימת
        return classes;
    }, [item.completed, item.isUrgent]);

    // הנחה: קיימות פונקציות לטיפול בפעולות על הפריט
    const handleToggleComplete = () => {
        modifyItem('shopping', item._id, { completed: !item.completed });
    };

    const handleToggleUrgent = () => {
        modifyItem('shopping', item._id, { isUrgent: !item.isUrgent });
    };

    const handleAssignUser = () => {
        showModal(
            <AssignUserForm currentAssignedTo={item.assignedTo} onAssign={(userId) => modifyItem('shopping', item._id, { assignedTo: userId })} />,
            { title: 'שייך למשתמש' }
        );
    };

    const handleViewEditComment = () => {
        showModal(
            <ViewAndEditComment currentComment={item.comment} onSave={(newComment) => modifyItem('shopping', item._id, { comment: newComment })} />,
            { title: 'הוסף/ערוך הערה' }
        );
    };

    // הפונקציה הקיימת להעברה לארכיון
    const handleArchiveItem = () => removeItem('shopping', item._id);

    // [NEW] פונקציה חדשה למחיקה לצמיתות
    const handleDeletePermanently = () => {
        showConfirmModal(
            `האם אתה בטוח שברצונך למחוק את "${item.text}" לצמיתות?`,
            () => deleteItemPermanently('shopping', item._id)
        );
    };
    
    return (
        <li className={itemClasses} data-id={item._id}>
            {/* תוכן הפריט הראשי */}
            <div className="item-main-content">
                <input 
                    type="checkbox" 
                    checked={item.completed} 
                    onChange={handleToggleComplete} 
                    className="item-checkbox" 
                />
                <span className="item-text" onClick={handleToggleComplete}>
                    {item.text}
                    {item.comment && <i className="fas fa-comment-alt item-comment-indicator"></i>}
                </span>
                {item.assignedTo && <span className="assigned-user">{item.assignedTo}</span>}
            </div>
            
            <div className="item-actions">
                {/* כפתורים קיימים (כפי שהיו בקוד שסיפקת, עם הנחות על הלוגיקה הפנימית) */}
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
                    className={`action-btn ${item.comment ? 'comment-active' : ''}`} 
                    title="הוסף/ערוך הערה" 
                    onClick={handleViewEditComment}
                >
                    <i className="fas fa-comment-dots"></i>
                </button>
                <button className="action-btn archive-btn" title="העבר לארכיון" onClick={handleArchiveItem}>
                    <i className="fas fa-archive"></i>
                </button>
                {/* [NEW] כפתור מחיקה לצמיתות */}
                <button className="action-btn delete-btn" title="מחק לצמיתות" onClick={handleDeletePermanently}>
                    <i className="fas fa-trash-alt"></i>
                </button>
            </div>
        </li>
    );
};

export default ShoppingItem;