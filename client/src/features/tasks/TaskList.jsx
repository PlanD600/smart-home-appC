import React, { useState, useEffect, useMemo } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import TaskItem from './TaskItem.jsx';
import * as gemini from '../../services/gemini.js';

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
  
  const tasks = currentHome?.tasks || [];
  const taskCategories = currentHome?.taskCategories || [];
  const users = currentHome?.users || [];

  const handleAddItem = async () => {
    if (!newTaskText.trim()) {
      showAlert("אנא הזן משימה לרשימת המטלות.", "שגיאה");
      return;
    }

    const updatedTasks = [
      ...tasks,
      {
        id: crypto.randomUUID(),
        text: newTaskText.trim(),
        category: newCategory,
        completed: false,
        isUrgent: false,
        assignedTo: activeUser === 'all' ? 'משותף' : activeUser,
        comment: '',
      },
    ];
    const updatedCategories = [...taskCategories];
    if (!updatedCategories.includes(newCategory) && newCategory !== 'כללית') {
      updatedCategories.push(newCategory);
    }

    try {
      await updateCurrentHome({
        tasks: updatedTasks,
        taskCategories: updatedCategories,
      });
      setNewTaskText('');
      showAlert("המשימה נוספה בהצלחה!", "הצלחה");
    } catch (error) {
      console.error("Failed to add task item:", error);
      showAlert("שגיאה בהוספת משימה. נסה שוב.", "שגיאה");
    }
  };

  const handleToggleComplete = async (itemId, isCompleted) => {
    const updatedTasks = tasks.map((item) =>
      (item._id || item.id) === itemId ? { ...item, completed: isCompleted } : item
    );
    try {
      await updateCurrentHome({ tasks: updatedTasks });
    } catch (error) {
      console.error("Failed to update item completion:", error);
      showAlert("שגיאה בעדכון משימה. נסה שוב.", "שגיאה");
    }
  };

  const handleTogglePriority = async (itemId) => {
    const updatedTasks = tasks.map((item) =>
      (item._id || item.id) === itemId ? { ...item, isUrgent: !item.isUrgent } : item
    );
    try {
      await updateCurrentHome({ tasks: updatedTasks });
    } catch (error) {
      console.error("Failed to update item priority:", error);
      showAlert("שגיאה בעדכון דחיפות. נסה שוב.", "שגיאה");
    }
  };

  const handleDeleteItem = (itemId, itemText) => {
    showConfirm(`האם למחוק את "${itemText}"?`, "אישור מחיקה", async () => {
      const updatedTasks = tasks.filter((item) => (item._id || item.id) !== itemId);
      try {
        await updateCurrentHome({ tasks: updatedTasks });
        showAlert("המשימה נמחקה בהצלחה!", "הצלחה");
      } catch (error) {
        console.error("Failed to delete item:", error);
        showAlert("שגיאה במחיקת משימה. נסה שוב.", "שגיאה");
      }
    });
  };

  const handleArchiveItem = (itemId, itemText) => {
    showConfirm(`האם להעביר לארכיון את "${itemText}"?`, "אישור העברה לארכיון", async () => {
      const itemToArchive = tasks.find(item => (item._id || item.id) === itemId);
      if (!itemToArchive) return;

      const updatedTasks = tasks.filter((item) => (item._id || item.id) !== itemId);
      const updatedArchivedTasks = [...(currentHome.archivedTasks || []), itemToArchive];

      try {
        await updateCurrentHome({
          tasks: updatedTasks,
          archivedTasks: updatedArchivedTasks,
        });
        showAlert("המשימה הועברה לארכיון בהצלחה!", "הצלחה");
      } catch (error) {
        console.error("Failed to archive item:", error);
        showAlert("שגיאה בהעברה לארכיון. נסה שוב.", "שגיאה");
      }
    });
  };
    
    // Placeholder functions for now
    const handleCreateCategory = () => showAlert("Create category to be implemented.");
    const handleAddFromTemplate = () => showAlert("Add from template to be implemented.");
    const handleAssignUser = () => showAlert("Assign user to be implemented.");
    const handleItemComment = () => showAlert("Add comment to be implemented.");
    const handleClearAll = () => showAlert("Clear all to be implemented.");
    const handleBreakdownTask = () => showAlert("Breakdown task to be implemented.");


  const filteredItems = useMemo(() => tasks
    .filter(item => {
      const categoryMatch = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
      const userMatch = activeUser === 'all' ||
                        (activeUser === 'משותף' && (!item.assignedTo || ['משותף', 'משותפת'].includes(item.assignedTo))) ||
                        item.assignedTo === activeUser;
      return categoryMatch && userMatch;
    })
    .sort((a, b) => (b.isUrgent ? 1 : -1) - (a.isUrgent ? 1 : -1) || (a.text || '').localeCompare(b.text || '')), 
    [tasks, activeCategoryFilter, activeUser]);

  if (loading) {
    return <div className="p-4 text-center">טוען...</div>;
  }

  const usersToDisplay = ['all', 'משותף', ...users.filter(u => u !== 'משותף')];

  return (
    <section className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">רשימת מטלות</h2>
          <button className="text-sm text-blue-500 hover:underline" onClick={handleCreateCategory}>
             צור קטגוריה
          </button>
      </div>

       {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 p-2 bg-gray-100 rounded">
          <div>
              <label className="mr-2 text-sm font-medium">קטגוריה:</label>
              <select
                  className="p-2 border rounded text-sm"
                  value={activeCategoryFilter}
                  onChange={(e) => setActiveCategoryFilter(e.target.value)}
              >
                  <option value="all">הכל</option>
                  {taskCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                  ))}
              </select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm font-medium">משתמש:</label>
              {usersToDisplay.map(user => (
                  <button
                      key={user}
                      className={`px-3 py-1 text-sm rounded ${activeUser === user ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      onClick={() => setActiveUser(user)}
                  >
                      {user === 'all' ? 'כולם' : user}
                  </button>
              ))}
          </div>
      </div>


      {/* Add Item Form */}
      <div className="flex gap-2 mb-4">
          <input
              type="text"
              className="flex-grow p-2 border rounded"
              placeholder="הוסף מטלה חדשה..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          />
           <button 
              className="bg-purple-500 text-white p-2 rounded" 
              onClick={handleBreakdownTask}
              title="פרק משימה עם AI"
            >
              ✨
            </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddItem}>הוסף</button>
      </div>

      <div className="space-y-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <TaskItem
              key={item._id || item.id}
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
          <p className="text-gray-500 text-center py-4">רשימת המטלות ריקה.</p>
        )}
      </div>
    </section>
  );
};

export default TaskList;
