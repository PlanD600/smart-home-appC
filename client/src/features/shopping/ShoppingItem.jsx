// client/src/features/shopping/ShoppingItem.jsx
import React from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import CommentForm from '../common/CommentForm';
import AssignUserForm from '../common/AssignUserForm';

function ShoppingItem({ item }) {
    const { updateShoppingItem, deleteShoppingItem, archiveItem } = useHome();
    const { openModal } = useModal();

    const handleEdit = () => {
        const newName = prompt("שנה את שם הפריט:", item.name);
        if (newName && newName.trim() !== '' && newName.trim() !== item.name) {
            updateShoppingItem(item._id, { name: newName.trim() });
        }
    };

    return (
        <li className={`${item.isCompleted ? 'completed' : ''} ${item.isUrgent ? 'urgent-item' : ''}`}>
            <input type="checkbox" checked={!!item.isCompleted} onChange={() => updateShoppingItem(item._id, { isCompleted: !item.isCompleted })} />
            <div className="item-text">
                {item.name}
                <span className="item-details">
                    {item.assignedTo && item.assignedTo !== 'משותף' ? `שויך ל: ${item.assignedTo}` : 'פריט משותף'}
                    {item.comment && <i className="fas fa-comment" style={{ marginInlineStart: '8px' }} title={item.comment}></i>}
                </span>
            </div>
            <div className="item-actions">
                <button className="action-btn priority-btn" title="דחוף" onClick={() => updateShoppingItem(item._id, { isUrgent: !item.isUrgent })}>
                    <i className="fas fa-star"></i>
                </button>
                <button className="action-btn" title="שייך למשתמש" onClick={() => openModal(<AssignUserForm item={item} onSave={updateShoppingItem} />)}>
                    <i className="fas fa-user-tag"></i>
                </button>
                <button className="action-btn" title="הוסף/ערוך הערה" onClick={() => openModal(<CommentForm item={item} onSave={updateShoppingItem} />)}>
                    <i className="fas fa-comment"></i>
                </button>
                 <button className="action-btn" title="ערוך שם" onClick={handleEdit}>
                    <i className="fas fa-edit"></i>
                </button>
                <button className="action-btn" title="העבר לארכיון" onClick={() => archiveItem('shopping', item._id)}>
                    <i className="fas fa-archive"></i>
                </button>
                <button className="action-btn delete-btn" title="מחק" onClick={() => deleteShoppingItem(item._id)}>
                    <i className="far fa-trash-alt"></i>
                </button>
            </div>
        </li>
    );
}
export default ShoppingItem;