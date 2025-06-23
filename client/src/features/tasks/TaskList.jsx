import React, { useState, useMemo } from 'react';
import TaskItem from './TaskItem';
import AddItemForm from '../common/AddItemForm';
import { useAppContext } from '@/context/AppContext';
// ודא ש-clearList נמשך מתוך useListActions
import { useListActions } from '@/context/ListActionsContext'; 
import { useModal } from '@/context/ModalContext';
import TemplateManager from '@/features/templates/TemplateManager';
import CategoryManager from '@/features/categories/CategoryManager';

// Internal component for the AI task modal (זהו הקוד המלא שסיפקת)
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
    // Hooks קיימים (כפי שסיפקת)
    const { activeHome, loading: isAppLoading } = useAppContext();
    // שינוי: ודא ש-clearList נכלל ב-destructuring של useListActions
    const { addItem, clearCompletedItems, clearList, runAiTask, loading: isActionsLoading } = useListActions(); 
    const { showModal, hideModal, showConfirmModal } = useModal();

    // States קיימים (כפי שסיפקת)
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt_desc');

    const loading = isAppLoading || isActionsLoading;
    const tasksList = activeHome?.tasksList || [];

    // processedList (לוגיקת סינון ומיון כפי שסיפקת)
    const processedList = useMemo(() => {
        let filtered = [...tasksList];
        if (filter === 'completed') {
            filtered = filtered.filter(item => item.completed);
        } else if (filter === 'active') {
            filtered = filtered.filter(item => !item.completed);
        }

        filtered.sort((a, b) => {
            if (a.isUrgent && !b.isUrgent) return -1;
            if (!a.isUrgent && b.isUrgent) return 1;
            if (sortBy === 'text_asc') {
                return a.text.localeCompare(b.text, 'he');
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return filtered;
    }, [tasksList, filter, sortBy]);

    // שינוי: שינוי שם המשתנה ל-canClearCompleted כפי שהיה בקוד החדש
    const canClearCompleted = useMemo(() => tasksList.some(i => i.completed), [tasksList]);

    // פונקציות פתיחת מודלים (כפי שסיפקת, עם שינוי שם המשתנה ל-canClearCompleted בכפתור "נקה")
    const openCategoryManager = () => showModal(<CategoryManager />, { title: 'ניהול קטגוריות' });
    const openTemplateManager = () => showModal(<TemplateManager />, { title: 'החל תבנית' });
    // openAiPopup - כבר משתמש ב-AiTaskPopup הקיים
    const openAiPopup = () => showModal(<AiTaskPopup onRun={runAiTask} hideModal={hideModal} loading={loading} />, { title: 'עזרת AI' });

    // [NEW] פונקציה חדשה למחיקת רשימה לצמיתות
    const handleClearList = () => {
        showConfirmModal(
            'האם אתה בטוח שברצונך למחוק את כל המשימות ברשימה זו לצמיתות?',
            () => clearList('tasks')
        );
    };

    return (
        <div className="list-container">
            <header className="list-header">
                <h2 className="list-title"><i className="fas fa-tasks"></i> רשימת משימות</h2>
                <div className="list-actions">
                    {/* כפתורים קיימים (כפי שסיפקת) */}
                    <button onClick={openCategoryManager} className="header-style-button" disabled={loading} title="ניהול קטגוריות">
                        <i className="fas fa-tags"></i> <span className="btn-text">קטגוריות</span>
                    </button>
                    <button onClick={openTemplateManager} className="header-style-button" disabled={loading} title="החל מתבנית">
                        <i className="fas fa-file-alt"></i> <span className="btn-text">מתבנית</span>
                    </button>
                    <button onClick={openAiPopup} className="ai-btn" disabled={loading} title="עזרה מ-AI">
                        <i className="fas fa-robot"></i> <span className="btn-text">פרק משימה</span>
                    </button>
                    {/* שינוי טקסט הכפתור "נקה" ל"נקה שהושלמו" והמשתנה ל-canClearCompleted */}
                    <button onClick={() => showConfirmModal('האם לארכב את כל המשימות שהושלמו?', () => clearCompletedItems('tasks'))} className="clear-btn" disabled={!canClearCompleted || loading} title="ארכב משימות שהושלמו">
                        <i className="fas fa-archive"></i> <span className="btn-text">נקה שהושלמו</span>
                    </button>
                    {/* [NEW] כפתור מחיקת רשימה לצמיתות */}
                    <button onClick={handleClearList} className="clear-btn danger-btn" disabled={tasksList.length === 0 || loading} title="מחק רשימה">
                        <i className="fas fa-trash-alt"></i> <span className="btn-text">מחק הכל</span>
                    </button>
                </div>
            </header>

            <AddItemForm listType="tasks" onAddItem={addItem} />

            {/* בקרות סינון ומיון (כפי שסיפקת) */}
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

            {/* רשימת המשימות עצמה (כפי שסיפקת) */}
            <ul className="item-list">
                {loading && processedList.length === 0 ? (
                    <p className="list-message">טוען משימות...</p>
                ) : processedList.length === 0 ? (
                    <p className="list-message">
                        {filter === 'all' ? 'אין משימות להצגה. זמן להוסיף כמה!' : 'אין משימות התואמות לסינון זה.'}
                    </p>
                ) : (
                    processedList.map(item => (
                        <TaskItem key={item._id} item={item} />
                    ))
                )}
            </ul>
        </div>
    );
};

export default TaskList;