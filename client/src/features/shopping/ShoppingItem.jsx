// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/shopping/ShoppingItem.jsx
import React from 'react';
import { useHome } from '../../context/HomeContext';

function ShoppingItem({ item }) {
    const { currentHome, updateCurrentHome } = useHome();

    const handleUpdate = (updates) => {
        const updatedItems = currentHome.shoppingItems.map(i => 
            i._id === item._id ? { ...i, ...updates } : i
        );
        updateCurrentHome({ shoppingItems: updatedItems });
    };

    const handleDelete = () => {
        const updatedItems = currentHome.shoppingItems.filter(i => i._id !== item._id);
        updateCurrentHome({ shoppingItems: updatedItems });
    };

    return (
        <li className={`${item.isUrgent ? 'urgent-item' : ''} ${item.isCompleted ? 'completed' : ''}`}>
            <input 
                type="checkbox" 
                checked={item.isCompleted}
                onChange={() => handleUpdate({ isCompleted: !item.isCompleted })}
                aria-label={`Mark ${item.name} as complete`}
            />
            <div className="item-text">
                {item.name}
                {/* Details can be added here later */}
            </div>
            <div className="item-actions">
                <button 
                    className="action-btn priority-btn" 
                    onClick={() => handleUpdate({ isUrgent: !item.isUrgent })}
                    title="Toggle priority"
                >
                    <i className="far fa-star"></i>
                </button>
                <button 
                    className="action-btn delete-btn" 
                    onClick={handleDelete}
                    title="Delete item"
                >
                    <i className="far fa-trash-alt"></i>
                </button>
                {/* More actions can be added here */}
            </div>
        </li>
    );
}

export default ShoppingItem;