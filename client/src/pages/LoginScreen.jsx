import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useModal } from "@/context/ModalContext";
import CreateHomeForm from "@/features/auth/CreateHomeForm";
import LoadingSpinner from "@/components/LoadingSpinner";
// שיניתי את שם קובץ ה-CSS המיובא כדי להשתמש בעיצוב החדש
import "./LoginScreen.redesigned.css";

const LoginScreen = () => {
    // כל הלוגיקה הקיימת נשארת ללא שינוי
    const { initializeHome, loading, error, setError } = useAppContext();
    const { showModal } = useModal();

    const [homeName, setHomeName] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [userName, setUserName] = useState("");

    useEffect(() => {
        setError(null);
    }, [setError]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!userName.trim() || !homeName.trim() || !accessCode.trim()) {
            setError("אנא מלא את כל השדות: שמך, שם הבית וקוד הגישה.");
            return;
        }
        await initializeHome(homeName, accessCode, userName);
    };

    const openCreateHomeModal = () => {
        showModal(<CreateHomeForm />, { title: "יצירת בית חדש" });
    };

    // --- JSX משוכתב עם מבנה סמנטי ועיצובי חדש ---
    return (
        <div className="login-screen-container">
            <div className="login-card">
                <header className="login-header">
                    <div className="login-icon">
                        <i className="fas fa-home"></i>
                    </div>
                    <h1   >ברוכים הבאים</h1>
                </header>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label htmlFor="homeName">שם הבית</label>
                        <input
                            id="homeName"
                            type="text"
                            placeholder="לדוגמה: בית משפחת ישראלי"
                            value={homeName}
                            onChange={(e) => setHomeName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="userName">השם שלך</label>
                        <input
                            id="userName"
                            type="text"
                            placeholder="לדוגמה: גידי"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="accessCode">קוד גישה</label>
                        <input
                            id="accessCode"
                            type="password"
                            placeholder="••••••••"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <p className="login-error-message">{error}</p>}
                    
                    <button 
                        type="submit"
                        className="login-submit-btn"
                        disabled={loading}
                    >
                        {loading ? <LoadingSpinner size="sm" /> : "כניסה"}
                    </button>
                </form>

                <footer className="login-footer">
                    <p>אין לכם עדיין בית?</p>
                    <button 
                        type="button"
                        onClick={openCreateHomeModal} 
                        className="create-home-link-btn"
                        disabled={loading}
                    >
                        צרו בית חדש ושתפו את המשפחה
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default LoginScreen;