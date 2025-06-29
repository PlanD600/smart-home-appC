// client/src/pages/MainAppScreen.jsx
import React from 'react';
import { useAppContext } from "@/context/AppContext";
import { useModal } from "@/context/ModalContext";


// Import components
import Header from '@/components/Header';
import ShoppingList from "@/features/shopping/ShoppingList";
import TaskList from "@/features/tasks/TaskList";
import FinanceManagement from "@/features/finance/FinanceManagement";
import UserManager from '@/features/users/UserManager';
import TemplateManager from '@/features/templates/TemplateManager';
import ArchiveView from '@/components/ArchiveView';

// קומפוננטת ניווט תחתון
const BottomTabNavigation = () => {
    const { activeTab, changeActiveTab, loading } = useAppContext();
    const tabs = [
        { name: 'shopping', label: 'קניות', icon: 'fa-shopping-cart' },
        { name: 'tasks', label: 'משימות', icon: 'fa-tasks' },
        { name: 'finance', label: 'כספים', icon: 'fa-wallet' },
    ];

    return (
        <nav className="bottom-tab-navigation">
            {tabs.map(tab => (
                <button 
                    key={tab.name}
                    className={`tab-button ${activeTab === tab.name ? 'active' : ''}`}
                    onClick={() => changeActiveTab(tab.name)}
                    disabled={loading}
                    aria-label={tab.label}
                >
                    <i className={`fas ${tab.icon}`}></i>
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
};


const MainAppScreen = () => {
    const { activeTab } = useAppContext(); 
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

    return (
        <div className="main-app-layout">
            <Header 
                onManageUsers={openUserManager} 
                onManageTemplates={openTemplateManager} 
                onViewArchive={openArchiveView} 
            />
            <main className="app-body">
                {renderActiveTab()}
            </main>
            <BottomTabNavigation />
        </div>
    );
};

export default MainAppScreen;