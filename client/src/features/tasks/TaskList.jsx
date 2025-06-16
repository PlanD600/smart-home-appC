// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/tasks/TaskList.jsx
import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext';
import TaskItem from './TaskItem';
import LoadingSpinner from '../../components/LoadingSpinner';

function TaskList() {
    const { currentHome, updateCurrentHome, loading } = useHome();
    const [newItemName, setNewItemName] = useState('');

    const handleAddItem = async () => {
        if (newItemName.trim() === '' || !currentHome) return;

        // מכינים את האובייקט של המשימה החדשה
        const newTask = {
            _id: `temp_${Date.now()}`, // ID זמני עד לקבלת תשובה מהשרת
            name: newItemName,
            isCompleted: false,
            isUrgent: false,
            category: 'כללית', // אפשר להוסיף פה בחירת קטגוריה בעתיד
        };

        // יוצרים מערך חדש עם המשימה החדשה בסופו
        const updatedTaskItems = [...(currentHome.taskItems || []), newTask];

        // מעדכנים את השרת והמצב הגלובלי
        await updateCurrentHome({ taskItems: updatedTaskItems });

        // מנקים את תיבת הטקסט
        setNewItemName('');
    };

    if (loading && !currentHome) {
        return <LoadingSpinner />;
    }
    
    if (!currentHome) {
        return <p>יש לבחור בית תחילה.</p>;
    }

    return (
        <section id="task-list" className="list-section active">
            <div className="list-title-container">
                <h3>רשימת מטלות</h3>
                {/* ניתן להוסיף פה כפתורי פעולה בעתיד */}
            </div>

            <div className="add-area">
                <div className="add-item-form">
                    <input
                        type="text"
                        className="add-item-input"
                        placeholder="הוסף מטלה חדשה..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                        disabled={loading}
                    />
                    <button className="add-item-btn" onClick={handleAddItem} disabled={loading}>
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>}
                    </button>
                    {/* אפשר להוסיף את כפתור ה-Gemini כאן בעתיד */}
                </div>
            </div>

            <div className="item-list">
                 <ul className="item-list-ul">
                    {currentHome.taskItems && currentHome.taskItems.length > 0 ? (
                        currentHome.taskItems.map((item) => (
                            <TaskItem key={item._id} item={item} />
                        ))
                    ) : (
                        <p style={{textAlign: 'center'}}>אין משימות להצגה.</p>
                    )}
                </ul>
            </div>
        </section>
    );
}

export default TaskList;