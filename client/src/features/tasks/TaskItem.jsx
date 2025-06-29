import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useListActions } from '@/context/ListActionsContext';
import { useModal } from '@/context/ModalContext';
import AssignUserForm from '../common/AssignUserForm';
import ViewAndEditComment from '../common/ViewAndEditComment';
import GroupNameForm from '../common/GroupNameForm';

// רכיב פנימי לתצוגת תתי-משימות
const SubTasksList = ({ subItems, listType }) => {
    if (!subItems || subItems.length === 0) return null;
    return (
        <ul className="sub-items-container">
            {subItems.map(subItem => (
                <TaskItem key={subItem._id} item={subItem} isSubItem={true} listType={listType} />
            ))}
        </ul>
    );
};

// --- קומפוננטת TaskItem המשודרגת ---
const TaskItem = ({ item, isSubItem = false, listType }) => {
    // --- כל הפונקציות וה-Hooks נשארים ללא שינוי ---
    const { modifyItem, removeItem, deleteItemPermanently, groupItems, unGroupFolder } = useListActions();
    const { showModal, showConfirmModal } = useModal();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(item.text);
    const editInputRef = useRef(null);

    useEffect(() => {
        if (isEditingName && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [isEditingName]);

    const hasSubItems = useMemo(() => item.subItems && item.subItems.length > 0, [item.subItems]);

    // [שדרוג] שימוש בקלאסים חדשים ותיאוריים יותר, זהים ל-ShoppingItem
    const itemClasses = useMemo(() => {
        let classes = isSubItem ? "list-item is-sub-item" : "item-card";
        if (hasSubItems) classes += " is-folder";
        if (item.completed) classes += " completed";
        if (item.isUrgent) classes += " urgent";
        if (isDragOver) classes += " drag-over";
        return classes;
    }, [item.completed, item.isUrgent, isSubItem, hasSubItems, isDragOver]);

    // --- כל פונקציות ה-handle נשארות זהות לחלוטין ---
    const handleStartEditing = () => { setIsEditingName(true); setEditedName(item.text); };
    const handleSaveName = () => { if (editedName.trim() && editedName.trim() !== item.text) { modifyItem(listType, item._id, { text: editedName.trim() }); } setIsEditingName(false); };
    const handleNameChange = (e) => setEditedName(e.target.value);
    const handleNameKeyDown = (e) => { if (e.key === 'Enter') handleSaveName(); else if (e.key === 'Escape') setIsEditingName(false); };
    const handleDragStart = (e) => { e.dataTransfer.setData("draggedItemId", item._id); e.dataTransfer.effectAllowed = "move"; };
    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
    const handleDragEnter = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e) => setIsDragOver(false);
    const handleDrop = (e) => {
        e.preventDefault(); setIsDragOver(false);
        const draggedItemId = e.dataTransfer.getData("draggedItemId");
        if (draggedItemId && item._id && draggedItemId !== item._id) {
            showModal(<GroupNameForm listType={listType} draggedItemId={draggedItemId} targetItemId={item._id} />, { title: 'יצירת תיקייה חדשה' });
        }
    };
    const handleUngroup = () => showConfirmModal(`האם אתה בטוח שברצונך לפרק את התיקייה "${item.text}"?`,() => unGroupFolder(listType, item._id));
    const handleToggleComplete = () => {
        const newCompletedStatus = !item.completed;
        const updates = { completed: newCompletedStatus };
        if (hasSubItems) {
            const updateSubItems = (items) => items.map(sub => ({ ...sub, completed: newCompletedStatus, subItems: sub.subItems ? updateSubItems(sub.subItems) : [] }));
            updates.subItems = updateSubItems(item.subItems);
        }
        modifyItem(listType, item._id, updates);
    };
    const handleToggleUrgent = () => modifyItem(listType, item._id, { isUrgent: !item.isUrgent });
    const handleArchiveItem = () => removeItem(listType, item._id);
    const handleAssignClick = () => showModal(<AssignUserForm item={item} onSave={(itemId, updates) => modifyItem(listType, itemId, updates)} />, { title: 'שייך משימה למשתמש' });
    const handleCommentClick = () => showModal(<ViewAndEditComment item={item} onSave={(itemId, updates) => modifyItem(listType, item._id, updates)} />, { title: 'הערה' });
    const handleDeletePermanently = () => showConfirmModal(`האם אתה בטוח שברצונך למחוק את "${item.text}" לצמיתות?`, () => deleteItemPermanently(listType, item._id));

    // --- [שדרוג] מבנה ה-JSX החדש, זהה ל-ShoppingItem ---
    return (
        <li
            className={itemClasses}
            data-id={item._id}
            draggable={!isSubItem}
            onDragStart={handleDragStart} onDragOver={handleDragOver}
            onDrop={handleDrop} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
        >
            <div className="item-header">
                <div className="item-main-info">
                    {/* אייקון דינאמי */}
                    <span className="item-icon" onClick={hasSubItems ? () => setIsExpanded(!isExpanded) : handleToggleComplete}>
                        {hasSubItems && !isSubItem ? (
                            <i className="fas fa-folder-open"></i> // אייקון שונה למשימות
                        ) : isSubItem ? (
                            <i className="fas fa-level-up-alt fa-rotate-90 subitem-arrow"></i>
                        ) : (
                            <input type="checkbox" checked={item.completed ?? false} onChange={handleToggleComplete} className="item-checkbox" onClick={(e) => e.stopPropagation()} />
                        )}
                    </span>
                    
                    {/* עריכת שם המשימה */}
                    {isEditingName ? (
                        <input ref={editInputRef} type="text" value={editedName} onChange={handleNameChange} onBlur={handleSaveName} onKeyDown={handleNameKeyDown} className="item-text-edit-input" />
                    ) : (
                        <div className="item-text-container" onDoubleClick={handleStartEditing}>
                            <span className="item-text">{item.text}</span>
                            {/* תגיות מידע ספציפיות למשימות */}
                            <span className="category-badge">{item.category || 'כללית'}</span>
                            {item.assignedTo && item.assignedTo !== 'משותף' && <span className="assigned-user-badge">{item.assignedTo}</span>}
                            {item.comment && (<span className="comment-badge" onClick={(e) => { e.stopPropagation(); handleCommentClick(); }} title={item.comment}><i className="fas fa-info-circle"></i></span>)}
                        </div>
                    )}
                </div>

                {/* כפתורי הפעולה שיופיעו בריחוף */}
                <div className="item-actions">
                    {hasSubItems && !isSubItem && (<button className="action-btn" title="פרק תיקייה" onClick={(e) => { e.stopPropagation(); handleUngroup(); }}><i className="fas fa-object-ungroup"></i></button>)}
                    <button className="action-btn" title="ערוך שם" onClick={(e) => { e.stopPropagation(); handleStartEditing(); }}><i className="fas fa-pencil-alt"></i></button>
                    <button className={`action-btn ${item.isUrgent ? 'urgent-active' : ''}`} title="סמן כדחוף" onClick={(e) => { e.stopPropagation(); handleToggleUrgent(); }}><i className="fas fa-star"></i></button>
                    <button className="action-btn" title="שייך למשתמש" onClick={(e) => { e.stopPropagation(); handleAssignClick(); }}><i className="fas fa-user-tag"></i></button>
                    <button className="action-btn archive-btn" title="העבר לארכיון" onClick={(e) => { e.stopPropagation(); handleArchiveItem(); }}><i className="fas fa-archive"></i></button>
                    {hasSubItems && (<button className="action-btn expand-btn" title={isExpanded ? "כווץ" : "הרחב"} onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}><i className={`fas fa-chevron-${isExpanded ? 'down' : 'left'}`}></i></button>)}
                </div>
            </div>
            
            {/* הצגת תתי-המשימות אם התיקייה מורחבת */}
            {hasSubItems && isExpanded && <SubTasksList subItems={item.subItems} listType={listType} />}
        </li>
    );
};

export default TaskItem;