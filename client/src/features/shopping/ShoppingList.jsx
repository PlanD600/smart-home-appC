// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/shopping/ShoppingList.jsx
import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext';
import ShoppingItem from './ShoppingItem';
import LoadingSpinner from '../../components/LoadingSpinner';

function ShoppingList() {
    const { currentHome, updateCurrentHome, loading } = useHome();
    const [newItemName, setNewItemName] = useState('');

    const handleAddItem = async () => {
        if (newItemName.trim() === '' || !currentHome) return;

        const newItem = {
            name: newItemName,
            // Add other default fields if necessary
        };

        // Create a new list with the new item appended
        const updatedShoppingItems = [...currentHome.shoppingItems, newItem];

        // Use the generic updater from the context
        await updateCurrentHome({ shoppingItems: updatedShoppingItems });
        
        setNewItemName(''); // Clear input after adding
    };
    
    // The handleUpdateItem function will now live inside ShoppingItem.jsx
    // for better component encapsulation.

    if (!currentHome) {
        return <p>Please select a home first.</p>;
    }
    
    return (
        <section id="shopping-list" className="list-section active">
            <div className="list-title-container">
                <h3>רשימת קניות</h3>
                {/* Add actions here later */}
            </div>

            {/* Filters can be added here */}

            <div className="add-area">
                <div className="add-item-form">
                    <input
                        type="text"
                        className="add-item-input"
                        placeholder="הוסף פריט חדש לקניות..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <button className="add-item-btn" onClick={handleAddItem} disabled={loading}>
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>}
                    </button>
                </div>
            </div>

            <div className="item-list">
                {loading && !currentHome.shoppingItems?.length ? (
                    <LoadingSpinner />
                ) : (
                    <ul className="item-list-ul">
                        {currentHome.shoppingItems?.map((item) => (
                            <ShoppingItem key={item._id} item={item} />
                        ))}
                    </ul>
                )}
            </div>
            
            {/* Footer can be added here */}
        </section>
    );
}

export default ShoppingList;