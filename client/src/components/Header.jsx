import React from 'react';
import { useAppContext } from '@/context/AppContext';

// The 'on' props are for the desktop view, as on mobile they are in a separate menu
const Header = ({ onManageUsers, onManageTemplates, onViewArchive }) => {
    const { activeHome, currentUser, logoutHome } = useAppContext();

    // In a real scenario, the mobile menu state would be managed here
    // But for this responsive design, we use CSS to show/hide elements

    return (
        <header className="app-header">
            <div className="header-content">
                {/* Home name, always visible */}
                <h1 className="header-title">{activeHome?.name || 'Smart Home'}</h1>

                {/* User info, shown only on desktop via CSS */}
                <div className="header-user-info">
                    <i className="fas fa-user-circle"></i>
                    <span>שלום, {currentUser}</span>
                </div>
                
                {/* Desktop navigation buttons */}
                <nav className="header-nav">
                    <button onClick={onManageUsers}>
                        <i className="fas fa-users"></i>
                        <span>ניהול</span>
                    </button>
                    <button onClick={onManageTemplates}>
                        <i className="fas fa-file-alt"></i>
                        <span>תבניות</span>
                    </button>
                    <button onClick={onViewArchive}>
                        <i className="fas fa-archive"></i>
                        <span>ארכיון</span>
                    </button>
                    <button onClick={logoutHome} className="logout-btn">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>יציאה</span>
                    </button>
                </nav>

                {/* Mobile hamburger menu button */}
                <button
                    className="mobile-menu-toggle"
                    // This would open a mobile-specific menu/modal
                    // For now, it's a placeholder
                    onClick={onManageUsers} 
                    aria-label="Toggle menu"
                >
                    <i className={'fas fa-bars'}></i>
                </button>
            </div>
        </header>
    );
};

export default Header;