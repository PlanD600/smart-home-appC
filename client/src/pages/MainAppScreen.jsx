import React from 'react';
import { useAppContext } from "@/context/AppContext";
import { useModal } from "@/context/ModalContext";

// Import components
import ShoppingList from "@/features/shopping/ShoppingList";
import TaskList from "@/features/tasks/TaskList";
import FinanceManagement from "@/features/finance/FinanceManagement";
import UserManager from '@/features/users/UserManager';
import TemplateManager from '@/features/templates/TemplateManager';
import ArchiveView from '@/components/ArchiveView';
import Header from '@/components/Header';

// Import the new CSS for the layout
import '@/styles/MainAppLayout.css'; 

const MainAppScreen = () => {
    const { activeTab, changeActiveTab, loading } = useAppContext(); 
    const { showModal } = useModal(); 

    const openUserManager = () => showModal(<UserManager />, { title: 'ניהול בני בית' }); 
    const openTemplateManager = () => showModal(<TemplateManager />, { title: 'ניהול תבניות' }); 
    const openArchiveView = () => showModal(<ArchiveView />, { title: 'ארכיון' }); 

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'shopping': return <ShoppingList />;
            case 'tasks': return <TaskList />;
            case 'finance': return <FinanceManagement />;
            default: return <ShoppingList />;
        }
    };
    
    // The main navigation component, used for both sidebar and bottom tabs
    const MainNavigation = () => (
        <>
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
        </>
    );
  
    return (
        <div className="main-app-layout">
            <Header onManageUsers={openUserManager} onManageTemplates={openTemplateManager} onViewArchive={openArchiveView} />

            <div className="app-body">
                {/* Sidebar - only visible on desktop via CSS */}
                <nav className="sidebar">
                    <MainNavigation />
                </nav>

                {/* Main content area */}
                <main className="main-content">
                    {renderActiveTab()}
                </main>
            </div>
            
            {/* Bottom navigation bar - only visible on mobile via CSS */}
            <nav className="bottom-tab-navigation">
                <MainNavigation />
            </nav>
        </div>
    );
};

export default MainAppScreen;