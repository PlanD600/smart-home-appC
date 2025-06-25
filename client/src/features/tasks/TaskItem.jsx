import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useListActions } from '@/context/ListActionsContext';
import { useModal } from '@/context/ModalContext';
import AssignUserForm from '../common/AssignUserForm';
import ViewAndEditComment from '../common/ViewAndEditComment';
import GroupNameForm from '../common/GroupNameForm';

const SubTasksList = ({ subItems, listType }) => {
    if (!subItems || subItems.length === 0) return null;
    return (
        <ul className="sub-task-list">
            {subItems.map(subItem => (
                <TaskItem key={subItem._id} item={subItem} isSubItem={true} listType={listType} />
            ))}
        </ul>
    );
};

const TaskItem = ({ item, isSubItem = false, listType }) => {
    const { modifyItem, removeItem, deleteItemPermanently, groupItems, unGroupFolder } = useListActions();
    const { showModal, showConfirmModal } = useModal();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isDragOver, setIsDragOver] = useState(false);

    // [NEW] State for editing item name
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

    const itemClasses = useMemo(() => {
        let classes = 'task-item';
        if (item.completed) classes += ' completed';
        if (item.isUrgent) classes += ' urgent';
        if (isSubItem) classes += ' is-sub-item';
        if (hasSubItems) classes += ' has-sub-items';
        if (isDragOver) classes += " drag-over";
        return classes;
    }, [item.completed, item.isUrgent, isSubItem, hasSubItems, isDragOver]);

    // --- Edit Name Handlers ---
    const handleStartEditing = () => {
        setEditedName(item.text);
        setIsEditingName(true);
    };

    const handleSaveName = () => {
        if (editedName.trim() && editedName.trim() !== item.text) {
            modifyItem(listType, item._id, { text: editedName.trim() });
        }
        setIsEditingName(false);
    };

    const handleNameChange = (e) => {
        setEditedName(e.target.value);
    };

    const handleNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            setIsEditingName(false);
            setEditedName(item.text);
        }
    };
    
    // --- Drag and Drop Handlers ---
    const handleDragStart = (e) => { e.dataTransfer.setData("draggedItemId", item._id); e.dataTransfer.effectAllowed = "move"; };
    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
    const handleDragEnter = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const draggedItemId = e.dataTransfer.getData("draggedItemId");
        const targetItemId = item._id;
        if (draggedItemId && targetItemId && draggedItemId !== targetItemId) {
            showModal(<GroupNameForm listType={listType} draggedItemId={draggedItemId} targetItemId={targetItemId} />, { title: 'יצירת תיקייה חדשה' });
        }
    };
    const handleUngroup = () => showConfirmModal(`האם אתה בטוח שברצונך לפרק את התיקייה "${item.text}"?`,() => unGroupFolder(listType, item._id));

    // --- Other Handlers ---
    const handleToggleComplete = () => {
        const newCompletedStatus = !item.completed;
        const updates = { completed: newCompletedStatus };
        if (hasSubItems) {
            const updateSubItems = (items) => {
                return items.map(sub => ({ ...sub, completed: newCompletedStatus, subItems: sub.subItems ? updateSubItems(sub.subItems) : [] }));
            };
            updates.subItems = updateSubItems(item.subItems);
        }
        modifyItem(listType, item._id, updates);
    };
    const handleToggleUrgent = () => modifyItem(listType, item._id, { isUrgent: !item.isUrgent });
    const handleArchiveItem = () => removeItem(listType, item._id);
    const handleAssignClick = () => showModal(<AssignUserForm item={item} onSave={(itemId, updates) => modifyItem(listType, itemId, updates)} />, { title: 'שייך משימה למשתמש' });
    const handleCommentClick = () => showModal(<ViewAndEditComment item={item} onSave={(itemId, updates) => modifyItem(listType, item._id, updates)} />, { title: 'הערה' });
    const handleDeletePermanently = () => showConfirmModal(`האם אתה בטוח שברצונך למחוק את "${item.text}" לצמיתות?`, () => deleteItemPermanently(listType, item._id));

    return (
        <li 
            className={itemClasses} 
            data-id={item._id}
            draggable={!isSubItem}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <div className="task-item-content">
                <div className="item-main-content">
                    {hasSubItems && (<button className="expand-btn" onClick={() => setIsExpanded(!isExpanded)}><i className={`fas fa-chevron-${isExpanded ? 'down' : 'left'}`}></i></button>)}
                    <label className="checkbox-container">
                        <input type="checkbox" checked={item.completed ?? false} onChange={handleToggleComplete} />
                        <span className="custom-checkbox"></span>
                    </label>
                    {isEditingName ? (
                        <input
                            ref={editInputRef}
                            type="text"
                            value={editedName}
                            onChange={handleNameChange}
                            onBlur={handleSaveName}
                            onKeyDown={handleNameKeyDown}
                            className="item-text-edit-input"
                        />
                    ) : (
                        <div className="item-text-details" onDoubleClick={handleStartEditing}>
                            <span className="item-text">{item.text}</span>
                            {item.comment && (<span className="item-comment-text" onClick={handleCommentClick}><i className="fas fa-info-circle"></i> {item.comment}</span>)}
                            <div className="item-sub-details">
                                <span><i className="fas fa-tag"></i> {item.category || 'כללית'}</span>
                                {item.assignedTo && <span><i className="fas fa-user"></i> {item.assignedTo}</span>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="item-actions">
                    {hasSubItems && !isSubItem && (<button className="action-btn" title="פרק תיקייה" onClick={handleUngroup}><i className="fas fa-object-ungroup"></i></button>)}
                    <button className="action-btn" title="ערוך שם" onClick={handleStartEditing}><i className="fas fa-pencil-alt"></i></button>
                    <button className="action-btn" title="סמן כדחוף" onClick={handleToggleUrgent}><i className={`fas fa-star ${item.isUrgent ? 'urgent-active' : ''}`}></i></button>
                    <button className="action-btn" title="שייך למשתמש" onClick={handleAssignClick}><i className="fas fa-user-tag"></i></button>
                    <button className="action-btn" title="הוסף/ערוך הערה" onClick={handleCommentClick}><i className="fas fa-comment-dots"></i></button>
                    <button className="action-btn archive-btn" title="העבר לארכיון" onClick={handleArchiveItem}><i className="fas fa-archive"></i></button>
                    <button className="action-btn delete-btn" title="מחק לצמיתות" onClick={handleDeletePermanently}><i className="fas fa-trash-alt"></i></button>
                </div>
            </div>
            {hasSubItems && isExpanded && <SubTasksList subItems={item.subItems} listType={listType} />}
        </li>
    );
};
export default TaskItem;
