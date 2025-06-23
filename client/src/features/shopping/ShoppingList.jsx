import React, { useState, useMemo } from 'react';
import ShoppingItem from './ShoppingItem';
import AddItemForm from '../common/AddItemForm';
import { useAppContext } from '@/context/AppContext';
import { useListActions } from '@/context/ListActionsContext';
import { useModal } from '@/context/ModalContext';
import TemplateManager from '@/features/templates/TemplateManager';
import CategoryManager from '@/features/categories/CategoryManager';

// Internal component for the AI recipe modal (זהו הקוד שהיה בקובץ ה"ישן" שלך וכלל את AiRecipePopup)
const AiRecipePopup = ({ onRun, hideModal, loading }) => {
    const [text, setText] = React.useState('');
    const handleRun = () => {
        if (!text.trim() || loading) return;
        onRun(text);
        hideModal();
    };
    return (
        <div className="p-4 bg-white rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">הפוך מתכון לרשימת קניות</h3>
            <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="הדבק כאן את המתכון המלא..."
                rows="8"
                className="w-full p-2 border rounded"
                disabled={loading}
            ></textarea>
            <div className="flex justify-center mt-4">
                <button 
                    onClick={handleRun} 
                    disabled={!text.trim() || loading}
                    className="primary-action"
                >
                    {loading ? 'מעבד...' : 'צור רשימה'}
                </button>
            </div>
        </div>
    );
};

const ShoppingList = () => {
    const { activeHome, loading: isAppLoading } = useAppContext();
    // שימו לב: הוספתי את clearList ל-useListActions כפי שהיה בקוד החדש המקורי
    const { addItem, clearCompletedItems, clearList, runAiRecipe, loading: isActionsLoading } = useListActions();
    const { showModal, hideModal, showConfirmModal } = useModal();
    
    // מצבי ה-state של סינון ומיון (נלקחו מהקוד ה"ישן" שלך)
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt_desc');

    // לוגיקת טעינה מאוחדת
    const loading = isAppLoading || isActionsLoading;
    const shoppingList = activeHome?.shoppingList || [];

    // processedList (לוגיקת סינון ומיון מהקוד ה"ישן" שלך)
    const processedList = useMemo(() => {
        let filtered = [...shoppingList];
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
    }, [shoppingList, filter, sortBy]);

    // שימו לב: שיניתי את canClear ל-canClearCompleted כפי שהיה בקוד החדש המקורי
    const canClearCompleted = useMemo(() => shoppingList.some(i => i.completed), [shoppingList]);
    
    // פונקציות פתיחת מודלים (מהקוד ה"ישן" שלך עם שינוי קטן ב-openAiPopup)
    const openCategoryManager = () => showModal(<CategoryManager />, { title: 'ניהול קטגוריות' });
    const openTemplateManager = () => showModal(<TemplateManager />, { title: 'החל תבנית' });
    // עדכון openAiPopup כדי להעביר את ה-props הנכונים כפי שהיה בקוד החדש המקורי
    const openAiPopup = () => showModal(<AiRecipePopup onRun={runAiRecipe} hideModal={hideModal} loading={loading} />, { title: 'יצירת רשימה ממתכון' });

    // [NEW] פונקציה חדשה למחיקת רשימה קבועה
    const handleClearList = () => {
        showConfirmModal(
            'האם אתה בטוח שברצונך למחוק את כל רשימת הקניות לצמיתות?',
            () => clearList('shopping')
        );
    };

    return (
        <div className="list-container">
            <header className="list-header">
                <h2 className="list-title"><i className="fas fa-shopping-cart"></i> רשימת קניות</h2>
                <div className="list-actions">
                    {/* כפתורים חדשים שהיו בקוד ה"חדש" (וחלקם גם בקוד ה"ישן" שסיפקת) */}
                    <button onClick={openCategoryManager} className="header-style-button" disabled={loading} title="ניהול קטגוריות">
                        <i className="fas fa-tags"></i> <span className="btn-text">קטגוריות</span>
                    </button>
                    <button onClick={openTemplateManager} className="header-style-button" disabled={loading} title="החל מתבנית">
                        <i className="fas fa-file-alt"></i> <span className="btn-text">מתבנית</span>
                    </button>
                    <button onClick={openAiPopup} className="ai-btn" disabled={loading} title="עזרה מ-AI">
                        <i className="fas fa-magic"></i> <span className="btn-text">ממתכון</span>
                    </button>
                    <button onClick={() => showConfirmModal('האם לארכב את כל הפריטים שנקנו?', () => clearCompletedItems('shopping'))} className="clear-btn" disabled={!canClearCompleted || loading} title="ארכב פריטים שנקנו">
                        <i className="fas fa-archive"></i> <span className="btn-text">נקה שהושלמו</span>
                    </button>
                    {/* [NEW] כפתור מחיקת רשימה קבועה */}
                    <button onClick={handleClearList} className="clear-btn danger-btn" disabled={shoppingList.length === 0 || loading} title="מחק רשימה">
                        <i className="fas fa-trash-alt"></i> <span className="btn-text">מחק הכל</span>
                    </button>
                </div>
            </header>

            <AddItemForm listType="shopping" onAddItem={addItem} />

            {/* בקרות סינון ומיון (נלקחו מהקוד ה"ישן" שלך) */}
            <div className="list-controls">
                <div className="control-group">
                    <label htmlFor="filter-status">הצג:</label>
                    <select id="filter-status" value={filter} onChange={(e) => setFilter(e.target.value)} disabled={loading}>
                        <option value="all">הכל</option>
                        <option value="active">פריטים פעילים</option>
                        <option value="completed">פריטים שנקנו</option>
                    </select>
                </div>
                <div className="control-group">
                    <label htmlFor="sort-by">מיין לפי:</label>
                    <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} disabled={loading}>
                        <option value="createdAt_desc">החדש ביותר</option>
                        <option value="text_asc">א'-ב'</option>
                    </select>
                </div>
            </div>

            {/* רשימת הפריטים (נלקחה מהקוד ה"ישן" שלך) */}
            <ul className="item-list">
                {loading && processedList.length === 0 ? (
                    <p className="list-message">טוען רשימה...</p>
                ) : processedList.length === 0 ? (
                    <p className="list-message">
                        {filter === 'all' ? 'הרשימה ריקה. הגיע הזמן לקניות!' : 'אין פריטים התואמים לסינון זה.'}
                    </p>
                ) : (
                    processedList.map(item => (
                        <ShoppingItem key={item._id} item={item} />
                    ))
                )}
            </ul>
        </div>
    );
};

export default ShoppingList;