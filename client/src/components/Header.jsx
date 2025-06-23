import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

const Header = ({ onManageUsers, onManageTemplates, onViewArchive }) => {
    const { activeHome, currentUser, logoutHome } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Effect to prevent body scrolling when the mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isMenuOpen]);
    
    const handleMenuAction = (action) => {
        action();
        setIsMenuOpen(false);
    };

    return (
        <header className="app-header">
            <h1 className="header-title">{activeHome?.name || 'Smart Home'}</h1>

            {/* User info for desktop */}
            <div className="header-user">
                <i className="fas fa-user-circle"></i>
                <span>שלום, {currentUser}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="desktop-nav-actions">
                <button onClick={onManageUsers}><i className="fas fa-users"></i> ניהול בית</button>
                <button onClick={onManageTemplates}><i className="fas fa-file-alt"></i> תבניות</button>
                <button onClick={onViewArchive}><i className="fas fa-archive"></i> ארכיון</button>
                <button onClick={logoutHome} className="logout-btn"><i className="fas fa-sign-out-alt"></i> יציאה</button>
            </nav>

            {/* Hamburger button for mobile */}
            <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu">
                <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
            
            {/* Mobile slide-out menu */}
            <div className={`mobile-nav-menu ${isMenuOpen ? 'open' : ''}`}>
                <nav>
                    <a onClick={() => handleMenuAction(onManageUsers)}>
                        <i className="fas fa-users"></i> ניהול בני בית
                    </a>
                    <a onClick={() => handleMenuAction(onManageTemplates)}>
                        <i className="fas fa-file-alt"></i> ניהול תבניות
                    </a>
                     <a onClick={() => handleMenuAction(onViewArchive)}>
                        <i className="fas fa-archive"></i> צפייה בארכיון
                    </a>
                    <button className="logout-btn" onClick={logoutHome}>
                         <i className="fas fa-sign-out-alt"></i> יציאה
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
