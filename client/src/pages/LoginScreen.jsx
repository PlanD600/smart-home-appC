// client/src/pages/LoginScreen.jsx (מתוקן)

import React, { useState, useEffect } from "react"; // ✅ הוספנו את useEffect לייבוא
import { useAppContext } from "@/context/AppContext";
import { useModal } from "@/context/ModalContext";
import CreateHomeForm from "@/features/auth/CreateHomeForm";
import HomeCard from "@/components/HomeCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import "./LoginScreen.css";

const LoginScreen = () => {
  const { homes, initializeHome, loading, error, setError } = useAppContext();
  const { showModal, hideModal } = useModal();
  const [accessCode, setAccessCode] = useState("");
  const [selectedHomeId, setSelectedHomeId] = useState(null);
  const [localError, setLocalError] = useState("");
  const [userName, setUserName] = useState("");

  const handleHomeSelection = (homeId, homeName) => {
    setSelectedHomeId(homeId);
    setError(null); 
    setLocalError("");
    showModal(
      <div className="login-modal-content">
        <h3>כניסה לבית: {homeName}</h3>
        <p>הזן את שם המשתמש שלך ואת קוד הכניסה לבית.</p>
        <input
          type="text"
          placeholder="השם שלך"
          className="input-field"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="password"
          placeholder="קוד כניסה"
          className="input-field"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleLogin} className="primary-button" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : "כניסה"}
        </button>
      </div>
    );
  };

  const handleLogin = async () => {
    if (!userName.trim()) {
        setError("חובה להזין שם משתמש.");
        return;
    }
    const success = await initializeHome(selectedHomeId, accessCode, userName.trim());
    if (success) {
      hideModal();
    }
  };

  const openCreateHomeModal = () => {
    showModal(<CreateHomeForm onSuccess={hideModal} />, { title: "יצירת בית חדש" });
  };
  
  // אם הוספת לוגיקה שמשתמשת ב-useEffect, היא תעבוד עכשיו.
  // לדוגמה:
  // useEffect(() => {
  //   console.log("Login screen mounted");
  // }, []);


  return (
    <div className="login-screen">
      <div className="login-container">
        <header className="login-header">
          <h1>ברוכים השבים!</h1>
          <p>בחרו בית קיים או צרו בית חדש כדי להתחיל</p>
        </header>

        {loading && homes.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <div className="homes-list">
            {homes.map((home) => (
              <HomeCard
                key={home._id}
                homeName={home.name}
                userCount={home.userCount}
                onClick={() => handleHomeSelection(home._id, home.name)}
              />
            ))}
          </div>
        )}
        
        {localError && <p className="error-message">{localError}</p>}

        <div className="login-actions">
          <button onClick={openCreateHomeModal} className="create-home-btn" disabled={loading}>
            <i className="fas fa-plus-circle"></i> צור בית חדש
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;