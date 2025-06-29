import React, { useState, useEffect } from 'react'; // <-- התיקון כאן! הוספנו את useState ו-useEffect
import { useAppContext } from '@/context/AppContext';

const Header = ({ onManageUsers, onManageTemplates, onViewArchive }) => {
    const { activeHome, currentUser, logoutHome } = useAppContext();
    
    // [חדש] State לניהול מצב התפריט במובייל
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // [חדש] פונקציה לפתיחה/סגירה של התפריט
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // [חדש] אפקט שמונע גלילה של הדף כשהתפריט פתוח
    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
        // פונקציית ניקוי להסרת הקלאס כשהקומפוננטה נסגרת
        return () => {
            document.body.classList.remove('menu-open');
        };
    }, [isMenuOpen]);


    return (
        <header className="app-header">
            <div className="header-content">
                <h1 className="header-title">{activeHome?.name || 'Smart Home'}</h1>

                {/* --- תפריט הניווט --- */}
                <nav className={`header-nav ${isMenuOpen ? 'is-open' : ''}`}>
                    {/* פרטי המשתמש, מוצגים ראשונים בתפריט הצד */}
                    <div className="header-user-info">
                        <i className="fas fa-user-circle"></i>
                        <span>שלום, {currentUser}</span>
                    </div>

                    <button onClick={() => { onManageUsers(); toggleMenu(); }}>
                        <i className="fas fa-users"></i>
                        <span>ניהול</span>
                    </button>
                    <button onClick={() => { onManageTemplates(); toggleMenu(); }}>
                        <i className="fas fa-file-alt"></i>
                        <span>תבניות</span>
                    </button>
                    <button onClick={() => { onViewArchive(); toggleMenu(); }}>
                        <i className="fas fa-archive"></i>
                        <span>ארכיון</span>
                    </button>
                    <button onClick={() => { logoutHome(); toggleMenu(); }} className="logout-btn">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>יציאה</span>
                    </button>
                </nav>

                {/* כפתור ההמבורגר שיוצג רק במובייל */}
                <button
                    className="mobile-menu-toggle"
                    onClick={toggleMenu} 
                    aria-label="Toggle menu"
                >
                    <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
                </button>
            </div>
        </header>
    );
};

export default Header;