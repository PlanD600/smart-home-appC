// client/src/pages/LoginScreen.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHome } from '../context/HomeContext';
import { apiLoginHome, apiCreateHome } from '../services/api';

const AVAILABLE_ICONS = ["fas fa-home", "fas fa-user-friends", "fas fa-briefcase", "fas fa-heart", "fas fa-star", "fas fa-car", "fas fa-building", "fas fa-graduation-cap", "fas fa-lightbulb", "fas fa-piggy-bank"];

function LoginScreen() {
    const { loginUser } = useHome();
    const navigate = useNavigate();

    const [isLoginMode, setIsLoginMode] = useState(true);

    const [name, setName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setName('');
        setAccessCode('');
        setError('');
        setSelectedIcon(AVAILABLE_ICONS[0]);
    };

    const handleAction = async (actionType) => {
        setLoading(true);
        setError('');
        const credentials = { name, accessCode, iconClass: selectedIcon };

        try {
            const apiCall = actionType === 'login' ? apiLoginHome : apiCreateHome;
            const { data: homeData } = await apiCall(credentials);
            loginUser(homeData);
            navigate('/app');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const sharedFormFields = (
        <>
            <label>בחר אייקון</label>
            <div className="icon-selector">
                {AVAILABLE_ICONS.map(icon => (
                    <i key={icon} className={`${icon} ${selectedIcon === icon ? 'selected' : ''}`} onClick={() => setSelectedIcon(icon)} />
                ))}
            </div>

            <label htmlFor="home-name">שם הבית</label>
            <input id="home-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="הקלד שם..." />
            
            <label htmlFor="access-code">סיסמה</label>
            <input id="access-code" type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} required placeholder="הקלד סיסמה..." />
        </>
    );

    return (
        <div className="login-container">
            <div className="login-card">
                {isLoginMode ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleAction('login'); }} className="login-card-form">
                        <h2 style={{ textAlign: 'center', marginTop: '0' }}>כניסה לבית</h2>
                        {sharedFormFields}
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="form-submit-btn login" disabled={loading}>
                            {loading ? 'מתחבר...' : 'התחבר'}
                        </button>
                        <p className="switch-mode-text">
                            אין לך בית? <span onClick={() => { resetForm(); setIsLoginMode(false); }}>צור אחד חדש</span>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); handleAction('create'); }} className="login-card-form">
                        <h2 style={{ textAlign: 'center', marginTop: '0' }}>יצירת בית חדש</h2>
                        {sharedFormFields}
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="form-submit-btn create" disabled={loading}>
                            {loading ? 'יוצר...' : 'צור בית'}
                        </button>
                        <p className="switch-mode-text">
                            יש לך כבר בית? <span onClick={() => { resetForm(); setIsLoginMode(true); }}>חזור למסך הכניסה</span>
                        </p>
                    </form>
                )}
            </div>
            <style>{`
                .switch-mode-text { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #555; }
                .switch-mode-text span { color: var(--mint-green); font-weight: 700; cursor: pointer; text-decoration: underline; }
            `}</style>
        </div>
    );
}

export default LoginScreen;