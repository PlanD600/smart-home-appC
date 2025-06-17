// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/pages/MainAppScreen.jsx
import React, { useState } from 'react';
import { useHome } from '../context/HomeContext.jsx';
import { useNavigate } from 'react-router-dom';
import ShoppingList from '../features/shopping/ShoppingList';
import TaskList from '../features/tasks/TaskList';
import FinanceManagement from '../features/finance/FinanceManagement';

function MainAppScreen() {
    const [activeTab, setActiveTab] = useState('shopping'); // 'shopping', 'tasks', 'finance'
    const { currentHome, logoutUser } = useHome(); // Get logoutUser from context
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/'); // Navigate back to login screen
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'tasks':
                return <TaskList />;
            case 'finance':
                return <FinanceManagement />;
            case 'shopping':
            default:
                return <ShoppingList />;
        }
    };

    return (
        <div id="main-app-screen" className="screen active">
            <header>
                <div className="header-left-part">
                     <h2 id="current-home-name-header">{currentHome?.name || 'טוען...'}</h2>
                </div>
                <div className="header-buttons right">
                    {/* Add language switcher here later if needed */}
                    <button id="logout-btn-header" className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> החלף בית
                    </button>
                </div>
            </header>

            <nav className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'shopping' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shopping')}
                >
                    <i className="fas fa-shopping-cart"></i> רשימת קניות
                </button>
                <button
                    className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tasks')}
                >
                    <i className="fas fa-tasks"></i> רשימת מטלות
                </button>
                <button
                    className={`tab-button ${activeTab === 'finance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('finance')}
                >
                    <i className="fas fa-wallet"></i> ניהול כספים
                </button>
            </nav>

            <div className="tab-content">
                {renderActiveTab()}
            </div>
        </div>
    );
}

export default MainAppScreen;