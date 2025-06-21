// client/src/features/tasks/TaskItem.jsx

import React from 'react';
import { useListActions } from '../../context/ListActionsContext'; // ✅ נתיב מעודכן
import { useModal } from '../../context/ModalContext';
import AssignUserForm from '../common/AssignUserForm';
import CommentForm from '../common/CommentForm';

// --- קומפוננטה פנימית לתצוגה רקורסיבית של תתי-מטלות ---
// רכיב זה אחראי על רינדור רשימה של תתי-מטלות.
// הוא קורא באופן רקורסיבי לקומפוננטת TaskItem עבור כל תת-מטלה,
// מה שמאפשר קינון בעומק בלתי מוגבל.
const SubTasksList = ({ subItems, listType, onUpdate, onDelete }) => {
    // סגנון להזחה של תתי המשימות פנימה
    const subListStyle = {
        listStyle: 'none',
        paddingInlineStart: '30px', // הזחה ברורה ליצירת היררכיה ויזואלית
        borderInlineStart: '2px solid #e0e0e0', // קו אנכי להדגשת ההיררכיה
        marginInlineStart: '10px',
        marginTop: '10px'
    };

    return (
        <ul style={subListStyle}>
            {subItems.map(subItem => (
                // קריאה רקורסיבית לקומפוננטה הראשית TaskItem
                <TaskItem 
                    key={subItem._id} // שימוש ב-ID ייחודי עבור המפתח
                    item={subItem}
                    listType={listType}
                    onUpdate={onUpdate} // העברת פונקציית העדכון לתת-פריטים
                    onDelete={onDelete} // העברת פונקציית המחיקה לתת-פריטים
                    isSubItem={true} // סימון שזהו תת-פריט לצורך עיצוב או לוגיקה ספציפית
                />
            ))}
        </ul>
    );
};

// --- קומפוננטת TaskItem ראשית ---
// רכיב זה מציג פריט מטלה בודד (או תת-מטלה), ומטפל באינטראקציות כמו:
// סימון כהושלם, סימון כדחוף, שיוך למשתמש, הוספת הערה ומחיקה.
// הוא גם מרינדר באופן רקורסיבי את תתי-המטלות שלו.
const TaskItem = ({ item, isSubItem = false }) => {
    // שימוש ב-hooks מהקונטקסטים הרלוונטיים
    // ✅ קבלת modifyItem ו-removeItem מ-useListActions
    const { modifyItem, removeItem } = useListActions(); 
    const { showModal, hideModal } = useModal(); // פונקציות להצגה והסתרת מודל אישור

    // פונקציה לשינוי סטטוס "הושלם" של המטלה
    const handleToggleComplete = () => {
        // קריאה לפונקציית modifyItem מהקונטקסט של הרשימות, עם סוג הרשימה 'tasks'
        modifyItem('tasks', item._id, { completed: !item.completed });
    };

    // פונקציה לשינוי סטטוס "דחוף" של המטלה
    const handleToggleUrgent = () => {
        modifyItem('tasks', item._id, { isUrgent: !item.isUrgent });
    };

    // פונקציה לטיפול בלחיצה על כפתור המחיקה
    const handleDelete = () => {
        // הצגת מודל אישור מחיקה מותאם אישית במקום window.confirm
        showModal(
            <div className="p-4 bg-white rounded-lg shadow-lg text-center">
                <h3 className="text-lg font-semibold mb-4">האם למחוק את "{item.text}"?</h3>
                <p className="text-sm text-gray-500 mb-4">
                    {/* הצגת אזהרה אם למטלה יש תתי-מטלות */}
                    {item.subItems && item.subItems.length > 0 ? 'שימו לב: מחיקת משימה זו תמחק גם את כל תתי-המשימות שלה.' : ''}
                </p>
                <div className="flex justify-center gap-4">
                    {/* כפתור אישור מחיקה - מפעיל את removeItem וסוגר את המודל */}
                    <button
                        onClick={() => {
                            removeItem('tasks', item._id);
                            hideModal();
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        אישור
                    </button>
                    {/* כפתור ביטול - סוגר את המודל בלבד */}
                    <button
                        onClick={hideModal}
                        className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                    >
                        ביטול
                    </button>
                </div>
            </div>,
            { title: 'אישור מחיקה' } // כותרת המודל
        );
    };

    // פונקציה לטיפול בלחיצה על כפתור שיוך משתמש
    const handleAssignClick = () => {
        // הצגת מודל עם טופס שיוך משתמש
        // לוודא ש-AssignUserForm מקבל את `onSave` כפונקציה שתדע לקרוא ל-modifyItem
        showModal(
            <AssignUserForm 
                item={item} 
                onSave={(itemId, data) => modifyItem('tasks', itemId, data)} // העברת פונקציית שמירה לטופס
            />, 
            { title: 'שיוך משתמש לפריט' }
        );
    };

    // פונקציה לטיפול בלחיצה על כפתור הוספת הערה
    const handleCommentClick = () => {
        // הצגת מודל עם טופס הוספת הערה
        // לוודא ש-CommentForm מקבל את `onSave` כפונקציה שתדע לקרוא ל-modifyItem
        showModal(
            <CommentForm 
                item={item} 
                onSave={(itemId, data) => modifyItem('tasks', itemId, data)} // העברת פונקציית שמירה לטופס
            />, 
            { title: 'הוספת הערה לפריט' }
        );
    };
    
    // הגדרת מחלקות ה-CSS עבור פריט המטלה, בהתבסס על הסטטוסים שלו (הושלם, דחוף, תת-פריט)
    const liClassName = `
        flex items-center justify-between p-3 my-2 rounded-lg shadow-sm transition-all duration-200 ease-in-out
        ${item.completed ? 'bg-green-100 line-through text-gray-500' : 'bg-white hover:shadow-md'}
        ${item.isUrgent ? 'border-r-4 border-red-500' : ''}
        ${isSubItem ? 'pl-8' : ''} /* הזחה נוספת לתת-פריטים */
    `.trim();
    // סגנון נוסף עבור הטקסט של הפריט
    const itemTextStyle = `flex-1 mx-3 text-lg ${item.completed ? 'text-gray-500' : 'text-gray-800'}`;
    const itemDetailsStyle = `text-sm text-gray-600 ${item.completed ? 'text-gray-400' : ''}`;


    return (
        <li className={liClassName} data-id={item._id}>
            <div className="flex items-center flex-grow">
                {/* תיבת סימון להשלמת המטלה */}
                <input 
                    type="checkbox" 
                    checked={item.completed} 
                    onChange={handleToggleComplete}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                    aria-label={`סמן כהושלם עבור ${item.text}`} 
                />
                {/* טקסט המטלה ופרטיה הנוספים */}
                <div className={itemTextStyle}>
                    {item.text}
                    <span className={itemDetailsStyle}>
                        {/* הצגת קטגוריה, משויך ל, והערה אם קיימים */}
                        {item.category && ` | קטגוריה: ${item.category}`}
                        {item.assignedTo && ` | שויך ל: ${item.assignedTo}`}
                        {item.comment && ` | הערה: ${item.comment}`}
                    </span>
                </div>
            </div>

            {/* כפתורי פעולות עבור המטלה */}
            <div className="flex-shrink-0 flex items-center space-x-2">
                {/* כפתור דחיפות (כוכב) */}
                <button 
                    className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${item.isUrgent ? 'text-red-500' : 'text-gray-400'}`} 
                    title="דחיפות" 
                    onClick={handleToggleUrgent}
                >
                    <i className="fas fa-star"></i>
                </button>
                {/* כפתור שיוך משתמש */}
                <button className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600" title="שייך למשתמש" onClick={handleAssignClick}>
                    <i className="fas fa-user-tag"></i>
                </button>
                {/* כפתור הערה */}
                <button className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600" title="הערה" onClick={handleCommentClick}>
                    <i className="fas fa-comment"></i>
                </button>
                {/* כפתור מחיקה */}
                <button className="p-2 rounded-full hover:bg-red-100 transition-colors text-red-500" title="מחק" onClick={handleDelete}>
                    <i className="far fa-trash-alt"></i>
                </button>
            </div>

            {/* --- החלק הרקורסיבי: הצגת תתי-מטלות --- */}
            {/* אם קיימים תתי-פריטים (subItems), נציג אותם באמצעות קומפוננטת SubTasksList */}
            {item.subItems && item.subItems.length > 0 && (
                <SubTasksList 
                    subItems={item.subItems}
                    listType="tasks" // העברת סוג הרשימה (תמיד 'tasks' במקרה זה)
                    onUpdate={modifyItem} // העברת פונקציית העדכון מהקונטקסט
                    onDelete={removeItem} // העברת פונקציית המחיקה מהקונטקסט
                />
            )}
        </li>
    );
};

export default TaskItem;