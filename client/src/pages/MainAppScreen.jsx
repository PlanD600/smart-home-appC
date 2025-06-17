import React, { useState } from 'react';
import { useHome } from '../context/HomeContext';
import ShoppingList from '../features/shopping/ShoppingList';
import TaskList from '../features/tasks/TaskList';
import FinanceManagement from '../features/finance/FinanceManagement'; // <-- ייבוא חדש

const MainAppScreen = () => {
  const { activeHome, logout } = useHome();
  const [activeTab, setActiveTab] = useState('shopping-list'); 

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'shopping-list':
        return <ShoppingList />;
      case 'task-list':
        return <TaskList />;
      case 'finance-management':
        return <FinanceManagement />; // <-- שימוש ברכיב החדש
      default:
        return <ShoppingList />;
    }
  };

  // ... (the rest of the component remains the same)
  // ... (header, nav, etc.)
  
  return (
    <div id="main-app-screen" className="screen active">
      <header>
        <div className="header-left-part">
          <h2 id="current-home-name-header">{activeHome.name}</h2>
        </div>
        <div className="header-buttons right">
          <button id="logout-btn-header" className="logout-btn" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i> החלף בית
          </button>
        </div>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'shopping-list' ? 'active' : ''}`}
          onClick={() => setActiveTab('shopping-list')}
        >
          <i className="fas fa-shopping-cart"></i> <span>רשימת קניות</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'task-list' ? 'active' : ''}`}
          onClick={() => setActiveTab('task-list')}
        >
          <i className="fas fa-tasks"></i> <span>רשימת מטלות</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'finance-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('finance-management')}
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