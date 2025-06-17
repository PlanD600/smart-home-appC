// client/src/features/shopping/ShoppingList.jsx
import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import ShoppingItem from './ShoppingItem';
import { Gemini } from '../../services/gemini';

function AIPromptForm({ title, placeholder, onSave, promptBuilder, schema }) {
    const [text, setText] = useState('');
    const { closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const prompt = promptBuilder(text);
        const result = await Gemini.generateStructuredText(prompt, schema);
        onSave(result); // The parent component will handle the result
        setLoading(false);
        closeModal();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4>{title} ✨</h4>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows="8" placeholder={placeholder} style={{width: '100%'}}/>
            <div className="modal-footer" style={{marginTop: '1rem'}}>
                <button type="submit" className="primary-action gemini-btn" disabled={loading}>
                    {loading ? "מעבד..." : "שלח ל-AI"}
                </button>
            </div>
        </form>
    );
}

function ShoppingList() {
    const { currentHome, addShoppingItem, loading } = useHome();
    const { openModal } = useModal();
    const [newItemName, setNewItemName] = useState('');

    const handleAddItem = () => {
        if (newItemName.trim() && currentHome) {
            addShoppingItem({ name: newItemName });
            setNewItemName('');
        }
    };
    
    const handleRecipeSave = (result) => {
        if (result && result.ingredients) {
            const categoryName = 'מהמתכון';
            result.ingredients.forEach(ingredient => addShoppingItem({ name: ingredient, category: categoryName }));
        } else {
            alert("לא הצלחתי לעבד את המתכון.");
        }
    };

    const showRecipeModal = () => {
        openModal(
            <AIPromptForm
                title="הפוך מתכון לרשימה"
                placeholder="הדבק כאן את המתכון המלא..."
                onSave={handleRecipeSave}
                promptBuilder={(text) => `From the following recipe text, extract all ingredients and return them. Recipe:\n\n${text}`}
                schema={{ type: "OBJECT", properties: { "ingredients": { type: "ARRAY", items: { type: "STRING" } } } }}
            />
        );
    };

    if (!currentHome) return <p>טוען רשימת קניות...</p>;

    const filteredItems = (currentHome.shoppingItems || []).filter(item => !item.isArchived);
    const sortedItems = filteredItems.sort((a, b) => (b.isUrgent || 0) - (a.isUrgent || 0));

    return (
        <section id="shopping-list" className="list-section active">
            <div className="list-title-container">
                <h3>רשימת קניות</h3>
                <button className="header-style-button gemini-btn" onClick={showRecipeModal}>
                    ✨ <span className="btn-text">הפוך מתכון לרשימה</span>
                </button>
            </div>
            <div className="add-area">
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddItem()} placeholder="הוסף פריט..."/>
                <button onClick={handleAddItem} disabled={loading}>הוסף</button>
            </div>
            <ul className="item-list-ul">
                {sortedItems.map(item => <ShoppingItem key={item._id} item={item} />)}
            </ul>
        </section>
    );
}

export default ShoppingList;