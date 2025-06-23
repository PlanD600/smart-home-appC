import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import { useArchiveActions } from '@/context/ArchiveActionsContext'; // <-- Import the new hook

/**
 * A fully functional component to view, restore, or permanently delete archived items.
 */
const ArchiveView = () => {
    const { activeHome } = useAppContext();
    const { showConfirmModal } = useModal();
    // Get the real actions and loading state from the context
    const { loading, restoreItem, deleteArchivedItem, clearArchive } = useArchiveActions();
    
    const [filter, setFilter] = useState('all'); // 'all', 'shopping', 'tasks'

    // Get the real archived items from the activeHome state
    const archivedItems = activeHome?.archivedItems || [];

    const filteredItems = useMemo(() => {
        if (filter === 'all') {
            return archivedItems;
        }
        return archivedItems.filter(item => item.originalList === filter);
    }, [archivedItems, filter]);

    const getIconForList = (listType) => {
        if (listType === 'shopping') return 'fa-shopping-cart';
        if (listType === 'tasks') return 'fa-tasks';
        return 'fa-question-circle'; // Fallback icon
    };

    return (
        <div className="archive-view-container">
            <h3 className="archive-title">ארכיון</h3>
            <p className="archive-subtitle">כאן נמצאים פריטים שהושלמו ונמחקו מהרשימות.</p>

            <div className="archive-filters">
                <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''} disabled={loading}>הכל</button>
                <button onClick={() => setFilter('shopping')} className={filter === 'shopping' ? 'active' : ''} disabled={loading}>קניות</button>
                <button onClick={() => setFilter('tasks')} className={filter === 'tasks' ? 'active' : ''} disabled={loading}>משימות</button>
            </div>
            
            <div className="archived-items-list">
                {loading && !archivedItems.length ? (
                    <p className="empty-archive-message">טוען ארכיון...</p>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-archive-message">
                        <i className="fas fa-box-open"></i>
                        <p>הארכיון ריק.</p>
                    </div>
                ) : (
                    <ul>
                        {filteredItems.map(item => (
                            <li key={item._id} className="archived-item">
                                <div className="archived-item-info">
                                    <i className={`fas ${getIconForList(item.originalList)} list-type-icon`} title={`מקור: ${item.originalList}`}></i>
                                    <span className="archived-item-text">{item.text}</span>
                                    <span className="archived-item-date">
                                        בארכיון מאז: {new Date(item.archivedAt || item.updatedAt).toLocaleDateString('he-IL')}
                                    </span>
                                </div>
                                <div className="archived-item-actions">
                                    <button onClick={() => restoreItem(item._id)} className="btn-restore" title="שחזר לרשימה המקורית" disabled={loading}>
                                        <i className="fas fa-undo-alt"></i>
                                    </button>
                                    <button onClick={() => showConfirmModal(`למחוק את "${item.text}" לצמיתות?`, () => deleteArchivedItem(item._id))} className="btn-delete-permanent" title="מחק לצמיתות" disabled={loading}>
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {archivedItems.length > 0 && (
                 <div className="archive-footer">
                    <button onClick={() => showConfirmModal('האם לרוקן את כל הארכיון?', clearArchive)} className="btn-clear-all" disabled={loading}>
                        נקה את כל הארכיון
                    </button>
                </div>
            )}
        </div>
    );
};

export default ArchiveView;
