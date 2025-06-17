import React, { useState, useEffect, useCallback } from 'react';
import { useHome } from 'src/context/HomeContext.jsx'; // נתיב יבוא תקין
import { useModal } from 'src/context/ModalContext.jsx'; // נתיב יבוא תקין
import TaskItem from 'src/features/tasks/TaskItem.jsx'; // נתיב יבוא תקין
import * as gemini from 'src/services/gemini.js'; // ייבוא שירות ה-Gemini API

/**
 * @file TaskList component
 * @description Manages the display and functionality of the task list,
 * including adding tasks, filtering, and interacting with the Gemini API for task breakdown.
 */
const TaskList = () => {
  const { currentHome, updateCurrentHome, loading } = useHome();
  const { showModal, hideModal, showAlert, showConfirm, setLoading: setModalLoading } = useModal();

  // State for the new task input field
  const [newTaskText, setNewTaskText] = useState('');
  // State for the selected category for new tasks
  const [newCategory, setNewCategory] = useState('כללית');
  // State for the active user filter
  const [activeUser, setActiveUser] = useState('all');
  // State for the active category filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Load active user and category filters from localStorage on mount
  useEffect(() => {
    const savedUserFilter = localStorage.getItem('taskActiveUserFilter');
    if (savedUserFilter) {
      setActiveUser(savedUserFilter);
    }
    const savedCategoryFilter = localStorage.getItem('taskActiveCategoryFilter');
    if (savedCategoryFilter) {
      setActiveCategoryFilter(savedCategoryFilter);
    }
  }, []);

  // Save active user and category filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('taskActiveUserFilter', activeUser);
  }, [activeUser]);

  useEffect(() => {
    localStorage.setItem('taskActiveCategoryFilter', activeCategoryFilter);
  }, [activeCategoryFilter]);

  /**
   * Handles adding a new task item.
   */
  const handleAddItem = async () => {
    if (!newTaskText.trim()) {
      showAlert("אנא הזן משימה לרשימת המטלות.", "שגיאה");
      return;
    }
    if (!currentHome) return;

    const updatedTaskItems = [
      ...currentHome.taskItems,
      {
        id: Date.now(), // Unique ID for the new item
        text: newTaskText.trim(),
        category: newCategory,
        completed: false,
        isUrgent: false,
        assignedTo: activeUser === 'all' ? 'משותף' : activeUser,
        comment: '',
      },
    ];
    const updatedCategories = [...currentHome.taskCategories];
    if (!updatedCategories.includes(newCategory) && newCategory !== 'כללית') {
      updatedCategories.push(newCategory);
    }

    try {
      await updateCurrentHome({
        taskItems: updatedTaskItems,
        taskCategories: updatedCategories,
      });
      setNewTaskText(''); // Clear input after adding
      showAlert("המשימה נוספה בהצלחה!", "הצלחה");
    } catch (error) {
      console.error("Failed to add task item:", error);
      showAlert("שגיאה בהוספת משימה. נסה שוב.", "שגיאה");
    }
  };

  /**
   * Handles toggling the completion status of a task item.
   * @param {string} itemId - The ID of the item.
   * @param {boolean} isCompleted - The new completion status.
   */
  const handleToggleComplete = async (itemId, isCompleted) => {
    if (!currentHome) return;
    const updatedTaskItems = currentHome.taskItems.map((item) =>
      item.id === itemId ? { ...item, completed: isCompleted } : item
    );
    try {
      await updateCurrentHome({ taskItems: updatedTaskItems });
    } catch (error) {
      console.error("Failed to update item completion:", error);
      showAlert("שגיאה בעדכון משימה. נסה שוב.", "שגיאה");
    }
  };

  /**
   * Handles toggling the urgency (priority) status of a task item.
   * @param {string} itemId - The ID of the item.
   */
  const handleTogglePriority = async (itemId) => {
    if (!currentHome) return;
    const updatedTaskItems = currentHome.taskItems.map((item) =>
      item.id === itemId ? { ...item, isUrgent: !item.isUrgent } : item
    );
    try {
      await updateCurrentHome({ taskItems: updatedTaskItems });
    } catch (error) {
      console.error("Failed to update item priority:", error);
      showAlert("שגיאה בעדכון דחיפות. נסה שוב.", "שגיאה");
    }
  };

  /**
   * Handles deleting a task item.
   * @param {string} itemId - The ID of the item to delete.
   * @param {string} itemText - The text of the item for confirmation.
   */
  const handleDeleteItem = async (itemId, itemText) => {
    showConfirm(`האם למחוק את "${itemText}"?`, "אישור מחיקה", async () => {
      if (!currentHome) return;
      const updatedTaskItems = currentHome.taskItems.filter((item) => item.id !== itemId);
      try {
        await updateCurrentHome({ taskItems: updatedTaskItems });
        showAlert("המשימה נמחקה בהצלחה!", "הצלחה");
      } catch (error) { // Added missing catch block
        console.error("Failed to delete item:", error);
        showAlert("שגיאה במחיקת משימה. נסה שוב.", "שגיאה");
      }
    });
  };

  /**
   * Handles archiving a task item.
   * @param {string} itemId - The ID of the item to archive.
   * @param {string} itemText - The text of the item for confirmation.
   */
  const handleArchiveItem = async (itemId, itemText) => {
    showConfirm(`האם להעביר לארכיון את "${itemText}"?`, "אישור העברה לארכיון", async () => {
      if (!currentHome) return;
      const itemToArchive = currentHome.taskItems.find(item => item.id === itemId);
      if (!itemToArchive) return;

      const updatedTaskItems = currentHome.taskItems.filter((item) => item.id !== itemId);
      const updatedArchivedTasks = [...currentHome.archivedTasks, itemToArchive];

      try {
        await updateCurrentHome({
          taskItems: updatedTaskItems,
          archivedTasks: updatedArchivedTasks,
        });
        showAlert("המשימה הועברה לארכיון בהצלחה!", "הצלחה");
      } catch (error) { // Added missing catch block
        console.error("Failed to archive item:", error);
        showAlert("שגיאה בהעברה לארכיון. נסה שוב.", "שגיאה");
      }
    });
  };

  /**
   * Handles adding a new task category.
   */
  const handleCreateCategory = () => {
    const handleSaveCategory = async (categoryName) => {
      if (!categoryName.trim()) {
        showAlert("שם קטגוריה אינו יכול להיות ריק.", "שגיאה");
        return;
      }
      if (!currentHome) return;

      const updatedCategories = [...currentHome.taskCategories];
      if (updatedCategories.some(cat => cat.toLowerCase() === categoryName.trim().toLowerCase())) {
        showAlert(`קטגוריה "${categoryName.trim()}" כבר קיימת.`, "שגיאה");
        return;
      }
      updatedCategories.push(categoryName.trim());

      try {
        await updateCurrentHome({ taskCategories: updatedCategories });
        showAlert("הקטגוריה נוספה בהצלחה!", "הצלחה");
        hideModal(); // Close modal on success
      } catch (error) { // Added missing catch block
        console.error("Failed to add category:", error);
        showAlert("שגיאה בהוספת קטגוריה. נסה שוב.", "שגיאה");
      }
    };

    showModal(
      'יצירת קטגוריה חדשה',
      <div>
        <label htmlFor="new-category-name">שם קטגוריה חדשה למטלות:</label>
        <input type="text" id="new-category-name" />
      </div>,
      [
        { text: 'צור', class: 'primary-action', onClick: () => handleSaveCategory(document.getElementById('new-category-name').value) },
        { text: 'בטל', class: 'secondary-action', onClick: hideModal },
      ]
    );
  };

  /**
   * Handles adding tasks from a template. (Placeholder, needs template manager integration)
   */
  const handleAddFromTemplate = () => {
    showAlert("הוספה מתבנית - פונקציונליות זו תתווסף בהמשך עם מנהל התבניות.", "תבניות");
  };

  /**
   * Handles assigning a user to a task item.
   * @param {string} itemId - The ID of the item.
   */
  const handleAssignUser = async (itemId) => {
    if (!currentHome) return;

    const item = currentHome.taskItems.find(i => i.id === itemId);
    if (!item) {
      showAlert("פריט לא נמצא לשיוך משתמש.", "שגיאה");
      return;
    }

    const userOptions = [{ value: 'משותף', label: 'משותף' }, ...currentHome.users.map(user => ({ value: user, label: user }))];

    const handleConfirmAssign = async (selectedUser) => {
      const updatedTaskItems = currentHome.taskItems.map(i =>
        i.id === itemId ? { ...i, assignedTo: selectedUser } : i
      );
      try {
        await updateCurrentHome({ taskItems: updatedTaskItems });
        hideModal();
      } catch (error) { // Added missing catch block
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
   * Handles opening the CommentForm for a task item.
   * @param {string} itemId - The ID of the item.
   */
  const handleItemComment = (itemId) => {
    if (!currentHome) return;

    const item = currentHome.taskItems.find(i => i.id === itemId);
    if (!item) {
      showAlert("פריט לא נמצא להוספת הערה.", "שגיאה");
      return;
    }

    const handleSaveComment = async (comment) => {
      const updatedTaskItems = currentHome.taskItems.map(i =>
        i.id === itemId ? { ...i, comment: comment } : i
      );
      try {
        await updateCurrentHome({ taskItems: updatedTaskItems });
        hideModal();
      } catch (error) { // Added missing catch block
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
   * Handles clearing all completed items from the task list.
   */
  const handleClearAll = async () => {
    showConfirm("האם למחוק את כל המשימות שהושלמו?", "אישור מחיקה", async () => {
      if (!currentHome) return;
      const updatedTaskItems = currentHome.taskItems.filter(item => !item.completed);
      try {
        await updateCurrentHome({ taskItems: updatedTaskItems });
        showAlert("המשימות שהושלמו נמחקו בהצלחה.", "הצלחה");
      } catch (error) { // Added missing catch block
        console.error("Failed to clear completed tasks:", error);
        showAlert("שגיאה בניקוי משימות. נסה שוב.", "שגיאה");
      }
    });
  };

  /**
   * Breaks down a complex task into smaller sub-tasks using the Gemini API.
   */
  const handleBreakdownTask = async () => {
    // We can use the text from the new task input, or open a dedicated modal for it.
    // For consistency with the original app's breakdown button, let's use the input field.
    const taskText = newTaskText.trim(); 

    if (!taskText) {
      showAlert("אנא הזן משימה מורכבת לפירוק.", "שגיאה");
      return;
    }
    if (!currentHome) return;

    setModalLoading(true); // Show loading spinner in modal (or use a dedicated spinner for the button)

    const prompt = `Break down the following complex task into smaller, actionable sub-tasks. Provide the sub-tasks as a JSON array of strings. Only return the JSON array. Task: ${taskText}`;
    
    // Example schema for guidance, but actual API call won't use it directly here:
    const schema = {
        type: "OBJECT",
        properties: { "subtasks": { type: "ARRAY", items: { type: "STRING" } } }
    };

    let result;
    try {
        result = await gemini.generateStructuredText(prompt, schema);
    } catch (apiError) {
        console.error("Error calling Gemini API for task breakdown:", apiError);
        showAlert("שגיאה בתקשורת עם שירותי ה-AI. נסה שוב מאוחר יותר.", "שגיאה");
        setModalLoading(false);
        return;
    }

    setModalLoading(false); // Hide loading spinner

    if (result && result.subtasks && Array.isArray(result.subtasks) && result.subtasks.length > 0) {
        const categoryName = `פרויקט: ${taskText.substring(0, Math.min(taskText.length, 20))}...`; // Create a category name from the task
        const updatedTaskItems = [...currentHome.taskItems];
        const updatedTaskCategories = [...currentHome.taskCategories];

        if (!updatedTaskCategories.includes(categoryName)) {
            updatedTaskCategories.push(categoryName);
        }

        result.subtasks.forEach(subtask => {
            updatedTaskItems.push({
                id: Date.now() + Math.random(), // Unique ID
                text: subtask,
                category: categoryName,
                completed: false,
                isUrgent: false,
                assignedTo: 'משותף',
                comment: '',
            });
        });

        try {
            await updateCurrentHome({
                taskItems: updatedTaskItems,
                taskCategories: updatedTaskCategories,
            });
            setNewTaskText(''); // Clear the original task input
            showAlert("המשימה פורקה בהצלחה לתתי-משימות!", "הצלחה");
        } catch (updateError) { // Added missing catch block
            console.error("Failed to update home with subtasks:", updateError);
            showAlert("שגיאה בשמירת תתי-המשימות. נסה שוב.", "שגיאה");
        }
    } else {
        showAlert("לא הצלחתי לפרק את המשימה. נסה לפרט יותר וודא שמפתח ה-API של Gemini הוגדר כראוי ושתוכן המשימה ברור.", "שגיאה ב-AI");
    }
  };

  // Filtered items based on active user and category filters
  const filteredItems = currentHome?.taskItems
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
    <section id="task-list" className="list-section">
      <div className="list-title-container">
        <h3><span data-lang-key="task_list">רשימת מטלות</span></h3>
        <div className="list-title-actions">
          <button className="create-category-btn header-style-button" onClick={handleCreateCategory}>
            <i className="fas fa-tags"></i> <span className="btn-text" data-lang-key="create_category">צור קטגוריה</span>
          </button>
          <button className="add-from-template-btn header-style-button" onClick={handleAddFromTemplate}>
            <i className="fas fa-paste"></i> <span className="btn-text" data-lang-key="add_from_template">הוסף מתבנית</span>
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
          {currentHome.taskCategories.map((cat) => (
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
            {currentHome.taskCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            className="add-item-input"
            data-lang-key-placeholder="add_task_item_placeholder"
            placeholder="הוסף מטלה חדשה או משימה לפירוק..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAddItem();
            }}
          />
          <button className="add-item-btn" onClick={handleAddItem}>
            <i className="fas fa-plus"></i>
          </button>
          <button
            id="breakdown-task-btn"
            className="gemini-btn"
            data-lang-key-title="breakdown_task_title"
            title="✨ פרק משימה מורכבת לתתי-משימות"
            onClick={handleBreakdownTask}
          >
            ✨
          </button>
        </div>
      </div>
      <div className="item-list">
        <ul className="item-list-ul">
          {filteredItems.length === 0 ? (
            <li style={{ textAlign: 'center', padding: '15px', color: '#777' }}>אין פריטים להצגה.</li>
          ) : (
            filteredItems.map((item) => (
              <TaskItem
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

export default TaskList;
