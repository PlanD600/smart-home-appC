/* === client/src/features/tasks/TaskList.jsx === */
import React, { useState, useMemo } from 'react';
import TaskItem from './TaskItem';
import AddItemForm from '../common/AddItemForm';
import { useAppContext } from '@/context/AppContext';
import { useListActions } from '@/context/ListActionsContext'; 
import { useModal } from '@/context/ModalContext';
import TemplateManager from '@/features/templates/TemplateManager';
import CategoryManager from '@/features/categories/CategoryManager';

const AiTaskPopup = ({ onRun, hideModal, loading }) => {
    const [text, setText] = React.useState('');
    const handleRun = () => {
        if (!text.trim() || loading) return;
        onRun(text);
        hideModal();
    };
    return (
        <div className="p-4 bg-white rounded-lg">
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
                    className="primary-action"
                >
                    {loading ? 'מפרק...' : 'פרק לתתי-משימות'}
                </button>
            </div>
        </div>
    );
};

const TaskList = () => {
    const { activeHome, loading: isAppLoading } = useAppContext();
    const { addItem, clearCompletedItems, clearList, runAiTask, loading: isActionsLoading } = useListActions(); 
    const { showModal, hideModal, showConfirmModal } = useModal();
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt_desc');

    const loading = isAppLoading || isActionsLoading;
    const tasksList = activeHome?.tasksList || [];

    const processedList = useMemo(() => {
        let filtered = [...tasksList];
        if (filter === 'completed') {
            filtered = filtered.filter(item => item.completed);
        } else if (filter === 'active') {
            filtered = filtered.filter(item => !item.completed);
        }

        const sortItems = (items) => {
            items.sort((a, b) => {
                if (a.isUrgent && !b.isUrgent) return -1;
                if (!a.isUrgent && b.isUrgent) return 1;
                if (sortBy === 'text_asc') {
                    return a.text.localeCompare(b.text, 'he');
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            items.forEach(item => {
                if (item.subItems) sortItems(item.subItems);
            });
            return items;
        };
        
        return sortItems(filtered);

    }, [tasksList, filter, sortBy]);

    const canClearCompleted = useMemo(() => tasksList.some(i => i.completed), [tasksList]);

    const openCategoryManager = () => showModal(<CategoryManager />, { title: 'ניהול קטגוריות' });
    const openTemplateManager = () => showModal(<TemplateManager />, { title: 'החל תבנית' });
    const openAiPopup = () => showModal(<AiTaskPopup onRun={runAiTask} hideModal={hideModal} loading={loading} />, { title: 'עזרת AI' });
    const handleClearList = () => showConfirmModal('האם אתה בטוח שברצונך למחוק את כל המשימות לצמיתות?', () => clearList('tasks'));

    return (
        <div className="list-container">
            <header className="list-header">
                <h2 className="list-title"><i className="fas fa-tasks"></i> רשימת משימות</h2>
                <div className="list-actions">
                    <button onClick={openCategoryManager} className="header-style-button" disabled={loading} title="ניהול קטגוריות"><i className="fas fa-tags"></i> <span className="btn-text">קטגוריות</span></button>
                    <button onClick={openTemplateManager} className="header-style-button" disabled={loading} title="החל מתבנית"><i className="fas fa-file-alt"></i> <span className="btn-text">מתבנית</span></button>
                    <button onClick={openAiPopup} className="ai-btn" disabled={loading} title="עזרה מ-AI"><i className="fas fa-robot"></i> <span className="btn-text">פרק משימה</span></button>
                    <button onClick={() => showConfirmModal('האם לארכב את כל המשימות שהושלמו?', () => clearCompletedItems('tasks'))} className="clear-btn" disabled={!canClearCompleted || loading} title="ארכב משימות שהושלמו"><i className="fas fa-archive"></i> <span className="btn-text">נקה שהושלמו</span></button>
                    <button onClick={handleClearList} className="clear-btn danger-btn" disabled={tasksList.length === 0 || loading} title="מחק רשימה"><i className="fas fa-trash-alt"></i> <span className="btn-text">מחק הכל</span></button>
                </div>
            </header>

            <AddItemForm listType="tasks" onAddItem={addItem} />

            <div className="list-controls">
                <div className="control-group">
                    <label htmlFor="task-filter-status">הצג:</label>
                    <select id="task-filter-status" value={filter} onChange={(e) => setFilter(e.target.value)} disabled={loading}>
                        <option value="all">הכל</option>
                        <option value="active">משימות פעילות</option>
                        <option value="completed">משימות שהושלמו</option>
                    </select>
                </div>
                <div className="control-group">
                    <label htmlFor="task-sort-by">מיין לפי:</label>
                    <select id="task-sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} disabled={loading}>
                        <option value="createdAt_desc">החדש ביותר</option>
                        <option value="text_asc">א'-ב'</option>
                    </select>
                </div>
            </div>

            <ul className="item-list">
                {loading && processedList.length === 0 ? (
                    <p className="list-message">טוען משימות...</p>
                ) : processedList.length === 0 ? (
                    <p className="list-message">הרשימה ריקה.</p>
                ) : (
                    processedList.map(item => (
                        <TaskItem key={item._id} item={item} listType="tasks" />
                    ))
                )}
            </ul>
        </div>
    );
};
export default TaskList;