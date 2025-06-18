import React, { useState } from 'react';
import { useHome } from '../context/HomeContext';
import { useModal } from '../context/ModalContext';
import CreateHomeForm from '../features/auth/CreateHomeForm';

const LoginScreen = () => {
  // שינוי שם: מ-login ל-initializeHome
  const { homes, initializeHome, error, loading } = useHome(); // הוספתי loading גם, כי LoginScreen יכול להשתמש בו
  const { showModal } = useModal();
  const [accessCodes, setAccessCodes] = useState({});

  const handleAccessCodeChange = (homeId, code) => {
    setAccessCodes(prev => ({ ...prev, [homeId]: code }));
  };

  const handleLogin = async (homeId) => {
    const code = accessCodes[homeId] || '';
    if (!code) {
      alert('נא להזין קוד כניסה.');
      return;
    }
    // קריאה לפונקציה בשמה הנכון
    await initializeHome(homeId, code);
  };
  
  const openCreateHomeModal = () => {
    showModal(<CreateHomeForm />, { title: 'הוסף בית חדש' });
  };

  if (loading) { // הצגת ספינר טעינה אם נתונים עדיין נטענים
    return (
      <div id="login-screen" className="screen active" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <p>טוען בתים...</p> {/* הודעת טעינה בסיסית */}
      </div>
    );
  }

  return (
    <div id="login-screen" className="screen active">
      <h1>בחר בית</h1>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>שגיאה: {error}</p>}
      <div className="home-cards-container">
        {/* וודא ש-homes קיים לפני ביצוע map */}
        {homes && homes.map(home => ( 
          <div key={home._id} className={`home-card ${home.colorClass || 'card-color-1'}`}>
            <div className="icon-placeholder"><i className={home.iconClass}></i></div>
            <h4>{home.name}</h4>
            <input 
              type="password" 
              placeholder="קוד כניסה" 
              className="home-password-input"
              aria-label={`קוד כניסה עבור ${home.name}`}
              value={accessCodes[home._id] || ''}
              onChange={(e) => handleAccessCodeChange(home._id, e.target.value)}
            />
            <button className="login-home-btn" onClick={() => handleLogin(home._id)}>
              <i className="fas fa-arrow-right" aria-hidden="true"></i> כניסה
            </button>
          </div>
        ))}
        {/* Add New Home Card */}
        <div className="home-card add-home-card" role="button" tabIndex="0" onClick={openCreateHomeModal}>
          <i className="fas fa-plus-circle" aria-hidden="true"></i>
          <h4>הוסף בית חדש</h4>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;