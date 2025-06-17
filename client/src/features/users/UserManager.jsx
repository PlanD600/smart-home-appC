import React from 'react';
import { useHome } from '../../context/HomeContext';
import AddUserForm from './forms/AddUserForm';

const UserManager = () => {
  const { activeHome, removeUser } = useHome();

  const handleRemove = (userName) => {
    if (window.confirm(`האם להסיר את "${userName}"? כל הפריטים המשויכים יועברו ל"משותף".`)) {
      removeUser(userName);
    }
  };

  return (
    <div>
      <ul className="manage-list">
        {activeHome.users.map(user => (
          <li key={user}>
            <span><i className="fas fa-user" aria-hidden="true"></i> {user}</span>
            <div className="item-actions">
              {user !== 'אני' && (
                <button className="action-btn delete-user-btn" onClick={() => handleRemove(user)}>
                  <i className="far fa-trash-alt"></i> הסר
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <AddUserForm />
    </div>
  );
};

export default UserManager;