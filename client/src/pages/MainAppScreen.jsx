import React from 'react'; // אין צורך ב-useState כאן יותר
import { useHome } from '../context/HomeContext'; 
import { useModal } from '../context/ModalContext'; 

// Import all the main components for the tabs
import ShoppingList from '../features/shopping/ShoppingList';
import TaskList from '../features/tasks/TaskList';
import FinanceManagement from '../features/finance/FinanceManagement';

// Import components that will be shown in modals
import UserManager from '../features/users/UserManager';
import TemplateManager from '../features/templates/TemplateManager';
import ArchiveView from '../components/ArchiveView';

const MainAppScreen = () => {
  // **תיקון: הסרת activeTab ו-setActiveTab מ-useState המקומי**
  // שימוש ב-activeTab ו-changeActiveTab מתוך useHome
  const { activeHome, logoutHome, activeTab, changeActiveTab } = useHome(); 
  const { showModal } = useModal(); 

  // --- Functions to open modals from the header ---
  const openUserManager = () => showModal(<UserManager />, { title: 'ניהול בני בית' }); 
  const openTemplateManager = () => showModal(<TemplateManager />, { title: 'ניהול תבניות' }); 
  const openArchiveView = () => showModal(<ArchiveView />, { title: 'ארכיון' }); 

  // Function to render the correct component based on the active tab
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'shopping-list':
        return <ShoppingList />;
      case 'task-list':
        return <TaskList />;
      case 'finance-management':
        return <FinanceManagement />;
      default:
        return <ShoppingList />; // ברירת מחדל אם activeTab לא תקין
    }
  };
  
  return (
    <div id="main-app-screen" className="screen active">
      <header>
        <div className="header-left-part">
          <div className="header-buttons left">
            {/* These buttons now open their respective managers in a modal */}
            <button id="create-template-btn-header" onClick={openTemplateManager}><i className="fas fa-plus"></i> <span>צור תבנית</span></button>
            <button id="manage-templates-btn-header" onClick={openTemplateManager}><i className="fas fa-list-alt"></i> <span>נהל תבניות</span></button>
            <button id="view-archive-btn-header" onClick={openArchiveView}><i className="fas fa-archive"></i> <span>ארכיון</span></button>
            
            {/* --- The consolidated button for user management --- */}
            <button id="manage-users-btn-header" className="header-style-button" onClick={openUserManager}>
              <i className="fas fa-users-cog"></i> <span>נהל בית</span>
            </button>
          </div>
          <h2 id="current-home-name-header">{activeHome.name}</h2>
        </div>
        <div className="header-buttons right">
            {/* Language switcher can be implemented later */}
            <button id="logout-btn-header" className="logout-btn" onClick={logoutHome}> 
              <i className="fas fa-sign-out-alt"></i> החלף בית
            </button>
        </div>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'shopping-list' ? 'active' : ''}`}
          onClick={() => changeActiveTab('shopping-list')} // **תיקון: שימוש ב-changeActiveTab מ-HomeContext**
        >
          <i className="fas fa-shopping-cart"></i> <span>רשימת קניות</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'task-list' ? 'active' : ''}`}
          onClick={() => changeActiveTab('task-list')} // **תיקון: שימוש ב-changeActiveTab מ-HomeContext**
        >
          <i className="fas fa-tasks"></i> <span>רשימת מטלות</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'finance-management' ? 'active' : ''}`}
          onClick={() => changeActiveTab('finance-management')} // **תיקון: שימוש ב-changeActiveTab מ-HomeContext**
        >
          <i className="fas fa-wallet"></i> <span>ניהול כספים</span>
        </button>
      </nav>

      <div className="tab-content">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default MainAppScreen;