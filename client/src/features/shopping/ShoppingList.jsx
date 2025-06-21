import React from 'react';
import ShoppingItem from './ShoppingItem';
import AddItemForm from '../common/AddItemForm';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';

// --- קומפוננטה פנימית קטנה עבור תוכן המודל של ה-AI ---
const AiRecipePopup = ({ onRun, hideModal, loading }) => {
    const [text, setText] = React.useState('');
    
    const handleRun = () => {
        onRun(text);
        hideModal();
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-lg">
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
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'מעבד...' : 'צור רשימה'}
                </button>
            </div>
        </div>
    );
};

// פונקציית עזר לבדיקה האם יש פריטים שהושלמו ברשימה (כולל תתי-פריטים)
const hasCompleted = (items) => items.some(i => i.completed || (i.subItems && hasCompleted(i.subItems)));

const ShoppingList = () => {
    // קבלת activeHome, addItem, clearCompleted, runAiRecipe, ו-loading מה-HomeContext
    const { activeHome, addItem, clearCompletedItems, runAiRecipe, loading } = useHome();
    const { showModal, hideModal } = useModal();
    // וודא ש-shoppingList תמיד תהיה מערך
    const shoppingList = activeHome?.shoppingList || [];

    // פונקציה לטיפול בניקוי פריטים שהושלמו
    const handleClearCompleted = () => {
        showModal(
            <div className="p-4 bg-white rounded-lg shadow-lg text-center">
                <h3 className="text-lg font-semibold mb-4">האם למחוק את כל הפריטים שנקנו?</h3>
                <div className="flex justify-center gap-4">
                    <button onClick={() => { clearCompletedItems('shopping'); hideModal(); }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">אישור</button>
                    <button onClick={hideModal} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">ביטול</button>
                </div>
            </div>, { title: 'אישור ניקוי רשימה' }
        );
    };
    
    // פונקציה לפתיחת המודל של ה-AI
    const openAiPopup = () => {
        showModal(
            <AiRecipePopup 
                onRun={runAiRecipe}
                hideModal={hideModal}
                loading={loading}
            />,
            { title: 'עזרת AI' }
        );
    };

    // בדיקה אם יש פריטים שהושלמו כדי להפעיל את כפתור הניקוי
    const canClear = hasCompleted(shoppingList);

    return (
        <div className="list-container p-4 bg-gray-800 text-white rounded-lg shadow-lg max-w-2xl mx-auto my-4">
            <h2 className="text-2xl font-bold mb-4 text-center">
                <i className="fas fa-shopping-cart text-blue-400 mr-2"></i> רשימת קניות
            </h2>
            
            {/* קריאה לטופס הוספת פריט עם הפרמטרים הנכונים */}
            <AddItemForm listType="shopping" onAddItem={addItem} />

            <ul className="item-list mt-4 space-y-2">
                {shoppingList.length === 0 ? (
                    <li className="text-center text-gray-400 p-4">הרשימה ריקה. הוסף פריטים!</li>
                ) : (
                    shoppingList.map(item => (
                        <ShoppingItem key={item._id} item={item} />
                    ))
                )}
            </ul>

            <div className="list-actions flex flex-col sm:flex-row justify-center gap-3 mt-6">
                <button 
                    onClick={handleClearCompleted} 
                    className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors
                                ${!canClear || loading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                    disabled={!canClear || loading}
                >
                    <i className="fas fa-broom mr-2"></i> נקה פריטים שנקנו
                </button>
                {/* כפתור ה-AI החדש */}
                <button 
                    onClick={openAiPopup} 
                    className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors
                                ${loading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    disabled={loading}
                >
                    <i className="fas fa-magic mr-2"></i> עזרה מ-AI
                </button>
            </div>
        </div>
    );
};

export default ShoppingList;
