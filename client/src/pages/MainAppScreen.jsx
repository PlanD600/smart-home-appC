// client/src/pages/MainAppScreen.jsx

import React, { useTransition, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { useModal } from "@/context/ModalContext";

import ShoppingList from "@/features/shopping/ShoppingList";
import TaskList from "@/features/tasks/TaskList";
import FinanceManagement from "@/features/finance/FinanceManagement";

import UserManager from '@/features/users/UserManager';
import TemplateManager from '@/features/templates/TemplateManager';
import ArchiveView from '@/components/ArchiveView';

const MainAppScreen = () => {
  const { activeHome, logoutHome, activeTab, changeActiveTab } = useAppContext(); 
  const { showModal } = useModal(); 
  const [isPending, startTransition] = useTransition();

  const openUserManager = () => showModal(<UserManager />, { title: 'ניהול בני בית' }); 
  const openTemplateManager = () => showModal(<TemplateManager />, { title: 'ניהול תבניות' }); 
  const openArchiveView = () => showModal(<ArchiveView />, { title: 'ארכיון' }); 

  const handleTabChange = useCallback((tabName) => {
    startTransition(() => {
      changeActiveTab(tabName);
    });
  }, [changeActiveTab]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'shopping-list':
        return <ShoppingList />;
      case 'task-list':
        return <TaskList />;
      case 'finance-management':
        return <FinanceManagement />;
      default:
        return <ShoppingList />;
    }
  };
  
  return (
    <div id="main-app-screen" className="screen active">
      <header>
        <div className="header-left-part">
          <div className="header-buttons left">
            <button id="create-template-btn-header" onClick={openTemplateManager}><i className="fas fa-plus"></i> <span>צור תבנית</span></button>
            <button id="manage-templates-btn-header" onClick={openTemplateManager}><i className="fas fa-list-alt"></i> <span>נהל תבניות</span></button>
            <button id="view-archive-btn-header" onClick={openArchiveView}><i className="fas fa-archive"></i> <span>ארכיון</span></button>
            <button id="manage-users-btn-header" className="header-style-button" onClick={openUserManager}>
              <i className="fas fa-users-cog"></i> <span>נהל בית</span>
            </button>
          </div>
          <h2 id="current-home-name-header">{activeHome?.name || 'טוען...'}</h2> 
        </div>
        <div className="header-buttons right">
            <button id="logout-btn-header" className="logout-btn" onClick={logoutHome}> 
              <i className="fas fa-sign-out-alt"></i> החלף בית
            </button>
        </div>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'shopping-list' ? 'active' : ''}`}
          onClick={() => handleTabChange('shopping-list')}
          disabled={isPending}
        >
          <i className="fas fa-shopping-cart"></i> <span>רשימת קניות</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'task-list' ? 'active' : ''}`}
          onClick={() => handleTabChange('task-list')}
          disabled={isPending}
        >
          <i className="fas fa-tasks"></i> <span>רשימת מטלות</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'finance-management' ? 'active' : ''}`}
          onClick={() => handleTabChange('finance-management')}
          disabled={isPending}
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