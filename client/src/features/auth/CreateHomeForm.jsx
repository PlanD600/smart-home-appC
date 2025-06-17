// client/src/features/auth/CreateHomeForm.jsx

import React, { useState } from 'react';
import { apiCreateHome } from '../../services/api';

const AVAILABLE_ICONS = ["fas fa-home", "fas fa-user-friends", "fas fa-briefcase", "fas fa-heart", "fas fa-star", "fas fa-car", "fas fa-building", "fas fa-graduation-cap", "fas fa-lightbulb", "fas fa-piggy-bank"];

function CreateHomeForm({ onSuccess }) {
    const [name, setName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data: newHome } = await apiCreateHome({ name, accessCode, iconClass: selectedIcon });
            // קורא לפונקציה שהועברה מ-LoginScreen כדי לטפל בהצלחה
            onSuccess(newHome);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create home.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
         <form onSubmit={handleSubmit} className="login-card-form">
            <h2 style={{ textAlign: 'center', marginTop: 0 }}>יצירת בית חדש</h2>
            
            <label>שם הבית</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="לדוגמה: הדירה בתל אביב" />

            <label>בחר אייקון</label>
            <div className="icon-selector">
                {AVAILABLE_ICONS.map(icon => (
                    <i key={icon} className={`${icon} ${selectedIcon === icon ? 'selected' : ''}`} onClick={() => setSelectedIcon(icon)} />
                ))}
            </div>
            
            <label>קבע סיסמה</label>
            <input type="password" value={accessCode} onChange={e => setAccessCode(e.target.value)} required placeholder="סיסמה חזקה" />
            
            {error && <p className="error-message">{error}</p>}
            
            <button type="submit" className="form-submit-btn" disabled={loading}>
                {loading ? 'יוצר...' : 'צור את הבית'}
            </button>
        </form>
    );
}

export default CreateHomeForm;