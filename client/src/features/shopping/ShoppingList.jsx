// client/src/features/shopping/ShoppingList.jsx
import React, { useState, useContext } from 'react';
import HomeContext from '../../context/HomeContext.jsx';
import ShoppingItem from './ShoppingItem';

// הפונקציה צריכה להקיף את כל הלוגיקה וה-return
const ShoppingList = ({ home }) => {
    // השתמשתי ב-useContext בתוך הקומפוננטה, כפי שצריך
    const { addShoppingItem } = useContext(HomeContext);
    const [newItemName, setNewItemName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newItemName.trim()) {
            addShoppingItem(home._id, { name: newItemName });
            setNewItemName('');
        }
    };

    // ה-return חייב להיות בתוך פונקציית הקומפוננטה
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Shopping List</h2>
            <form onSubmit={handleSubmit} className="flex mb-4">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Add a new item..."
                    className="flex-grow p-2 border rounded-l-lg"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-lg">Add</button>
            </form>
            <div>
                {/* תיקנתי גם כאן ל-shoppingItems כפי שעשינו קודם */ }
                {home.shoppingItems.filter(item => !item.isArchived).map(item => (
                    <ShoppingItem key={item._id} item={item} homeId={home._id} />
                ))}
            </div>
        </div>
    );
}; // הסוגר של הפונקציה צריך להיות כאן, לפני ה-export

export default ShoppingList;