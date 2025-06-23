import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A form component for managing users within a home (adding/removing).
 * Intended to be displayed within a modal.
 */
const HomeManagementForm = () => {
    const { activeHome, addHomeUser, removeHomeUser, loading, error, setError } = useAppContext();
    const { hideModal, showConfirmModal } = useModal();
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
     * Uses the custom confirmation modal.
     */
    const handleRemoveUser = (userName) => {
        if (currentUsers.length <= 1) {
            // This check is important to prevent orphaning a home.
             setError("Cannot remove the last user from the home.");
            return;
        }
        showConfirmModal(
            `האם אתה בטוח שברצונך להסיר את ${userName}?`,
            () => removeHomeUser(userName), // The action to perform on confirm
            'אישור הסרת משתמש'
        );
    };

    return (
        <div className="home-management-form">
            <h3 className="form-title">ניהול בני בית</h3>
            
            {/* Section for adding a new user */}
            <form onSubmit={handleAddUser} className="add-user-section">
                <label htmlFor="new-user-name">הוסף בן בית חדש:</label>
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
                        {loading ? <LoadingSpinner size="sm" /> : <i className="fas fa-plus"></i>}
                    </button>
                </div>
            </form>

            <hr className="divider" />

            {/* Section for listing existing users */}
            <div className="users-list-section">
                <h4>בני בית קיימים:</h4>
                {currentUsers.length === 0 ? (
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
                                        onClick={() => handleRemoveUser(user.name)} 
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
            
            {/* Display errors at the bottom */}
            {error && <p className="error-message">{error}</p>}

            <div className="modal-footer">
                <button type="button" className="secondary-action" onClick={hideModal}>
                    סגור
                </button>
            </div>
        </div>
    );
};

export default HomeManagementForm;
