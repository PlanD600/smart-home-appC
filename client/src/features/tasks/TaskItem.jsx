// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/tasks/TaskItem.jsx
import React from 'react';
import { useHome } from '../../context/HomeContext';

function TaskItem({ item }) {
    const { currentHome, updateCurrentHome } = useHome();

    /**
     * פונקציית עזר גנרית לעדכון המשימה.
     * היא מקבלת אובייקט עם השדות שצריך לעדכן.
     * לדוגמה: handleUpdate({ isCompleted: true })
     */
    const handleUpdate = (updates) => {
        if (!currentHome) return;

        // יוצרים מערך חדש של משימות
        const updatedItems = currentHome.taskItems.map(task =>
            task._id === item._id ? { ...task, ...updates } : task
        );

        // קוראים לפונקציה מה-Context שתעדכן את השרת והמצב הגלובלי
        updateCurrentHome({ taskItems: updatedItems });
    };

    /**
     * פונקציה למחיקת המשימה
     */
    const handleDelete = () => {
        if (!currentHome) return;

        // יוצרים מערך חדש ללא המשימה הנוכחית
        const updatedItems = currentHome.taskItems.filter(task => task._id !== item._id);

        // מעדכנים את השרת והמצב הגלובלי
        updateCurrentHome({ taskItems: updatedItems });
    };

    return (
        <li className={`${item.isUrgent ? 'urgent-item' : ''} ${item.isCompleted ? 'completed' : ''}`}>
            <input
                type="checkbox"
                checked={item.isCompleted || false}
                onChange={() => handleUpdate({ isCompleted: !item.isCompleted })}
                aria-label={`Mark ${item.name} as complete`}
            />
            <div className="item-text">
                {item.name}
                <span className="item-details">
                    קטגוריה: {item.category}
                    {item.assignedTo && ` | שויך ל: ${item.assignedTo}`}
                </span>
            </div>
            <div className="item-actions">
                <button
                    className="action-btn priority-btn"
                    onClick={() => handleUpdate({ isUrgent: !item.isUrgent })}
                    title="שנה עדיפות"
                >
                    <i className="far fa-star"></i>
                </button>
                <button
                    className="action-btn delete-btn"
                    onClick={handleDelete}
                    title="מחק משימה"
                >
                    <i className="far fa-trash-alt"></i>
                </button>
                {/* כאן נוכל להוסיף בעתיד כפתורים נוספים כמו עריכה או הוספת הערה */}
            </div>
        </li>
    );
}

export default TaskItem;