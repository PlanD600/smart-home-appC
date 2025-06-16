import React, { useContext, useState } from 'react';
import { HomeContext } from '../../context/HomeContext.jsx';
// נייבא את פונקציות ה-API ישירות כאן לטיפול בתת-פריטים
import { addSubItem as addSubItemApi, updateSubItem as updateSubItemApi, deleteSubItem as deleteSubItemApi } from '../../services/api.js';
// נייבא את i18n

// רכיב קטן פנימי לניהול טופס ההערה
const CommentForm = ({ initialValue, onSave, onCancel }) => {
    const [comment, setComment] = useState(initialValue);
    const currentLang = document.documentElement.lang;

    return (
        <div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder={translations[currentLang]?.add_comment_placeholder || "הוסף הערה כאן..."}
            />
            <div className="modal-footer">
                <button className="primary-action" onClick={() => onSave(comment)}>{translations[currentLang]?.save || 'שמור'}</button>
                <button className="secondary-action" onClick={onCancel}>{translations[currentLang]?.cancel || 'בטל'}</button>
            </div>
        </div>
    );
};

function ShoppingItem({ item, itemType }) { // מקבלים itemType כ-prop
    const { updateItemInHome, deleteItemFromHome, archiveItemInHome, openModal, closeModal } = useContext(HomeContext);
    const [newSubItemText, setNewSubItemText] = useState('');
    const currentLang = document.documentElement.lang;

    // ... כל ההנדלרים הקיימים
    const handleToggleComplete = () => updateItemInHome(itemType, item._id, { completed: !item.completed });
    const handleToggleUrgent = () => updateItemInHome(itemType, item._id, { isUrgent: !item.isUrgent });

    const handleDelete = () => {
        openModal(
            translations[currentLang]?.delete_confirmation || "אישור מחיקה",
            `${translations[currentLang]?.confirm_delete || 'האם למחוק את'} "${item.text}"?`,
            [
                { text: translations[currentLang]?.ok || 'אישור', class: 'primary-action', onClick: () => { deleteItemFromHome(itemType, item._id); closeModal(); } },
                { text: translations[currentLang]?.cancel || 'ביטול', class: 'secondary-action', onClick: closeModal }
            ]
        );
    };

    const handleArchive = () => {
        openModal(
            translations[currentLang]?.archive_confirmation || "אישור העברה לארכיון",
            `${translations[currentLang]?.confirm_archive || 'האם להעביר לארכיון את'} "${item.text}"?`,
            [
                { text: translations[currentLang]?.ok || 'אישור', class: 'primary-action', onClick: () => { archiveItemInHome(itemType, item._id); closeModal(); } },
                { text: translations[currentLang]?.cancel || 'ביטול', class: 'secondary-action', onClick: closeModal }
            ]
        );
    };

    const handleComment = () => {
        openModal(
            `${translations[currentLang]?.comment_for || 'הערה עבור'}: ${item.text}`,
            <CommentForm
                initialValue={item.comment || ''}
                onSave={(newComment) => {
                    updateItemInHome(itemType, item._id, { comment: newComment });
                    closeModal();
                }}
                onCancel={closeModal}
            />
        );
    };

    // הנדלרים חדשים עבור תת-פריטים
    const handleAddSubItem = async () => {
        if (newSubItemText.trim() === '') return;
        try {
            // קריאה ישירה לשרת ועדכון כללי של הבית
            const response = await addSubItemApi(activeHome._id, itemType, item._id, { text: newSubItemText });
            updateItemInHome(itemType, item._id, response.data); // עדכן את הפריט הראשי עם תתי-הפריטים המעודכנים
            setNewSubItemText('');
        } catch (err) {
            console.error("Failed to add sub-item:", err);
            openModal(translations[currentLang]?.error || "שגיאה", translations[currentLang]?.failed_to_add_subitem || "נכשל בהוספת תת-פריט.");
        }
    };

    const handleToggleSubItem = async (subItemId, completed) => {
        try {
            const response = await updateSubItemApi(activeHome._id, itemType, item._id, subItemId, { completed });
            updateItemInHome(itemType, item._id, response.data); // עדכן את הפריט הראשי עם תתי-הפריטים המעודכנים
        } catch (err) {
            console.error("Failed to update sub-item:", err);
            openModal(translations[currentLang]?.error || "שגיאה", translations[currentLang]?.failed_to_update_subitem || "נכשל בעדכון תת-פריט.");
        }
    };

    const handleDeleteSubItem = async (subItemId, subItemText) => {
        openModal(
            translations[currentLang]?.delete_confirmation || "אישור מחיקה",
            `${translations[currentLang]?.confirm_delete_subitem || 'האם למחוק את תת-הפריט'} "${subItemText}"?`,
            [
                { text: translations[currentLang]?.ok || 'אישור', class: 'primary-action', onClick: async () => {
                    try {
                        const response = await deleteSubItemApi(activeHome._id, itemType, item._id, subItemId);
                        updateItemInHome(itemType, item._id, response.data); // עדכן את הפריט הראשי
                        closeModal();
                    } catch (err) {
                        console.error("Failed to delete sub-item:", err);
                        openModal(translations[currentLang]?.error || "שגיאה", translations[currentLang]?.failed_to_delete_subitem || "נכשל במחיקת תת-פריט.");
                    }
                }},
                { text: translations[currentLang]?.cancel || 'ביטול', class: 'secondary-action', onClick: closeModal }
            ]
        );
    };
    
    // ודא ש-activeHome קיים לפני שניגשים אליו
    if (!activeHome) {
        return null; // או הצג לודר/שגיאה
    }

    return (
        <li className={`${item.completed ? 'completed' : ''} ${item.isUrgent ? 'urgent-item' : ''}`}>
            <input type="checkbox" checked={item.completed} onChange={handleToggleComplete} />
            <div className="item-text">
                {item.text}
                <span className="item-details">
                    {item.category || translations[currentLang]?.general_cat || 'כללית'}
                    {item.assignedTo && item.assignedTo !== 'משותף' && item.assignedTo !== 'משותפת' && ` | ${item.assignedTo}`}
                    {item.comment && <i className="fas fa-sticky-note" style={{ marginLeft: '8px', cursor: 'pointer', color: '#E9A825' }} onClick={handleComment}></i>}
                </span>
            </div>
            <div className="item-actions">
                <button className="action-btn" onClick={handleToggleUrgent} title={translations[currentLang]?.priority || "דחיפות"} aria-label={translations[currentLang]?.change_priority || "שנה דחיפות"}><i className="far fa-star"></i></button>
                <button className="action-btn" onClick={handleComment} title={translations[currentLang]?.comment || "הערה"} aria-label={translations[currentLang]?.add_edit_comment || "הוסף או ערוך הערה"}><i className="fas fa-comment"></i></button>
                <button className="action-btn" onClick={handleArchive} title={translations[currentLang]?.archive || "ארכיון"} aria-label={translations[currentLang]?.archive_item || "העבר פריט לארכיון"}><i className="fas fa-archive"></i></button>
                <button className="action-btn" onClick={handleDelete} title={translations[currentLang]?.delete || "מחק"} aria-label={translations[currentLang]?.delete_item || "מחק פריט"}><i className="far fa-trash-alt"></i></button>
            </div>

            {/* הוספת תצוגה של תת-פריטים */}
            {item.subItems && item.subItems.length > 0 && (
                <ul style={{ [document.documentElement.dir === 'rtl' ? 'marginRight' : 'marginLeft']: '20px', listStyleType: 'none', padding: 0, width: '100%' }}>
                    {item.subItems.map(sub => (
                        <li key={sub._id} style={{ display: 'flex', alignItems: 'center', padding: '5px 0', borderBottom: '1px dotted #eee' }}>
                            <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => handleToggleSubItem(sub._id, !sub.completed)}
                                style={{ [document.documentElement.dir === 'rtl' ? 'marginLeft' : 'marginRight']: '10px', width: '16px', height: '16px', accentColor: 'var(--mint-green)' }}
                            />
                            <span className={sub.completed ? 'completed' : ''} style={{ flexGrow: 1, color: sub.completed ? '#aaa' : 'inherit' }}>{sub.text}</span>
                            <button className="action-btn" onClick={() => handleDeleteSubItem(sub._id, sub.text)} title={translations[currentLang]?.delete_subitem || "מחק תת-פריט"} aria-label={translations[currentLang]?.delete_subitem || "מחק תת-פריט"} style={{ fontSize: '13px', color: '#f44336' }}>
                                <i className="far fa-trash-alt"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {/* הוספת טופס ליצירת תת-פריט */}
            <div className="add-item-form" style={{ marginTop: '10px', [document.documentElement.dir === 'rtl' ? 'marginRight' : 'marginLeft']: '20px', width: 'calc(100% - 20px)' }}>
                <input
                    type="text"
                    placeholder={translations[currentLang]?.add_subitem_placeholder || "הוסף תת-פריט..."}
                    value={newSubItemText}
                    onChange={(e) => setNewSubItemText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubItem()}
                    style={{ fontSize: '14px', flexGrow: 1 }}
                />
                <button onClick={handleAddSubItem} style={{ fontSize: '14px', padding: '5px 10px' }}><i className="fas fa-plus"></i></button>
            </div>
        </li>
    );
}

export default ShoppingItem;