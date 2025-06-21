import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext'; 

// הגדרת קטגוריות ברירת מחדל
// ניתן לשנות או להרחיב רשימה זו בהתאם לצרכים
const DEFAULT_CATEGORIES = [
    'כללית', 
    'מצרכים', 
    'חשבונות', 
    'בידור', 
    'שונות', 
    'עבודה', 
    'לימודים',
    'תחבורה',
    'בריאות',
    'חינוך',
    'מסעדות'
];

/**
 * קומפוננטה לטופס הוספת פריט חדש לרשימות (קניות או מטלות).
 * תומך בהוספת טקסט, קטגוריה, שיוך למשתמש ומידע על יוצר הפריט.
 * @param {string} listType - סוג הרשימה (לדוגמה: 'shopping' או 'tasks').
 * @param {function} onAddItem - פונקציית קריאה חוזרת להוספת הפריט (מקבלת listType ו-itemData).
 * @param {function} [onCancel] - פונקציית קריאה חוזרת לביטול פעולת ההוספה.
 */
const AddItemForm = ({ listType, onAddItem, onCancel }) => {
    // קבלת activeHome ו-currentUser מהקונטקסט של הבית
    const { activeHome, currentUser } = useHome(); 
    
    // מצבי הקומפוננטה עבור שדות הטופס
    const [text, setText] = useState(''); 
    const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
    
    // קבלת רשימת המשתמשים מהבית הפעיל, לצורך שיוך פריטים
    // וודא ש-activeHome קיים וש-users הוא מערך
    const users = activeHome?.users && Array.isArray(activeHome.users) ? activeHome.users : [];
    
    // הגדרת המשתמש המשויך כברירת מחדל, אם יש משתמשים בבית, אחרת ריק.
    const [assignedTo, setAssignedTo] = useState(users.length > 0 ? users[0].name : '');

    /**
     * פונקציה לטיפול בשליחת הטופס.
     * מונעת את התנהגות ברירת המחדל של הטופס ושולחת את נתוני הפריט החדש.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        // וודא שיש טקסט לפריט לפני שליחה ופונקציית onAddItem קיימת
        if (text.trim() && onAddItem) {
            // יצירת אובייקט הפריט עם כל הנתונים, כולל createdBy
            const newItemData = { 
                text: text.trim(), 
                category, 
                assignedTo,
                createdBy: currentUser // הוספת המשתמש שיצר את הפריט
            };
            
            // קריאה לפונקציית onAddItem מה-props
            // listType מועבר כפרמטר ראשון כפי ש-HomeContext.addItem מצפה
            onAddItem(listType, newItemData);
            
            // איפוס הטופס למצב התחלתי
            setText(''); 
            setCategory(DEFAULT_CATEGORIES[0]);
            // איפוס assignedTo (אם נרצה שישתנה לאחר שליחה)
            setAssignedTo(users.length > 0 ? users[0].name : ''); 
            
            // אם קיימת פונקציית ביטול, קרא לה כדי לסגור את המודל/טופס
            if (onCancel) onCancel();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-700 rounded-lg shadow-inner space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* שדה קלט לטקסט הפריט */}
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={"הוסף פריט או משימה..."}
                    className="w-full sm:col-span-2 p-2 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    required // וודא שהשדה אינו ריק
                />
                {/* כפתור הוספה */}
                <button 
                    type="submit" 
                    className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    הוסף
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* בורר קטגוריות */}
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {DEFAULT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* בורר משתמשים לשיוך */}
                <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full p-2 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {/* וודא שיש משתמשים זמינים לפני הרינדור */}
                    {users.length > 0 ? (
                        users.map((user) => (
                            <option key={user.name} value={user.name}> {/* השתמש ב-user.name כ-key ו-value */}
                                {user.name}
                            </option>
                        ))
                    ) : (
                        <option value="">אין משתמשים זמינים</option>
                    )}
                </select>
            </div>

            {/* כפתור ביטול (מוצג רק אם הפרופ onCancel קיים) */}
            {onCancel && (
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="w-full mt-2 px-4 py-2 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 focus:outline-none"
                >
                    ביטול
                </button>
            )}
        </form>
    );
};

export default AddItemForm;
