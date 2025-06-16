// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/App.jsx
import React from 'react';
import { useHome } from './context/HomeContext.jsx'; // <-- ייבוא נכון לפי שם
import LoginScreen from './pages/LoginScreen.jsx';
import MainAppScreen from './pages/MainAppScreen.jsx';
import Modal from './components/Modal.jsx';

function App() {
  // אנחנו משתמשים ב-useHome כדי לקבל את הבית הנוכחי הפעיל
  const { currentHome } = useHome();

  return (
    <div className="container">
      {/* כאן הלוגיקה החכמה:
        - אם יש currentHome, זה אומר שהמשתמש מחובר -> הצג את האפליקציה.
        - אם אין currentHome, זה אומר שצריך להתחבר -> הצג את מסך הלוגין.
      */}
      {currentHome ? <MainAppScreen /> : <LoginScreen />}
      
      {/* רכיב המודאל תמיד נמצא כאן, מוכן להופיע כשנקרא לו.
      */}
      <Modal />
    </div>
  );
}

export default App;