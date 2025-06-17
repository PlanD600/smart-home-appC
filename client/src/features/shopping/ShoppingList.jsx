import React, { useState, useEffect, useCallback } from 'react';
import { useHome } from 'src/context/HomeContext.jsx'; // נתיב יבוא תקין
import { useModal } from 'src/context/ModalContext.jsx'; // נתיב יבוא תקין
import ShoppingItem from 'src/features/shopping/ShoppingItem.jsx'; // נתיב יבוא תקין
import * as gemini from 'src/services/gemini.js'; // ייבוא שירות ה-Gemini API

/**
 * @file ShoppingList component
 * @description Manages the display and functionality of the shopping list,
 * including adding items, filtering, and interacting with the Gemini API for recipes.
 */
const ShoppingList = () => {
  const { currentHome, updateCurrentHome, loading } = useHome();
  const { showModal, hideModal, showAlert, showConfirm, setLoading: setModalLoading } = useModal();

  // State for the new item input field
  const [newItemText, setNewItemText] = useState('');
  // State for the selected category for new items
  const [newCategory, setNewCategory] = useState('כללית');
  // State for the active user filter
  const [activeUser, setActiveUser] = useState('all');
  // State for the active category filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Load active user and category filters from localStorage on mount
  useEffect(() => {
    const savedUserFilter = localStorage.getItem('shoppingActiveUserFilter');
    if (savedUserFilter) {
      setActiveUser(savedUserFilter);
    }
    const savedCategoryFilter = localStorage.getItem('shoppingActiveCategoryFilter');
    if (savedCategoryFilter) {
      setActiveCategoryFilter(savedCategoryFilter);
    }
  }, []);

  // Save active user and category filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('shoppingActiveUserFilter', activeUser);
  }, [activeUser]);

  useEffect(() => {
    localStorage.setItem('shoppingActiveCategoryFilter', activeCategoryFilter);
  }, [activeCategoryFilter]);


  /**
   * Handles adding a new shopping item.
   */
  const handleAddItem = async () => {
    if (!newItemText.trim()) {
      showAlert("אנא הזן פריט לרשימת הקניות.", "שגיאה");
      return;
    }
    if (!currentHome) return;

    const updatedShoppingItems = [
      ...currentHome.shoppingItems,
      {
        id: Date.now(), // Unique ID for the new item
        text: newItemText.trim(),
        category: newCategory,
        completed: false,
        isUrgent: false,
        assignedTo: activeUser === 'all' ? 'משותף' : activeUser,
        comment: '',
      },
    ];
    const updatedCategories = [...currentHome.shoppingCategories];
    if (!updatedCategories.includes(newCategory) && newCategory !== 'כללית') {
      updatedCategories.push(newCategory);
    }

    try {
      await updateCurrentHome({
        shoppingItems: updatedShoppingItems,
        shoppingCategories: updatedCategories,
      });
      setNewItemText(''); // Clear input after adding
      showAlert("הפריט נוסף בהצלחה!", "הצלחה");
    } catch (error) {
      console.error("Failed to add shopping item:", error);
      showAlert("שגיאה בהוספת פריט. נסה שוב.", "שגיאה");
    }
  };

  /**
   * Handles toggling the completion status of a shopping item.
   * @param {string} itemId - The ID of the item.
   * @param {boolean} isCompleted - The new completion status.
   */
  const handleToggleComplete = async (itemId, isCompleted) => {
    if (!currentHome) return;
    const updatedShoppingItems = currentHome.shoppingItems.map((item) =>
      item.id === itemId ? { ...item, completed: isCompleted } : item
    );
    try {
      await updateCurrentHome({ shoppingItems: updatedShoppingItems });
    } catch (error) {
      console.error("Failed to update item completion:", error);
      showAlert("שגיאה בעדכון פריט. נסה שוב.", "שגיאה");
    }
  };

  /**
   * Handles toggling the urgency (priority) status of a shopping item.
   * @param {string} itemId - The ID of the item.
   */
  const handleTogglePriority = async (itemId) => {
    if (!currentHome) return;
    const updatedShoppingItems = currentHome.shoppingItems.map((item) =>
      item.id === itemId ? { ...item, isUrgent: !item.isUrgent } : item
    );
    try {
      await updateCurrentHome({ shoppingItems: updatedShoppingItems });
    } catch (error) {
      console.error("Failed to update item priority:", error);
      showAlert("שגיאה בעדכון דחיפות. נסה שוב.", "שגיאה");
    }
  };

  /**
   * Handles deleting a shopping item.
   * @param {string} itemId - The ID of the item to delete.
   * @param {string} itemText - The text of the item for confirmation.
   */
  const handleDeleteItem = async (itemId, itemText) => {
    showConfirm(`האם למחוק את "${itemText}"?`, "אישור מחיקה", async () => {
      if (!currentHome) return;
      const updatedShoppingItems = currentHome.shoppingItems.filter((item) => item.id !== itemId);
      try {
        await updateCurrentHome({ shoppingItems: updatedShoppingItems });
        showAlert("הפריט נמחק בהצלחה!", "הצלחה");
      } catch (error) {
        console.error("Failed to delete item:", error);
        showAlert("שגיאה במחיקת פריט. נסה שוב.", "שגיאה");
      }
    });
  };

  /**
   * Handles archiving a shopping item.
   * @param {string} itemId - The ID of the item to archive.
   * @param {string} itemText - The text of the item for confirmation.
   */
  const handleArchiveItem = async (itemId, itemText) => {
    showConfirm(`האם להעביר לארכיון את "${itemText}"?`, "אישור העברה לארכיון", async () => {
      if (!currentHome) return;
      const itemToArchive = currentHome.shoppingItems.find(item => item.id === itemId);
      if (!itemToArchive) return;

      const updatedShoppingItems = currentHome.shoppingItems.filter((item) => item.id !== itemId);
      const updatedArchivedShopping = [...currentHome.archivedShopping, itemToArchive];

      try {
        await updateCurrentHome({
          shoppingItems: updatedShoppingItems,
          archivedShopping: updatedArchivedShopping,
        });
        showAlert("הפריט הועבר לארכיון בהצלחה!", "הצלחה");
      } catch (error) {
        console.error("Failed to archive item:", error);
        showAlert("שגיאה בהעברה לארכיון. נסה שוב.", "שגיאה");
      }
    });
  };

  /**
   * Handles adding a new category.
   */
  const handleCreateCategory = () => {
    const handleSaveCategory = async (categoryName) => {
      if (!categoryName.trim()) {
        showAlert("שם קטגוריה אינו יכול להיות ריק.", "שגיאה");
        return;
      }
      if (!currentHome) return;

      const updatedCategories = [...currentHome.shoppingCategories];
      if (updatedCategories.some(cat => cat.toLowerCase() === categoryName.trim().toLowerCase())) {
        showAlert(`קטגוריה "${categoryName.trim()}" כבר קיימת.`, "שגיאה");
        return;
      }
      updatedCategories.push(categoryName.trim());

      try {
        await updateCurrentHome({ shoppingCategories: updatedCategories });
        showAlert("הקטגוריה נוספה בהצלחה!", "הצלחה");
        hideModal(); // Close modal on success
      } catch (error) {
        console.error("Failed to add category:", error);
        showAlert("שגיאה בהוספת קטגוריה. נסה שוב.", "שגיאה");
      }
    };

    showModal(
      'יצירת קטגוריה חדשה',
      <div>
        <label htmlFor="new-category-name">שם קטגוריה חדשה לקניות:</label>
        <input type="text" id="new-category-name" />
      </div>,
      [
        { text: 'צור', class: 'primary-action', onClick: () => handleSaveCategory(document.getElementById('new-category-name').value) },
        { text: 'בטל', class: 'secondary-action', onClick: hideModal },
      ]
    );
  };

  /**
   * Handles adding items from a template. (Placeholder, needs template manager integration)
   */
  const handleAddFromTemplate = () => {
    showAlert("הוספה מתבנית - פונקציונליות זו תתווסף בהמשך עם מנהל התבניות.", "תבניות");
  };

  /**
   * Handles assigning a user to a shopping item.
   * @param {string} itemId - The ID of the item.
   */
  const handleAssignUser = async (itemId) => {
    if (!currentHome) return;

    const item = currentHome.shoppingItems.find(i => i.id === itemId);
    if (!item) {
      showAlert("פריט לא נמצא לשיוך משתמש.", "שגיאה");
      return;
    }

    const userOptions = [{ value: 'משותף', label: 'משותף' }, ...currentHome.users.map(user => ({ value: user, label: user }))];

    const handleConfirmAssign = async (selectedUser) => {
      const updatedShoppingItems = currentHome.shoppingItems.map(i =>
        i.id === itemId ? { ...i, assignedTo: selectedUser } : i
      );
      try {
        await updateCurrentHome({ shoppingItems: updatedShoppingItems });
        hideModal();
      } catch (error) {
        console.error("Failed to assign user:", error);
        showAlert("שגיאה בשיוך משתמש. נסה שוב.", "שגיאה");
      }
    };

    showModal(
      `שיוך "${item.text}"`,
      <div>
        <label htmlFor="assign-user-select">שייך פריט אל:</label>
        <select
          id="assign-user-select"
          defaultValue={item.assignedTo || 'משותף'}
        >
          {userOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>,
      [
        { text: 'שמור', class: 'primary-action', onClick: () => handleConfirmAssign(document.getElementById('assign-user-select').value) },
        { text: 'בטל', class: 'secondary-action', onClick: hideModal },
      ]
    );
  };

  /**
   * Handles opening the CommentForm for a shopping item.
   * @param {string} itemId - The ID of the item.
   */
  const handleItemComment = (itemId) => {
    if (!currentHome) return;

    const item = currentHome.shoppingItems.find(i => i.id === itemId);
    if (!item) {
      showAlert("פריט לא נמצא להוספת הערה.", "שגיאה");
      return;
    }

    const handleSaveComment = async (comment) => {
      const updatedShoppingItems = currentHome.shoppingItems.map(i =>
        i.id === itemId ? { ...i, comment: comment } : i
      );
      try {
        await updateCurrentHome({ shoppingItems: updatedShoppingItems });
        hideModal();
      } catch (error) {
        console.error("Failed to save comment:", error);
        showAlert("שגיאה בשמירת הערה. נסה שוב.", "שגיאה");
      }
    };

    showModal(
      `הוספה/עריכת הערה עבור "${item.text}"`,
      <div>
        <label htmlFor="item-comment-input">הערה עבור "{item.text}":</label>
        <textarea id="item-comment-input" rows="4" defaultValue={item.comment || ''}></textarea>
      </div>,
      [
        { text: 'שמור', class: 'primary-action', onClick: () => handleSaveComment(document.getElementById('item-comment-input').value.trim()) },
        { text: 'בטל', class: 'secondary-action', onClick: hideModal },
      ]
    );
  };


  /**
   * Handles clearing all completed items from the shopping list.
   */
  const handleClearAll = async () => {
    showConfirm("האם למחוק את כל הפריטים שהושלמו?", "אישור מחיקה", async () => {
      if (!currentHome) return;
      const updatedShoppingItems = currentHome.shoppingItems.filter(item => !item.completed);
      try {
        await updateCurrentHome({ shoppingItems: updatedShoppingItems });
        showAlert("הפריטים שהושלמו נמחקו בהצלחה.", "הצלחה");
      } catch (error) {
        console.error("Failed to clear completed items:", error);
        showAlert("שגיאה בניקוי פריטים. נסה שוב.", "שגיאה");
      }
    });
  };

  /**
   * Converts a recipe text into a list of shopping items using Gemini API.
   */
  const handleRecipeToList = async () => {
    const bodyContent = (
      <div>
        <label htmlFor="recipe-input">הדבק כאן את המתכון המלא:</label>
        <textarea id="recipe-input" rows="10" placeholder="לדוגמה:&#10;2 כוסות קמח&#10;1 כפית אבקת אפייה&#10;..."></textarea>
      </div>
    );

    showModal('✨ הפוך מתכון לרשימת קניות', bodyContent, [
      { text: 'צור רשימה', class: 'primary-action gemini-btn', onClick: async () => {
          const recipeText = document.getElementById('recipe-input').value.trim();
          if (!recipeText) {
            showAlert("אנא הדבק מתכון.", "שגיאה");
            return;
          }

          setModalLoading(true); // Show loading spinner in modal

          const prompt = `From the following recipe text, extract all ingredients and return them as a JSON array of strings. Only return the JSON array. Recipe:\n\n${recipeText}`;
          // Gemini API does not directly support responseSchema in general generateContent
          // We expect a JSON string and will parse it.
          // Example schema for guidance, but actual API call won't use it directly here:
          const schema = {
              type: "OBJECT",
              properties: { "ingredients": { type: "ARRAY", items: { type: "STRING" } } }
          };

          let result;
          try {
              // Assuming gemini.generateStructuredText handles the API call and JSON parsing
              // and may need adjustment based on how it's implemented.
              // If gemini.js returns raw text, parsing might be needed here.
              result = await gemini.generateStructuredText(prompt, schema);
          } catch (apiError) {
              console.error("Error calling Gemini API:", apiError);
              showAlert("שגיאה בתקשורת עם שירותי ה-AI. נסה שוב מאוחר יותר.", "שגיאה");
              setModalLoading(false);
              return;
          }

          setModalLoading(false); // Hide loading spinner

          if (result && result.ingredients && Array.isArray(result.ingredients)) {
              if (result.ingredients.length === 0) {
                  showAlert("לא הצלחתי לזהות מרכיבים במתכון. נסה לנסח מחדש או להדביק מתכון ברור יותר.", "אין מרכיבים");
                  return;
              }

              const categoryName = 'מהמתכון';
              const updatedShoppingItems = [...currentHome.shoppingItems];
              const updatedShoppingCategories = [...currentHome.shoppingCategories];

              result.ingredients.forEach(ingredient => {
                  updatedShoppingItems.push({
                      id: Date.now() + Math.random(), // Unique ID
                      text: ingredient,
                      category: categoryName,
                      completed: false,
                      isUrgent: false,
                      assignedTo: 'משותף',
                      comment: '',
                  });
              });

              if (!updatedShoppingCategories.includes(categoryName)) {
                  updatedShoppingCategories.push(categoryName);
              }

              try {
                  await updateCurrentHome({
                      shoppingItems: updatedShoppingItems,
                      shoppingCategories: updatedShoppingCategories,
                  });
                  hideModal(); // Close the recipe modal
                  showAlert("רשימת הקניות נוצרה בהצלחה מתוך המתכון!", "הצלחה");
              } catch (updateError) {
                  console.error("Failed to update home with recipe items:", updateError);
                  showAlert("שגיאה בשמירת פריטי המתכון. נסה שוב.", "שגיאה");
              }
          } else {
              showAlert("לא הצלחתי להבין את המתכון. וודא שמפתח ה-API של Gemini הוגדר כראוי ושתוכן המתכון ברור.", "שגיאה ב-AI");
          }
        }},
        { text: 'בטל', class: 'secondary-action', onClick: hideModal },
      ]
    );
  };

  // Filtered items based on active user and category filters
  const filteredItems = currentHome?.shoppingItems
    .filter(item => {
      const categoryMatch = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
      const userMatch = activeUser === 'all' ||
                        (activeUser === 'משותף' && (!item.assignedTo || ['משותף', 'משותפת'].includes(item.assignedTo))) ||
                        item.assignedTo === activeUser;
      return categoryMatch && userMatch;
    })
    .sort((a, b) => b.isUrgent - a.isUrgent || a.text.localeCompare(b.text)); // Sort by urgency then alphabetically

  // Render loading spinner if home data is loading
  if (loading || !currentHome) {
    return <div className="modal-loader"><div className="spinner"></div></div>;
  }

  // Filter users to display in the user filter buttons
  const usersToDisplay = ['all', 'משותף', ...currentHome.users.filter(u => u !== 'משותף')];

  return (
    <section id="shopping-list" className="list-section active">
      <div className="list-title-container">
        <h3><span data-lang-key="shopping_list">רשימת קניות</span></h3>
        <div className="list-title-actions">
          <button className="create-category-btn header-style-button" onClick={handleCreateCategory}>
            <i className="fas fa-tags"></i> <span className="btn-text" data-lang-key="create_category">צור קטגוריה</span>
          </button>
          <button className="add-from-template-btn header-style-button" onClick={handleAddFromTemplate}>
            <i className="fas fa-paste"></i> <span className="btn-text" data-lang-key="add_from_template">הוסף מתבנית</span>
          </button>
          <button id="recipe-to-list-btn" className="header-style-button gemini-btn" onClick={handleRecipeToList}>
            ✨ <span className="btn-text" data-lang-key="recipe_to_list">הפוך מתכון לרשימה</span>
          </button>
        </div>
      </div>
      <div className="list-filters">
        <label data-lang-key="category">קטגוריה:</label>
        <select
          className="category-filter"
          value={activeCategoryFilter}
          onChange={(e) => setActiveCategoryFilter(e.target.value)}
        >
          <option value="all" data-lang-key="all">הכל</option>
          {currentHome.shoppingCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span style={{ borderLeft: '1px solid var(--border-grey)', margin: '0 10px' }}></span>
        <div className="user-filter-buttons">
          {usersToDisplay.map(user => (
            <button
              key={user}
              className={`user-filter-btn ${activeUser === user ? 'active' : ''}`}
              onClick={() => setActiveUser(user)}
            >
              {user === 'all' ? 'כולם' : user}
            </button>
          ))}
        </div>
      </div>
      <div className="add-area">
        <div className="add-item-form">
          <select
            className="add-item-category-select"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          >
            <option value="כללית" data-lang-key="general_cat">כללית</option>
            {currentHome.shoppingCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            className="add-item-input"
            data-lang-key-placeholder="add_shopping_item_placeholder"
            placeholder="הוסף פריט חדש לקניות..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAddItem();
            }}
          />
          <button className="add-item-btn" onClick={handleAddItem}>
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
      <div className="item-list">
        <ul className="item-list-ul">
          {filteredItems.length === 0 ? (
            <li style={{ textAlign: 'center', padding: '15px', color: '#777' }}>אין פריטים להצגה.</li>
          ) : (
            filteredItems.map((item) => (
              <ShoppingItem
                key={item.id}
                item={item}
                onToggleComplete={handleToggleComplete}
                onTogglePriority={handleTogglePriority}
                onDeleteItem={handleDeleteItem}
                onArchiveItem={handleArchiveItem}
                onAssignUser={handleAssignUser}
                onItemComment={handleItemComment}
              />
            ))
          )}
        </ul>
      </div>
      <div className="list-footer">
        <button className="clear-list-btn" onClick={handleClearAll}>
          <i className="fas fa-trash-alt"></i> <span data-lang-key="clear_all">נקה הכל</span>
        </button>
      </div>
    </section>
  );
};

export default ShoppingList;
