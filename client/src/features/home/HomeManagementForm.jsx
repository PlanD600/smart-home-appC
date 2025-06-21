// client/src/features/home/HomeManagementForm.jsx

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';

const HomeManagementForm = () => {
  const { activeHome, addHomeUser, removeHomeUser, loading, error } = useAppContext();
  const { hideModal } = useModal();
  const [newUserName, setNewUserName] = useState('');

  const currentUsers = activeHome?.users || [];

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const success = await addHomeUser(newUserName);
    if (success) {
      setNewUserName('');
    }
  };

  const handleRemoveUser = async (userName) => {
    if (currentUsers.length <= 1) {
        alert("לא ניתן להסיר את המשתמש האחרון.");
        return;
    }
    if (window.confirm(`האם אתה בטוח שברצונך להסיר את המשתמש ${userName}?`)) {
      await removeHomeUser(userName);
    }
  };

  // ... (הסגנונות נשארים כפי שהם)

  return (
    <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h4>ניהול בני בית</h4>
      {error && <p style={{ color: 'var(--coral-red)', textAlign: 'center' }}>{error}</p>}

      <div>
        <label htmlFor="new-user-name">הוסף בן בית חדש:</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            id="new-user-name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="שם משתמש"
            style={{ flexGrow: 1, /*...inputStyle*/ }}
            disabled={loading}
          />
          <button type="submit" className="primary-action" disabled={loading}>
            <i className="fas fa-plus-circle"></i> הוסף
          </button>
        </div>
      </div>

      <hr />

      <h4>בני בית קיימים:</h4>
      {currentUsers.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>אין בני בית מוגדרים.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {currentUsers.map((user) => (
            <li key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <span>{user.name} {user.isAdmin ? '(מנהל)' : ''}</span>
              {currentUsers.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveUser(user.name)} 
                  style={{ background: 'none', border: 'none', color: 'var(--coral-red)', cursor: 'pointer' }}
                  disabled={loading}
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="modal-footer">
        <button type="button" className="secondary-action" onClick={hideModal}>
          סגור
        </button>
      </div>
    </form>
  );
};

export default HomeManagementForm;