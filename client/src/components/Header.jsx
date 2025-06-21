import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import UserManager from '@/features/users/UserManager';

const Header = () => {
  const { activeHome, logoutHome, currentUser } = useAppContext();
  const { showModal } = useModal();

  const openUserManager = () => {
    showModal(<UserManager />, { title: 'ניהול בני בית' });
  };

  if (!activeHome) return null;

  return (
    <header className="app-header">
      <div className="header-left-part">
        <div className="header-buttons left">
          <button 
            id="manage-users-btn-header" 
            className="header-style-button" 
            onClick={openUserManager}
          >
            <i className="fas fa-users-cog"></i> 
            <span>נהל בית</span>
          </button>
        </div>
        <h2 id="current-home-name-header">{activeHome.name}</h2>
      </div>
      
      <div className="header-buttons right">
        <span className="current-user">שלום, {currentUser}</span>
        <button 
          id="logout-btn-header" 
          className="logout-btn" 
          onClick={logoutHome}
        >
          <i className="fas fa-sign-out-alt"></i> החלף בית
        </button>
      </div>
    </header>
  );
};

export default Header;
