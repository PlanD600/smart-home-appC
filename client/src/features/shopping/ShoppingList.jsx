import React from 'react';
import ShoppingItem from './ShoppingItem';
import AddItemForm from '../common/AddItemForm';
import { useAppContext } from '../../context/AppContext'; // ✅ Updated path
import { useListActions } from '../../context/ListActionsContext'; // ✅ Updated path
import { useModal } from '../../context/ModalContext'; // Assuming this is your Modal context

// --- Small internal component for the AI modal content ---
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

// Helper function to check if there are completed items in the list (including sub-items)
const hasCompleted = (items) => items.some(i => i.completed || (i.subItems && hasCompleted(i.subItems)));

const ShoppingList = () => {
    // ✅ Getting activeHome from AppContext
    const { activeHome } = useAppContext();
    // ✅ Getting addItem, clearCompletedItems, runAiRecipe, and loading from ListActionsContext
    const { addItem, clearCompletedItems, runAiRecipe, loading } = useListActions();
    
    const { showModal, hideModal } = useModal();
    // Ensure shoppingList is always an array
    const shoppingList = activeHome?.shoppingList || [];

    // Function to handle clearing completed items
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
    
    // Function to open the AI modal
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

    // Check if there are completed items to enable the clear button
    const canClear = hasCompleted(shoppingList);

    return (
        <div className="list-container p-4 bg-gray-800 text-white rounded-lg shadow-lg max-w-2xl mx-auto my-4">
            <h2 className="text-2xl font-bold mb-4 text-center">
                <i className="fas fa-shopping-cart text-blue-400 mr-2"></i> רשימת קניות
            </h2>
            
            {/* Call to AddItemForm with the correct parameters */}
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
                {/* New AI button */}
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