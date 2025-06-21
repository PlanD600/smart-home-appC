// client/src/features/shopping/ShoppingItem.jsx

import React from 'react';
import { useListActions } from '../../context/ListActionsContext'; // ✅ נתיב מעודכן
import { useModal } from '../../context/ModalContext';
import AssignUserForm from '../common/AssignUserForm';
import CommentForm from '../common/CommentForm';

const ShoppingItem = ({ item }) => {
    // ✅ קבלת modifyItem ו-removeItem מ-useListActions
    const { modifyItem, removeItem } = useListActions();
    const { showModal, hideModal } = useModal();

    const handleToggleComplete = () => {
        modifyItem('shopping', item._id, { completed: !item.completed });
    };

    const handleToggleUrgent = () => {
        modifyItem('shopping', item._id, { isUrgent: !item.isUrgent });
    };

    // 3. שדרוג פונקציית המחיקה
    const handleDelete = () => {
        showModal(
            <div className="p-4 bg-white rounded-lg shadow-lg text-center">
                <h3 className="text-lg font-semibold mb-4">האם למחוק את "{item.text}"?</h3>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => {
                            removeItem('shopping', item._id);
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
        // לוודא ש-AssignUserForm מקבל את `onSave` כפונקציה שתדע לקרוא ל-modifyItem
        showModal(<AssignUserForm item={item} onSave={(itemId, data) => modifyItem('shopping', itemId, data)} />, { title: 'שיוך משתמש לפריט' });
    };

    const handleCommentClick = () => {
        // לוודא ש-CommentForm מקבל את `onSave` כפונקציה שתדע לקרוא ל-modifyItem
        showModal(<CommentForm item={item} onSave={(itemId, data) => modifyItem('shopping', itemId, data)} />, { title: 'הוספת הערה לפריט' });
    };

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
                <button className="action-btn delete-btn" title="מחק" onClick={handleDelete}>
                    <i className="far fa-trash-alt"></i>
                </button>
            </div>
        </li>
    );
};

export default ShoppingItem;