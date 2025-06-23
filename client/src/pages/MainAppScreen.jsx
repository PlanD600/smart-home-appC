import React, { Suspense, lazy } from "react";
import { useAppContext } from "@/context/AppContext";
import { useModal } from "@/context/ModalContext";

import ShoppingList from "@/features/shopping/ShoppingList";
import TaskList from "@/features/tasks/TaskList";
import FinanceManagement from "@/features/finance/FinanceManagement";
import UserManager from '@/features/users/UserManager';
import TemplateManager from '@/features/templates/TemplateManager';
import ArchiveView from '@/components/ArchiveView';
import Header from '@/components/Header'; // We'll use the dedicated Header component

const MainAppScreen = () => {
    const { activeTab, changeActiveTab, loading } = useAppContext(); 
    const { showModal } = useModal(); 

    const openUserManager = () => showModal(<UserManager />, { title: 'ניהול בני בית' }); 
    const openTemplateManager = () => showModal(<TemplateManager />, { title: 'ניהול תבניות' }); 
    const openArchiveView = () => showModal(<ArchiveView />, { title: 'ארכיון' }); 

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'shopping':
                return <ShoppingList />;
            case 'tasks':
                return <TaskList />;
            case 'finance':
                return <FinanceManagement />;
            default:
                return <ShoppingList />; // Default to shopping list
        }
    };
  
    return (
        <div id="main-app-screen" className="main-app-layout">
            {/* The header is now a separate, clean component */}
            <Header onManageUsers={openUserManager} onManageTemplates={openTemplateManager} onViewArchive={openArchiveView} />

            <main className="main-content">
                {/* Main content area where the active tab's component is rendered */}
                {renderActiveTab()}
            </main>

            {/* Bottom navigation bar, ideal for mobile */}
            <nav className="bottom-tab-navigation">
                <button 
                    className={`tab-button ${activeTab === 'shopping' ? 'active' : ''}`}
                    onClick={() => changeActiveTab('shopping')}
                    disabled={loading}
                    aria-label="Shopping List"
                >
                    <i className="fas fa-shopping-cart"></i>
                    <span>קניות</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
                    onClick={() => changeActiveTab('tasks')}
                    disabled={loading}
                    aria-label="Task List"
                >
                    <i className="fas fa-tasks"></i>
                    <span>משימות</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'finance' ? 'active' : ''}`}
                    onClick={() => changeActiveTab('finance')}
                    disabled={loading}
                    aria-label="Finance Management"
                >
                    <i className="fas fa-wallet"></i>
                    <span>כספים</span>
                </button>
            </nav>
        </div>
    );
};

export default MainAppScreen;
