import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';

const HomeManagementForm = () => {
  const { activeHome, addHomeUser, removeHomeUser, loading } = useHome();
  const { hideModal } = useModal();
  const [newUserName, setNewUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currentUsers = activeHome?.users || [];

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (newUserName.trim() === '') {
      setErrorMessage('שם משתמש לא יכול להיות ריק.');
      return;
    }
    setErrorMessage('');
    const success = await addHomeUser(newUserName);
    if (success) {
      setNewUserName(''); // Clear input on success
    } else {
      // Error message is already set by HomeContext if API call fails
      setErrorMessage('שגיאה בהוספת משתמש. ייתכן שהשם כבר קיים.');
    }
  };

  const handleRemoveUser = async (userName) => {
    if (window.confirm(`האם אתה בטוח שברצונך להסיר את המשתמש ${userName}? פעולה זו תשייך את כל הפריטים המשויכים אליו ל'משותף'.`)) {
      setErrorMessage('');
      const success = await removeHomeUser(userName);
      if (!success) {
        setErrorMessage('שגיאה בהסרת משתמש.');
      }
    }
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const userListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    maxHeight: '200px', // Example height for scrolling if many users
    overflowY: 'auto',
    border: '1px solid var(--border-grey)',
    borderRadius: '4px',
    backgroundColor: 'var(--light-grey)',
  };

  const userItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    borderBottom: '1px solid #eee',
  };

  const removeBtnStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--coral-red)',
    cursor: 'pointer',
    fontSize: '1.2em',
  };

  const inputStyle = {
    width: 'calc(100% - 22px)', // Adjusted width considering padding
    padding: '10px',
    border: '1px solid var(--border-grey)',
    borderRadius: '4px',
  };

  return (
    <form onSubmit={handleAddUser} style={formStyle}>
      <h4>ניהול בני בית</h4>
      {errorMessage && <p style={{ color: 'var(--coral-red)', textAlign: 'center' }}>{errorMessage}</p>}

      <div>
        <label htmlFor="new-user-name">הוסף בן בית חדש:</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            id="new-user-name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="שם משתמש"
            style={{ flexGrow: 1, ...inputStyle }}
            disabled={loading} // Disable input while loading
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
        <ul style={userListStyle}>
          {currentUsers.map((user, index) => (
            <li key={index} style={userItemStyle}>
              <span>{user}</span>
              {user !== 'אני' && user !== 'משותף' && ( // Prevent deleting 'אני' and 'משותף'
                <button 
                  type="button" 
                  onClick={() => handleRemoveUser(user)} 
                  style={removeBtnStyle}
                  disabled={loading} // Disable button while loading
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