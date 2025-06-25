import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useListActions } from '@/context/ListActionsContext';
import { useModal } from '@/context/ModalContext';
import AssignUserForm from '../common/AssignUserForm';
import ViewAndEditComment from '../common/ViewAndEditComment';
import GroupNameForm from '../common/GroupNameForm';

const SubItemsList = ({ subItems, listType }) => {
    if (!subItems || subItems.length === 0) return null;
    return (
        <ul className="sub-item-list">
            {subItems.map(subItem => (
                <ShoppingItem key={subItem._id} item={subItem} isSubItem={true} listType={listType} />
            ))}
        </ul>
    );
};

const ShoppingItem = ({ item, isSubItem = false, listType }) => {
    const { modifyItem, removeItem, deleteItemPermanently, groupItems, unGroupFolder } = useListActions(); 
    const { showModal, showConfirmModal } = useModal();
    const [isExpanded, setIsExpanded] = useState(false);
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
        let classes = isSubItem ? "shopping-item is-sub-item" : "shopping-item";
        if (item.completed) classes += " completed";
        if (item.isUrgent) classes += " urgent";
        if (hasSubItems) classes += " has-sub-items";
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
    
    const handleUngroup = () => showConfirmModal(`האם אתה בטוח שברצונך לפרק את התיקייה "${item.text}"?`, () => unGroupFolder(listType, item._id));
    const handleToggleComplete = () => {
        const newCompletedStatus = !item.completed;
        const updates = { completed: newCompletedStatus };
        if (hasSubItems) {
            const updateSubs = (subs) => subs.map(sub => ({ ...sub, completed: newCompletedStatus, subItems: sub.subItems ? updateSubs(sub.subItems) : [] }));
            updates.subItems = updateSubs(item.subItems);
        }
        modifyItem(listType, item._id, updates);
    };
    const handleToggleUrgent = () => modifyItem(listType, item._id, { isUrgent: !item.isUrgent });
    const handleAssignUser = () => showModal(<AssignUserForm item={item} onSave={(itemId, updates) => modifyItem(listType, itemId, updates)} />, { title: 'שייך למשתמש' });
    const handleViewEditComment = () => showModal(<ViewAndEditComment item={item} onSave={(itemId, updates) => modifyItem(listType, item._id, updates)} />, { title: 'הוסף/ערוך הערה' });
    const handleArchiveItem = () => removeItem(listType, item._id);
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
            <div className="item-content-wrapper">
                <div className="item-main-content">
                    {hasSubItems && (<button className="expand-btn" onClick={() => setIsExpanded(!isExpanded)}><i className={`fas fa-chevron-${isExpanded ? 'down' : 'left'}`}></i></button>)}
                    <input type="checkbox" checked={item.completed ?? false} onChange={handleToggleComplete} className="item-checkbox" />
                    
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
                        <div className="item-text-container" onDoubleClick={handleStartEditing}>
                            <span className="item-text">{item.text}</span>
                            {item.comment && (<span className="item-comment-text" onClick={(e) => { e.stopPropagation(); handleViewEditComment(); }}><i className="fas fa-comment-dots"></i> {item.comment}</span>)}
                        </div>
                    )}
                    
                    {item.assignedTo && <span className="assigned-user">{item.assignedTo}</span>}
                </div>
                
                <div className="item-actions">
                    {hasSubItems && !isSubItem && (<button className="action-btn" title="פרק תיקייה" onClick={handleUngroup}><i className="fas fa-object-ungroup"></i></button>)}
                    <button className="action-btn" title="ערוך שם" onClick={handleStartEditing}><i className="fas fa-pencil-alt"></i></button>
                    <button className={`action-btn ${item.isUrgent ? 'urgent-active' : ''}`} title="סמן כדחוף" onClick={handleToggleUrgent}><i className="fas fa-exclamation-triangle"></i></button>
                    <button className={`action-btn ${item.assignedTo ? 'assigned-active' : ''}`} title="שייך למשתמש" onClick={handleAssignUser}><i className="fas fa-user-plus"></i></button>
                    <button className="action-btn" title="הוסף/ערוך הערה" onClick={handleViewEditComment}><i className="fas fa-comment-dots"></i></button>
                    <button className="action-btn archive-btn" title="העבר לארכיון" onClick={handleArchiveItem}><i className="fas fa-archive"></i></button>
                    <button className="action-btn delete-btn" title="מחק לצמיתות" onClick={handleDeletePermanently}><i className="fas fa-trash-alt"></i></button>
                </div>
            </div>
            {hasSubItems && isExpanded && <SubItemsList subItems={item.subItems} listType={listType} />}
        </li>
    );
};
export default ShoppingItem;