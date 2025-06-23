import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A component for managing users within a home (adding/removing).
 * This component is typically displayed inside a modal.
 */
const UserManager = () => {
    const { activeHome, addHomeUser, removeHomeUser, loading, error, setError } = useAppContext();
    // Using the showConfirmModal helper for cleaner confirmation dialogs
    const { showConfirmModal } = useModal();
    const [newUserName, setNewUserName] = useState('');

    const currentUsers = activeHome?.users || [];

    /**
     * Handles the submission for adding a new user.
     */
    const handleAddUser = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        if (!newUserName.trim()) return;

        const success = await addHomeUser(newUserName.trim());
        if (success) {
            setNewUserName(''); // Clear input on success
        }
    };

    /**
     * Confirms and handles the removal of a user.
     */
    const handleRemoveUserClick = (user) => {
        if (currentUsers.length <= 1) {
            setError("לא ניתן להסיר את המשתמש האחרון מהבית.");
            return;
        }
        if (user.isAdmin && activeHome.users.filter(u => u.isAdmin).length === 1) {
            setError("לא ניתן להסיר את המנהל האחרון מהבית.");
            return;
        }

        showConfirmModal(
            `האם אתה בטוח שברצונך להסיר את ${user.name}?`,
            () => removeHomeUser(user.name), // The action to perform on confirm
            'אישור הסרת משתמש'
        );
    };

    return (
        <div className="user-manager-container">
            <h3 className="manager-title">ניהול בני בית</h3>
            
            {/* Section for listing existing users */}
            <div className="users-list-section">
                <h4>בני בית קיימים</h4>
                {loading && !currentUsers.length ? (
                    <LoadingSpinner text="טוען משתמשים..."/>
                ) : currentUsers.length === 0 ? (
                    <p className="no-users-message">אין כרגע בני בית רשומים.</p>
                ) : (
                    <ul className="users-list">
                        {currentUsers.map((user) => (
                            <li key={user._id || user.name} className="user-item">
                                <span className="user-name">
                                    <i className={`fas ${user.isAdmin ? 'fa-user-shield' : 'fa-user'}`}></i>
                                    {user.name}
                                    {user.isAdmin && <span className="admin-tag">(מנהל)</span>}
                                </span>
                                {currentUsers.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveUserClick(user)} 
                                        className="remove-button"
                                        aria-label={`Remove ${user.name}`}
                                        disabled={loading}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <hr className="divider" />

            {/* Section for adding a new user */}
            <form onSubmit={handleAddUser} className="add-user-section">
                <label htmlFor="new-user-name">הוסף בן בית חדש</label>
                <div className="input-group">
                    <input
                        type="text"
                        id="new-user-name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="הקלד שם..."
                        className="user-input"
                        disabled={loading}
                    />
                    <button type="submit" className="add-button" disabled={loading || !newUserName.trim()}>
                        {loading ? <LoadingSpinner size="sm" /> : 'הוסף'}
                    </button>
                </div>
            </form>
            
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default UserManager;
