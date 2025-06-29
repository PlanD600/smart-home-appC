// client/src/components/Header.jsx
import React from 'react';
import { useAppContext } from '@/context/AppContext';

const Header = ({ onManageUsers, onManageTemplates, onViewArchive }) => {
    const { activeHome, currentUser, logoutHome } = useAppContext();

    return (
        <header className="app-header">
            <div className="header-content">
                <h1 className="header-title">{activeHome?.name || 'Smart Home'}</h1>

                <div className="header-user-info">
                    <i className="fas fa-user-circle"></i>
                    <span>שלום, {currentUser}</span>
                </div>

                <nav className="header-nav">
                    <button onClick={onManageUsers} className="header-action-btn" title="ניהול בני בית">
                        <i className="fas fa-users"></i>
                        <span className="btn-text">ניהול</span>
                    </button>
                    <button onClick={onManageTemplates} className="header-action-btn" title="ניהול תבניות">
                        <i className="fas fa-file-alt"></i>
                        <span className="btn-text">תבניות</span>
                    </button>
                    <button onClick={onViewArchive} className="header-action-btn" title="ארכיון">
                        <i className="fas fa-archive"></i>
                        <span className="btn-text">ארכיון</span>
                    </button>
                    <button onClick={logoutHome} className="header-action-btn logout-btn" title="יציאה">
                        <i className="fas fa-sign-out-alt"></i>
                        <span className="btn-text">יציאה</span>
                    </button>
                </nav>

                {/* כפתור המבורגר למובייל, שיוסתר ויוצג עם CSS */}
                <button className="mobile-menu-toggle" aria-label="Toggle menu">
                     <i className="fas fa-bars"></i>
                </button>
            </div>
        </header>
    );
};

export default Header;