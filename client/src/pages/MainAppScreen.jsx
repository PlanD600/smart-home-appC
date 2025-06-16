import React, { useState, useContext } from 'react';
import { HomeContext } from '../context/HomeContext.jsx';
import ShoppingList from '../features/shopping/ShoppingList.jsx';
import TaskList from '../features/tasks/TaskList.jsx';
import FinanceManagement from '../features/finance/FinanceManagement.jsx';
import ArchiveView from '../components/ArchiveView.jsx';

function MainAppScreen() {
  const { activeHome, logout, openModal, closeModal} = useContext(HomeContext);
  // State שיזכור איזו לשונית פעילה כרגע
  const [activeTab, setActiveTab] = useState('shopping-list');

  const handleViewArchive = () => {
        openModal("ארכיון", <ArchiveView />);
    };
    
  return (
    <div id="main-app-screen" className="screen active">
      <header>
        <div className="header-left-part">
          <div className="header-buttons left">
              {/* כרגע הכפתורים יציגו התראה, נממש אותם בהמשך */}
              <button onClick={() => alert('בקרוב!')}><i className="fas fa-plus"></i> <span>צור תבנית</span></button>
              <button onClick={() => alert('בקרוב!')}><i className="fas fa-list-alt"></i> <span>נהל תבניות</span></button>
              <button onClick={handleViewArchive}><i className="fas fa-archive"></i> <span>ארכיון</span></button>
          </div>
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
          onClick={() => setActiveTab('shopping-list')}>
          <i className="fas fa-shopping-cart"></i> <span>רשימת קניות</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'task-list' ? 'active' : ''}`} 
          onClick={() => setActiveTab('task-list')}>
          <i className="fas fa-tasks"></i> <span>רשימת מטלות</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'finance-management' ? 'active' : ''}`} 
          onClick={() => setActiveTab('finance-management')}>
          <i className="fas fa-wallet"></i> <span>ניהול כספים</span>
        </button>
      </nav>

      <div className="tab-content">
        {/* כאן נציג את הרכיב המתאים לפי הלשונית הפעילה */}
        {activeTab === 'shopping-list' && <ShoppingList />}
        {activeTab === 'task-list' && <TaskList />}
        {activeTab === 'finance-management' && <FinanceManagement />}
      </div>
    </div>
  );
}

export default MainAppScreen;