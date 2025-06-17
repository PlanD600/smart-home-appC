import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext';
import TaskItem from './TaskItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useModal } from '../../context/ModalContext';
import { Gemini } from '../../services/gemini'; // נצטרך ליצור את הקובץ הזה

function TaskList() {
    const { currentHome, addTask, loading } = useHome();
    const [newItemName, setNewItemName] = useState('');

    const handleAddItem = () => {
        if (newItemName.trim() && currentHome) {
            addTask({ name: newItemName });
            setNewItemName('');
        }
    };
    
    if (!currentHome) return <p>טוען רשימת מטלות...</p>;

    return (
        <section id="task-list" className="list-section active">
            <div className="list-title-container"><h3>רשימת מטלות</h3></div>
            <div className="add-area">
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddItem()} placeholder="הוסף מטלה..."/>
                <button onClick={handleAddItem} disabled={loading}>הוסף</button>
            </div>
            <ul className="item-list-ul">
                {(currentHome.taskItems || []).map(item => (
                    <TaskItem key={item._id} item={item} />
                ))}
            </ul>
        </section>
    );
}

export default TaskList;