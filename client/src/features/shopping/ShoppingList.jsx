import React, { useState, useMemo } from 'react';
import ShoppingItem from './ShoppingItem';
import AddItemForm from '../common/AddItemForm';
import { useAppContext } from '@/context/AppContext';
import { useListActions } from '@/context/ListActionsContext'; 
import { useModal } from '@/context/ModalContext';
import TemplateManager from '@/features/templates/TemplateManager';
import CategoryManager from '@/features/categories/CategoryManager';

const AiShoppingPopup = ({ onRun, hideModal, loading }) => {
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
                placeholder="הכנס שם מאכל (למשל 'שקשוקה') או הדבק מתכון מלא..."
                rows="5"
                className="w-full p-2 border rounded"
                disabled={loading}
            ></textarea>
            <div className="flex justify-center mt-4">
                <button onClick={handleRun} disabled={!text.trim() || loading} className="primary-action">
                    {loading ? 'יוצר רשימה...' : 'צור רשימת קניות'}
                </button>
            </div>
        </div>
    );
};

const ShoppingList = () => {
    const { activeHome, loading: isAppLoading } = useAppContext();
    const { addItem, clearCompletedItems, clearList, runAiRecipe, loading: isActionsLoading } = useListActions(); 
    const { showModal, hideModal, showConfirmModal } = useModal();
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt_desc');

    const loading = isAppLoading || isActionsLoading;
    const shoppingList = activeHome?.shoppingList || [];

    const processedList = useMemo(() => {
        let listToSort = [...shoppingList];
        if (filter === 'completed') {
            listToSort = listToSort.filter(item => item.completed);
        } else if (filter === 'active') {
            listToSort = listToSort.filter(item => !item.completed);
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
        
        return sortItems(listToSort);
    }, [shoppingList, filter, sortBy]);

    const canClearCompleted = useMemo(() => shoppingList.some(i => i.completed), [shoppingList]);

    const openCategoryManager = () => showModal(<CategoryManager />, { title: 'ניהול קטגוריות' });
    const openTemplateManager = () => showModal(<TemplateManager />, { title: 'החל תבנית' });
    const openAiPopup = () => showModal(<AiShoppingPopup onRun={runAiRecipe} hideModal={hideModal} loading={loading} />, { title: 'יצירת רשימה ממתכון' });
    const handleClearList = () => showConfirmModal('האם אתה בטוח שברצונך למחוק את כל רשימת הקניות לצמיתות?', () => clearList('shopping'));

    return (
        <div className="list-container">
            <header className="list-header">
                <h2 className="list-title"><i className="fas fa-shopping-cart"></i> רשימת קניות</h2>
                <div className="list-actions">
                    <button onClick={openCategoryManager} className="header-style-button" disabled={loading} title="ניהול קטגוריות"><i className="fas fa-tags"></i> <span className="btn-text">קטגוריות</span></button>
                    <button onClick={openTemplateManager} className="header-style-button" disabled={loading} title="החל מתבנית"><i className="fas fa-file-alt"></i> <span className="btn-text">מתבנית</span></button>
                    <button onClick={openAiPopup} className="ai-btn" disabled={loading} title="עזרה מ-AI"><i className="fas fa-magic"></i> <span className="btn-text">ממתכון</span></button>
                    <button onClick={() => showConfirmModal('האם לארכב את כל הפריטים שנקנו?', () => clearCompletedItems('shopping'))} className="clear-btn" disabled={!canClearCompleted || loading} title="ארכב פריטים שנקנו"><i className="fas fa-archive"></i> <span className="btn-text">נקה שהושלמו</span></button>
                    <button onClick={handleClearList} className="clear-btn danger-btn" disabled={shoppingList.length === 0 || loading} title="מחק רשימה"><i className="fas fa-trash-alt"></i> <span className="btn-text">מחק הכל</span></button>
                </div>
            </header>

            <AddItemForm listType="shopping" onAddItem={addItem} />

            <div className="list-container">
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

            <ul className="item-list">
                {loading && processedList.length === 0 ? (
                    <p className="list-message">טוען רשימה...</p>
                ) : processedList.length === 0 ? (
                    <p className="list-message">הרשימה ריקה.</p>
                ) : (
                    processedList.map(item => (
                        <ShoppingItem key={item._id} item={item} listType="shopping" />
                    ))
                )}
            </ul>
        </div>
    );
};
export default ShoppingList;