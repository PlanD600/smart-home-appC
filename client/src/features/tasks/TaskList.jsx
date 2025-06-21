// client/src/features/tasks/TaskList.jsx

import React from 'react';
import TaskItem from './TaskItem';
import AddItemForm from '../common/AddItemForm';
import { useAppContext } from '../../context/AppContext'; // ✅ Updated path
import { useListActions } from '../../context/ListActionsContext'; // ✅ Updated path
import { useModal } from '../../context/ModalContext';

// --- Small internal component for the AI modal content ---
const AiTaskPopup = ({ onRun, hideModal, loading }) => {
    const [text, setText] = React.useState('');
    
    const handleRun = () => {
        onRun(text);
        hideModal();
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">פרק משימה מורכבת</h3>
            <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="כתוב כאן משימה מורכבת (לדוגמה: 'לארגן מסיבת יום הולדת')"
                rows="5"
                className="w-full p-2 border rounded"
                disabled={loading}
            ></textarea>
            <div className="flex justify-center mt-4">
                <button 
                    onClick={handleRun} 
                    disabled={!text.trim() || loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'מפרק...' : 'פרק לתתי-משימות'}
                </button>
            </div>
        </div>
    );
};

const hasCompleted = (items) => items.some(i => i.completed || (i.subItems && hasCompleted(i.subItems)));

const TaskList = () => {
    // ✅ Get activeHome from AppContext
    const { activeHome } = useAppContext();
    // ✅ Get addItem, clearCompletedItems, runAiTask, and loading from ListActionsContext
    // Note: ensure runAiTask is added to ListActionsContext if it's not already there.
    const { addItem, clearCompletedItems, runAiTask, loading } = useListActions();
    
    const { showModal, hideModal } = useModal();
    const tasksList = activeHome?.tasksList || [];

    const handleClearCompleted = () => {
        showModal(
            <div className="p-4 bg-white rounded-lg shadow-lg text-center">
                <h3 className="text-lg font-semibold mb-4">האם למחוק את כל המשימות שהושלמו?</h3>
                <div className="flex justify-center gap-4">
                    <button onClick={() => { clearCompletedItems('tasks'); hideModal(); }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">אישור</button>
                    <button onClick={hideModal} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">ביטול</button>
                </div>
            </div>, { title: 'אישור ניקוי רשימה' }
        );
    };
    
    // Function to open the AI modal
    const openAiPopup = () => {
        showModal(
            <AiTaskPopup 
                onRun={runAiTask}
                hideModal={hideModal}
                loading={loading}
            />,
            { title: 'עזרת AI' }
        );
    };
    
    const canClear = hasCompleted(tasksList);
    
    return (
        <div className="list-container">
            <h2 className="list-title"><i className="fas fa-tasks"></i> רשימת משימות</h2>
            <AddItemForm listType="tasks" onAddItem={addItem} />
            <ul className="item-list">
                {tasksList.map(item => <TaskItem key={item._id} item={item} />)}
            </ul>
            <div className="list-actions">
                <button onClick={handleClearCompleted} className="clear-btn" disabled={!canClear || loading}>
                    <i className="fas fa-broom"></i> נקה משימות שהושלמו
                </button>
                {/* New AI button */}
                <button onClick={openAiPopup} className="ai-btn" disabled={loading}>
                    <i className="fas fa-robot"></i> עזרה מ-AI
                </button>
            </div>
        </div>
    );
};

export default TaskList;