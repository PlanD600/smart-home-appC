import React, { useState, useEffect } from 'react';
// נתיבי יבוא מוחלטים מ-src
import { useHome } from 'src/context/HomeContext.jsx'; 
import { useModal } from 'src/context/ModalContext.jsx'; 
import ShoppingList from 'src/features/shopping/ShoppingList.jsx'; 
import TaskList from 'src/features/tasks/TaskList.jsx'; 
import FinanceManagement from 'src/features/finance/FinanceManagement.jsx'; 
import ArchiveView from 'src/components/ArchiveView.jsx'; 

// ייבוא קומפוננטות התבניות החדשות
import TemplateForm from 'src/features/templates/forms/TemplateForm.jsx'; 
import TemplateManager from 'src/features/templates/TemplateManager.jsx'; 


/**
 * @file MainAppScreen component
 * @description Renders the main application interface, including header, navigation tabs,
 * and different feature sections (Shopping List, Task List, Finance Management).
 */
const MainAppScreen = () => {
  const { currentHome, logout, updateCurrentHome } = useHome();
  const { showModal, hideModal, showAlert, showConfirm } = useModal();

  // State to manage the currently active tab
  const [activeTab, setActiveTab] = useState('shopping-list');

  // Effect to set the initial active tab from local storage or default
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Effect to save the active tab to local storage when it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  /**
   * Handles changing the active tab.
   * @param {string} tabId - The ID of the tab to activate (e.g., 'shopping-list', 'task-list', 'finance-management').
   */
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  /**
   * Handles logging out from the current home and switching back to the login screen.
   */
  const handleLogout = () => {
    showConfirm("האם אתה בטוח שברצונך להתנתק?", "החלף בית", () => {
      logout(); // This function should be provided by HomeContext
      showAlert("התנתקת בהצלחה.", "התנתקות");
    });
  };

  /**
   * Opens the modal for creating a new template.
   */
  const handleCreateTemplate = () => {
    showModal('יצירת תבנית חדשה', <TemplateForm onClose={hideModal} />);
  };

  /**
   * Opens the modal for managing existing templates.
   */
  const handleManageTemplates = () => {
    showModal('ניהול תבניות', <TemplateManager onClose={hideModal} />);
  };

  /**
   * Opens the modal to view archived items.
   */
  const handleViewArchive = () => {
    showModal(
      'ארכיון',
      <ArchiveView onClose={hideModal} />
    );
  };

  /**
   * Opens the modal for adding a new user.
   */
  const handleAddUser = () => {
    const handleSaveUser = async (username) => {
      if (!currentHome) return;
      const updatedHome = { ...currentHome };
      if (!updatedHome.users.includes(username)) {
        updatedHome.users.push(username);
        try {
          await updateCurrentHome(updatedHome); // Update the home in context and backend
          showAlert(`בן הבית ${username} נוסף בהצלחה!`, "הצלחה");
          hideModal(); // Close modal on success
        } catch (error) {
          console.error("Failed to add user:", error);
          showAlert("שגיאה בהוספת בן בית. נסה שוב.", "שגיאה");
        }
      } else {
        showAlert(`בן הבית ${username} כבר קיים.`, "שגיאה");
      }
    };

    showModal(
      'הוספת בן/בת בית',
      <div>
        <label htmlFor="new-user-name">שם המשתמש/ת:</label>
        <input type="text" id="new-user-name" />
      </div>,
      [
        { text: 'הוסף', class: 'primary-action', onClick: () => handleSaveUser(document.getElementById('new-user-name').value.trim()) },
        { text: 'בטל', class: 'secondary-action', onClick: hideModal },
      ]
    );
  };

  /**
   * Opens the modal for managing existing users.
   */
  const handleManageUsers = () => {
    if (!currentHome || !currentHome.users || currentHome.users.length === 0) {
      showAlert("לא הוגדרו בני בית עדיין.", "ניהול בני בית");
      return;
    }

    const handleRemoveUser = (usernameToRemove) => {
      showConfirm(`האם להסיר את "${usernameToRemove}"? כל הפריטים שמשויכים לו יועברו ל"משותף".`, "אישור הסרה", async () => {
        if (!currentHome) return;
        const updatedHome = { ...currentHome };
        updatedHome.users = updatedHome.users.filter(u => u !== usernameToRemove);

        // Reassign items from removed user to 'משותף'
        const reassign = (item) => {
          if (item.assignedTo === usernameToRemove) item.assignedTo = 'משותף';
        };

        updatedHome.shoppingItems.forEach(reassign);
        updatedHome.taskItems.forEach(reassign);
        if (updatedHome.finances) {
          updatedHome.finances.expectedBills.forEach(reassign);
          updatedHome.finances.income.forEach(reassign);
        }

        try {
          await updateCurrentHome(updatedHome);
          showAlert(`בן הבית ${usernameToRemove} הוסר בהצלחה.`, "הצלחה");
          // No need to re-open modal explicitly, as currentHome update will trigger re-render
        } catch (error) {
          console.error("Failed to remove user:", error);
          showAlert("שגיאה בהסרת בן בית. נסה שוב.", "שגיאה");
        } finally {
          hideModal(); // Close confirmation modal
        }
      });
    };

    const userListItems = currentHome.users.map(user => (
      <li key={user} data-user={user}>
        <span><i className="fas fa-user" aria-hidden="true"></i> {user}</span>
        <div className="item-actions">
          {user !== 'אני' && ( // Prevent removing the default user
            <button
              className="action-btn delete-user-btn"
              title="הסר בן בית"
              aria-label={`הסר את ${user}`}
              onClick={() => handleRemoveUser(user)}
            >
              <i className="far fa-trash-alt" aria-hidden="true"></i>הסר
            </button>
          )}
        </div>
      </li>
    ));

    showModal(
      'ניהול בני בית',
      <ul className="manage-list">{userListItems}</ul>,
      [{ text: 'סגור', class: 'secondary-action', onClick: hideModal }]
    );
  };


  /**
   * Handles language switching.
   * @param {string} lang - The language code (e.g., 'he', 'en', 'ar').
   */
  const handleLanguageSwitch = (lang) => {
    // In a full React app, this should ideally be managed by a dedicated LanguageContext
    // or a proper i18n library integrated with React.
    // For now, if a global `setLanguage` function exists from the original Vanilla JS, use it.
    if (typeof window.setLanguage === 'function') {
      window.setLanguage(lang);
    } else {
      console.warn("setLanguage function not found globally. Language switching may not work as expected.");
      showAlert("פונקציית החלפת שפה אינה זמינה. וודא שהיא הוגדרה כראוי.", "שגיאה");
    }
  };

  if (!currentHome) {
    // This case should ideally not be reached if App.jsx handles it correctly,
    // but as a fallback.
    return <LoginScreen />;
  }

  // Determine current language for active class on language buttons
  const currentLang = document.documentElement.lang || 'he';

  return (
    <div id="main-app-screen" className="screen active">
      <header>
        <div className="header-left-part">
          <div className="header-buttons left">
            <button id="create-template-btn-header" onClick={handleCreateTemplate}>
              <i className="fas fa-plus"></i> <span data-lang-key="create_template">צור תבנית</span>
            </button>
            <button id="manage-templates-btn-header" onClick={handleManageTemplates}>
              <i className="fas fa-list-alt"></i> <span data-lang-key="manage_templates">נהל תבניות</span>
            </button>
            <button id="view-archive-btn-header" onClick={handleViewArchive}>
              <i className="fas fa-archive"></i> <span data-lang-key="archive">ארכיון</span>
            </button>
            <button id="add-user-btn-header" className="header-style-button" onClick={handleAddUser}>
              <i className="fas fa-user-plus"></i> <span data-lang-key="add_user_short">הוסף בן בית</span>
            </button>
            <button id="manage-users-btn-header" className="header-style-button" onClick={handleManageUsers}>
              <i className="fas fa-users-cog"></i> <span data-lang-key="manage_users_short">נהל בני בית</span>
            </button>
          </div>
          <h2 id="current-home-name-header">{currentHome.name}</h2>
        </div>
        <div className="header-buttons right">
          <div id="language-switcher" className="language-switcher">
            <button data-lang="he" className={`lang-btn ${currentLang === 'he' ? 'active' : ''}`} onClick={() => handleLanguageSwitch('he')}>עב</button>
            <button data-lang="en" className={`lang-btn ${currentLang === 'en' ? 'active' : ''}`} onClick={() => handleLanguageSwitch('en')}>EN</button>
            <button data-lang="ar" className={`lang-btn ${currentLang === 'ar' ? 'active' : ''}`} onClick={() => handleLanguageSwitch('ar')}>AR</button>
          </div>
          <button id="logout-btn-header" className="logout-btn" data-lang-key="switch_home" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> החלף בית
          </button>
        </div>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'shopping-list' ? 'active' : ''}`}
          data-tab="shopping-list"
          onClick={() => handleTabChange('shopping-list')}
        >
          <i className="fas fa-shopping-cart"></i> <span data-lang-key="shopping_list">רשימת קניות</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'task-list' ? 'active' : ''}`}
          data-tab="task-list"
          onClick={() => handleTabChange('task-list')}
        >
          <i className="fas fa-tasks"></i> <span data-lang-key="task_list">רשימת מטלות</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'finance-management' ? 'active' : ''}`}
          data-tab="finance-management"
          onClick={() => handleTabChange('finance-management')}
        >
          <i className="fas fa-wallet"></i> <span data-lang-key="finance_management">ניהול כספים</span>
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === 'shopping-list' && (
          <ShoppingList />
        )}
        {activeTab === 'task-list' && (
          <TaskList />
        )}
        {activeTab === 'finance-management' && (
          <FinanceManagement />
        )}
      </div>
    </div>
  );
};

export default MainAppScreen;
