import React, { useState, useEffect, useMemo } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import ShoppingItem from './ShoppingItem.jsx';
import * as gemini from '../../services/gemini.js';

/**
 * @file ShoppingList component
 * @description Manages the display and functionality of the shopping list,
 * including adding items, filtering, and interacting with the Gemini API for recipes.
 */
const ShoppingList = () => {
    const { currentHome, updateCurrentHome, loading } = useHome();
    const { showModal, hideModal, showAlert, showConfirm, setLoading: setModalLoading } = useModal();

    // Component state
    const [newItemText, setNewItemText] = useState('');
    const [newCategory, setNewCategory] = useState('כללית');
    const [activeUser, setActiveUser] = useState('all');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

    // Load filters from localStorage on initial component mount
    useEffect(() => {
        const savedUserFilter = localStorage.getItem('shoppingActiveUserFilter');
        if (savedUserFilter) setActiveUser(savedUserFilter);
        const savedCategoryFilter = localStorage.getItem('shoppingActiveCategoryFilter');
        if (savedCategoryFilter) setActiveCategoryFilter(savedCategoryFilter);
    }, []);

    // Save filters to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('shoppingActiveUserFilter', activeUser);
    }, [activeUser]);

    useEffect(() => {
        localStorage.setItem('shoppingActiveCategoryFilter', activeCategoryFilter);
    }, [activeCategoryFilter]);

    // --- CRUD and Logic Handlers ---

    const handleAddItem = async () => {
        if (!newItemText.trim()) {
            showAlert("אנא הזן פריט לרשימת הקניות.", "שגיאה");
            return;
        }
        if (!currentHome) return;

        const updatedShoppingItems = [
            ...(currentHome.shoppingItems || []),
            {
                id: crypto.randomUUID(), // FIX: Use a truly unique ID for client-side items
                text: newItemText.trim(),
                category: newCategory,
                completed: false,
                isUrgent: false,
                assignedTo: activeUser === 'all' ? 'משותף' : activeUser,
                comment: '',
            },
        ];
        const updatedCategories = [...(currentHome.shoppingCategories || [])];
        if (!updatedCategories.includes(newCategory) && newCategory !== 'כללית') {
            updatedCategories.push(newCategory);
        }

        try {
            await updateCurrentHome({
                shoppingItems: updatedShoppingItems,
                shoppingCategories: updatedCategories,
            });
            setNewItemText('');
            showAlert("הפריט נוסף בהצלחה!", "הצלחה");
        } catch (error) {
            console.error("Failed to add shopping item:", error);
            showAlert("שגיאה בהוספת פריט. נסה שוב.", "שגיאה");
        }
    };

    const handleToggleComplete = async (itemId, isCompleted) => {
        if (!currentHome) return;
        const updatedShoppingItems = currentHome.shoppingItems.map((item) =>
            (item._id || item.id) === itemId ? { ...item, completed: isCompleted } : item
        );
        try {
            await updateCurrentHome({ shoppingItems: updatedShoppingItems });
        } catch (error) {
            console.error("Failed to update item completion:", error);
        }
    };
    
    const handleTogglePriority = async (itemId) => {
        if (!currentHome) return;
        const updatedItems = currentHome.shoppingItems.map(item =>
            (item._id || item.id) === itemId ? { ...item, isUrgent: !item.isUrgent } : item
        );
        try {
            await updateCurrentHome({ shoppingItems: updatedItems });
        } catch (error) {
            console.error("Failed to toggle priority:", error);
        }
    };

    const handleDeleteItem = async (itemId, itemText) => {
        showConfirm(`האם למחוק את "${itemText}"?`, "אישור מחיקה", async () => {
            if (!currentHome) return;
            const updatedItems = currentHome.shoppingItems.filter(item => (item._id || item.id) !== itemId);
            try {
                await updateCurrentHome({ shoppingItems: updatedItems });
                showAlert("הפריט נמחק בהצלחה!", "הצלחה");
            } catch (error) {
                console.error("Failed to delete item:", error);
            }
        });
    };
    
    const handleArchiveItem = async (itemId, itemText) => {
        showConfirm(`האם להעביר לארכיון את "${itemText}"?`, "אישור העברה", async () => {
             if (!currentHome) return;
             const itemToArchive = currentHome.shoppingItems.find(item => (item._id || item.id) === itemId);
             if (!itemToArchive) return;
 
             const updatedShoppingItems = currentHome.shoppingItems.filter((item) => (item._id || item.id) !== itemId);
             const updatedArchivedShopping = [...(currentHome.archivedShopping || []), itemToArchive];
 
             try {
                await updateCurrentHome({
                    shoppingItems: updatedShoppingItems,
                    archivedShopping: updatedArchivedShopping,
                });
                showAlert("הפריט הועבר לארכיון!", "הצלחה");
             } catch (error) {
                console.error("Failed to archive item:", error);
             }
        });
    };

    // --- Item Interaction Handlers (Assign, Comment) ---
    const handleAssignUser = (itemId) => {
        if (!currentHome) return;
        const item = currentHome.shoppingItems.find(i => (i._id || i.id) === itemId);
        if (!item) return showAlert("פריט לא נמצא.", "שגיאה");

        const userOptions = [{ value: 'משותף', label: 'משותף' }, ...(currentHome.users || []).map(user => ({ value: user, label: user }))];
        const handleConfirmAssign = async (selectedUser) => {
            const updatedItems = currentHome.shoppingItems.map(i => (i._id || i.id) === itemId ? { ...i, assignedTo: selectedUser } : i);
            try {
                await updateCurrentHome({ shoppingItems: updatedItems });
                hideModal();
            } catch (error) {
                showAlert("שגיאה בשיוך משתמש.", "שגיאה");
            }
        };

        showModal(`שיוך "${item.text}"`, (
            <div>
                <label htmlFor="assign-user-select">שייך פריט אל:</label>
                <select id="assign-user-select" defaultValue={item.assignedTo || 'משותף'} className="w-full p-2 border rounded mt-2">
                    {userOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
        ), [
            { text: 'שמור', onClick: () => handleConfirmAssign(document.getElementById('assign-user-select').value) },
            { text: 'בטל', onClick: hideModal }
        ]);
    };

    const handleItemComment = (itemId) => {
        if (!currentHome) return;
        const item = currentHome.shoppingItems.find(i => (i._id || i.id) === itemId);
        if (!item) return showAlert("פריט לא נמצא.", "שגיאה");

        const handleSaveComment = async (comment) => {
            const updatedItems = currentHome.shoppingItems.map(i => (i._id || i.id) === itemId ? { ...i, comment } : i);
            try {
                await updateCurrentHome({ shoppingItems: updatedItems });
                hideModal();
            } catch (error) {
                showAlert("שגיאה בשמירת הערה.", "שגיאה");
            }
        };

        showModal(`הערה עבור "${item.text}"`, (
            <div>
                <textarea id="item-comment-input" rows="4" defaultValue={item.comment || ''} className="w-full p-2 border rounded mt-2"></textarea>
            </div>
        ), [
            { text: 'שמור', onClick: () => handleSaveComment(document.getElementById('item-comment-input').value.trim()) },
            { text: 'בטל', onClick: hideModal }
        ]);
    };

    // --- Gemini API Integration ---
    const handleRecipeToList = async () => {
        const bodyContent = (
            <div>
                <label htmlFor="recipe-input">הדבק כאן את המתכון המלא:</label>
                <textarea id="recipe-input" rows="10" className="w-full p-2 border rounded mt-2" placeholder="לדוגמה:&#10;2 כוסות קמח&#10;1 כפית אבקת אפייה&#10;..."></textarea>
            </div>
        );

        showModal('✨ הפוך מתכון לרשימת קניות', bodyContent, [
            {
                text: 'צור רשימה',
                class: 'primary-action gemini-btn',
                onClick: async () => {
                    const recipeText = document.getElementById('recipe-input').value.trim();
                    if (!recipeText) return showAlert("אנא הדבק מתכון.", "שגיאה");
                    setModalLoading(true);

                    try {
                        const ingredients = await gemini.generateStructuredText(`From the following recipe text, extract all ingredients and return them as a JSON array of strings. Only return the JSON array. Recipe:\n\n${recipeText}`);
                        
                        if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
                            const categoryName = 'מהמתכון';
                            const newItems = ingredients.map(ingredient => ({
                                id: crypto.randomUUID(), // FIX: Use a truly unique ID
                                text: ingredient,
                                category: categoryName,
                                completed: false,
                                isUrgent: false,
                                assignedTo: 'משותף',
                                comment: '',
                            }));
                            
                            const updatedShoppingItems = [...(currentHome.shoppingItems || []), ...newItems];
                            const updatedShoppingCategories = [...(currentHome.shoppingCategories || [])];
                            if (!updatedShoppingCategories.includes(categoryName)) {
                                updatedShoppingCategories.push(categoryName);
                            }

                            await updateCurrentHome({
                                shoppingItems: updatedShoppingItems,
                                shoppingCategories: updatedShoppingCategories,
                            });
                            hideModal();
                            showAlert("רשימת הקניות נוצרה בהצלחה!", "הצלחה");
                        } else {
                            showAlert("לא הצלחתי לזהות מרכיבים במתכון. נסה לנסח מחדש.", "אין מרכיבים");
                        }
                    } catch (apiError) {
                        console.error("Error calling Gemini API:", apiError);
                        showAlert("שגיאה בתקשורת עם שירותי ה-AI.", "שגיאה");
                    } finally {
                        setModalLoading(false);
                    }
                }
            },
            { text: 'בטל', class: 'secondary-action', onClick: hideModal },
        ]);
    };
    
    // --- Filtering and Sorting ---
    const filteredAndSortedItems = useMemo(() => {
        if (!currentHome?.shoppingItems) return [];
        
        return currentHome.shoppingItems
            .filter(item => {
                const categoryMatch = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
                const userMatch = activeUser === 'all' || 
                                  (activeUser === 'משותף' && (!item.assignedTo || item.assignedTo === 'משותף')) ||
                                  item.assignedTo === activeUser;
                return categoryMatch && userMatch;
            })
            .sort((a, b) => {
                if (b.isUrgent !== a.isUrgent) {
                    return b.isUrgent - a.isUrgent;
                }
                return (a.text || '').localeCompare(b.text || '');
            });
    }, [currentHome?.shoppingItems, activeCategoryFilter, activeUser]);
    

    if (loading || !currentHome) {
        return <div className="flex justify-center items-center h-full"><div className="spinner"></div></div>;
    }

    return (
        <section id="shopping-list" className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">רשימת קניות</h3>
                <div className="flex gap-2">
                    <button className="bg-purple-500 text-white p-2 rounded" onClick={handleRecipeToList}>
                        ✨ הפוך מתכון לרשימה
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4 p-2 bg-gray-100 rounded">
                <div>
                    <label className="mr-2">קטגוריה:</label>
                    <select
                        className="p-2 border rounded"
                        value={activeCategoryFilter}
                        onChange={(e) => setActiveCategoryFilter(e.target.value)}
                    >
                        <option value="all">הכל</option>
                        {currentHome.shoppingCategories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                     <label>משתמש:</label>
                    {['all', 'משותף', ...(currentHome.users || [])].map(user => (
                        <button
                            key={user}
                            className={`px-3 py-1 rounded ${activeUser === user ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setActiveUser(user)}
                        >
                            {user === 'all' ? 'כולם' : user}
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Item Form */}
            <div className="flex gap-2 mb-4">
                <select
                    className="p-2 border rounded bg-white"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                >
                     <option value="כללית">כללית</option>
                     {currentHome.shoppingCategories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input
                    type="text"
                    className="flex-grow p-2 border rounded"
                    placeholder="הוסף פריט חדש..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddItem}>הוסף</button>
            </div>

            {/* Item List */}
            <div className="space-y-2">
                {filteredAndSortedItems.length > 0 ? (
                    filteredAndSortedItems.map(item => (
                        <ShoppingItem
                            key={item._id || item.id} // FIX: Prioritize DB _id, fallback to client-side id
                            item={item}
                            onToggleComplete={handleToggleComplete}
                            onTogglePriority={handleTogglePriority}
                            onDeleteItem={handleDeleteItem}
                            onArchiveItem={handleArchiveItem}
                            onAssignUser={handleAssignUser}
                            onItemComment={handleItemComment}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-4">אין פריטים להצגה.</p>
                )}
            </div>
        </section>
    );
};

export default ShoppingList;
