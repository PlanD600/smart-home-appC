import React, { useContext, useState } from 'react';
import { HomeContext } from '../../context/HomeContext.jsx';
import ShoppingItem from './ShoppingItem.jsx';

function ShoppingList() {
    const {
        activeHome,
        addItemToHome,
        openModal, // ייבוא openModal לשימוש עתידי עם מודאלים מורכבים יותר
        addCategoryToHome,
        generateAIList,
        loading // נוסיף את ה-loading מהקונטקסט כדי להציג מצב טעינה
    } = useContext(HomeContext);

    const [newItemText, setNewItemText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('כללית'); // קטגוריה ברירת מחדל

    const handleAddItem = () => {
        if (newItemText.trim() === '') return;
        addItemToHome('shoppingItems', { text: newItemText, category: selectedCategory });
        setNewItemText('');
    };

    const handleCreateCategory = () => {
        const currentLang = document.documentElement.lang;
        openModal(
            translations[currentLang]?.create_new_category || 'יצירת קטגוריה חדשה',
            `<label for="new-category-name">${translations[currentLang]?.new_category_name_for || 'שם קטגוריה חדשה ל'} ${translations[currentLang]?.shopping || 'קניות'}:</label><input type="text" id="new-category-name">`,
            [
                {
                    text: translations[currentLang]?.create || 'צור',
                    class: 'primary-action',
                    onClick: () => {
                        const newCategory = document.getElementById('new-category-name').value.trim();
                        if (newCategory) {
                            addCategoryToHome('shopping', newCategory);
                            setSelectedCategory(newCategory); // בחר את הקטגוריה החדשה אוטומטית
                            openModal(translations[currentLang]?.message || "הודעה", `${translations[currentLang]?.category || 'קטגוריה'} "${newCategory}" ${translations[currentLang]?.created_successfully || 'נוצרה בהצלחה.'}`);
                        } else {
                            openModal(translations[currentLang]?.error || "שגיאה", translations[currentLang]?.please_enter_category_name || "נא הזן שם קטגוריה.");
                        }
                    }
                },
                {
                    text: translations[currentLang]?.cancel || 'בטל',
                    class: 'secondary-action',
                    onClick: () => openModal.close()
                }
            ]
        );
    };

    const handleRecipeToList = async () => {
        const currentLang = document.documentElement.lang;
        openModal(
            translations[currentLang]?.recipe_to_list || '✨ הפוך מתכון לרשימת קניות',
            `<label for="recipe-input">${translations[currentLang]?.paste_recipe_here || 'הדבק כאן את המתכון המלא'}:</label>
            <textarea id="recipe-input" rows="10" placeholder="${translations[currentLang]?.recipe_placeholder || 'לדוגמה:\\n2 כוסות קמח\\n1 כפית אבקת אפייה\\n...'}"></textarea>`,
            [
                {
                    text: translations[currentLang]?.create_list || 'צור רשימה',
                    class: 'primary-action gemini-btn',
                    onClick: async () => {
                        const recipeText = document.getElementById('recipe-input').value.trim();
                        if (!recipeText) {
                            openModal(translations[currentLang]?.error || "שגיאה", translations[currentLang]?.please_paste_recipe || "אנא הדבק מתכון.");
                            return;
                        }
                        
                        openModal.setLoading(true); // הצג לודר בתוך המודאל
                        const generatedItems = await generateAIList('shopping', recipeText);
                        openModal.setLoading(false); // הסתר לודר
                        
                        if (generatedItems) {
                             // סגור את המודאל רק לאחר שהפעולה הושלמה בהצלחה ונוצרה הרשימה
                            openModal(translations[currentLang]?.message || "הודעה", translations[currentLang]?.shopping_list_created_successfully || `רשימת הקניות נוצרה בהצלחה מתוך המתכון!`);
                            setNewItemText(''); // נקה את תיבת הקלט
                            setSelectedCategory('כללית'); // אפס את הקטגוריה הנבחרת
                        } else {
                            openModal(translations[currentLang]?.error || "שגיאה", translations[currentLang]?.could_not_understand_recipe || "לא הצלחתי להבין את המתכון. נסה לפרט יותר או לנסח מחדש. ודא שמפתח ה-API שלך הוגדר כראוי.");
                        }
                    }
                },
                {
                    text: translations[currentLang]?.cancel || 'בטל',
                    class: 'secondary-action',
                    onClick: () => openModal.close()
                }
            ]
        );
    };

    // בדיקה חשובה: אם activeHome עדיין לא נטען, הצג הודעת טעינה.
    // אם loading מהקונטקסט הוא true, זה גם מצב טעינה.
    if (loading || !activeHome || !activeHome.shoppingItems) {
        return <div style={{textAlign: 'center', padding: '20px'}}>{translations[document.documentElement.lang]?.loading_shopping_list || 'טוען את רשימת הקניות...'}</div>;
    }

    return (
        <section id="shopping-list" className="list-section active">
            <div className="list-title-container">
                <h3><span>{translations[document.documentElement.lang]?.shopping_list || 'רשימת קניות'}</span></h3>
                <div className="list-title-actions">
                    <button className="create-category-btn header-style-button" onClick={handleCreateCategory}>
                        <i className="fas fa-tags"></i> <span className="btn-text">{translations[document.documentElement.lang]?.create_category || 'צור קטגוריה'}</span>
                    </button>
                    {/* כפתור "הוסף מתבנית" ימומש בהמשך */}
                    <button id="recipe-to-list-btn" className="header-style-button gemini-btn" onClick={handleRecipeToList}>
                        ✨ <span className="btn-text">{translations[document.documentElement.lang]?.recipe_to_list || 'הפוך מתכון לרשימה'}</span>
                    </button>
                </div>
            </div>

            <div className="list-filters">
                <label>{translations[document.documentElement.lang]?.category || 'קטגוריה'}:</label>
                <select className="category-filter" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="all">{translations[document.documentElement.lang]?.all || 'הכל'}</option>
                    {/* ודא ש-shoppingCategories קיים לפני מיפוי */}
                    {activeHome.shoppingCategories && activeHome.shoppingCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                {/* כאן יהיו כפתורי סינון משתמשים בעתיד, אם רלוונטי לרשימת קניות */}
            </div>
            
            <div className="add-area">
                <div className="add-item-form">
                    <select className="add-item-category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {activeHome.shoppingCategories && activeHome.shoppingCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className="add-item-input"
                        placeholder={translations[document.documentElement.lang]?.add_shopping_item_placeholder || "הוסף פריט חדש לקניות..."}
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <button className="add-item-btn" onClick={handleAddItem}>
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
            </div>

            <div className="item-list">
                <ul className="item-list-ul">
                    {activeHome.shoppingItems.length === 0 ? (
                        <li style={{ textAlign: 'center', padding: '15px', color: '#777' }}>{translations[document.documentElement.lang]?.no_items_in_list || 'אין פריטים ברשימה.'}</li>
                    ) : (
                        activeHome.shoppingItems
                            .filter(item => selectedCategory === 'all' || item.category === selectedCategory) // סינון לפי קטגוריה
                            .sort((a, b) => b.isUrgent - a.isUrgent) // מיון: דחוף קודם
                            .map(item => (
                                <ShoppingItem key={item._id} item={item} itemType="shoppingItems" /> // העברת itemType
                            ))
                    )}
                </ul>
            </div>
            {/* כפתור "נקה הכל" ימומש בהמשך */}
             <div className="list-footer">
                <button className="clear-list-btn" /* onClick={handleClearList} */><i className="fas fa-trash-alt"></i> <span data-lang-key="clear_all">{translations[document.documentElement.lang]?.clear_all || 'נקה הכל'}</span></button>
            </div>
        </section>
    );
}

export default ShoppingList;