import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

const Header = ({ onManageUsers, onManageTemplates, onViewArchive }) => {
    const { activeHome, currentUser, logoutHome } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // אפקט זה מונע גלילה של הדף כאשר תפריט המובייל פתוח - נשאיר אותו
    useEffect(() => {
        const bodyClass = 'menu-open';
        if (isMenuOpen) {
            document.body.classList.add(bodyClass);
        } else {
            document.body.classList.remove(bodyClass);
        }
        return () => document.body.classList.remove(bodyClass);
    }, [isMenuOpen]);

    // פונקציית עזר לסגירת התפריט לאחר לחיצה
    const handleMenuAction = (action) => {
        if (action) {
            action();
        }
        setIsMenuOpen(false);
    };

    return (
        <header className="app-header">
            <div className="header-content">
                {/* שם הבית */}
                <h1 className="header-title">{activeHome?.name || 'Smart Home'}</h1>

                {/* מידע על המשתמש (יוצג תמיד) */}
                <div className="header-user-info">
                    <i className="fas fa-user-circle"></i>
                    <span>שלום, {currentUser}</span>
                </div>

                {/* כפתור המבורגר שיוצג רק במובייל */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
                </button>

                {/* אלמנט ניווט יחיד שמתאים את עצמו לגודל המסך */}
                <nav className={`header-nav ${isMenuOpen ? 'is-open' : ''}`}>
                    <button onClick={() => handleMenuAction(onManageUsers)}>
                        <i className="fas fa-users"></i>
                        <span>ניהול בית</span>
                    </button>
                    <button onClick={() => handleMenuAction(onManageTemplates)}>
                        <i className="fas fa-file-alt"></i>
                        <span>תבניות</span>
                    </button>
                    <button onClick={() => handleMenuAction(onViewArchive)}>
                        <i className="fas fa-archive"></i>
                        <span>ארכיון</span>
                    </button>
                    <button onClick={() => handleMenuAction(logoutHome)} className="logout-btn">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>יציאה</span>
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;