// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useHome } from './context/HomeContext.jsx'; // ייבוא נכון של ה-Hook
import LoginScreen from './pages/LoginScreen.jsx';
import MainAppScreen from './pages/MainAppScreen.jsx';
import Modal from './components/Modal.jsx';

/**
 * רכיב עזר שבודק אם המשתמש מחובר.
 * אם כן, הוא מציג את התוכן שעוטפים אותו (את ילדיו).
 * אם לא, הוא מעביר את המשתמש לדף ההתחברות.
 */
function ProtectedRoute({ children }) {
  const { currentHome } = useHome();
  if (!currentHome) {
    // User not authenticated, redirect to login page
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          {/* נתיב דף הבית, מוביל למסך ההתחברות */}
          <Route path="/" element={<LoginScreen />} />

          {/* נתיב האפליקציה, עטוף ברכיב ההגנה */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainAppScreen />
              </ProtectedRoute>
            }
          />

          {/* כל נתיב אחר יחזיר לדף הבית */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* המודאל תמיד נמצא כאן, מוכן לפעולה */}
        <Modal />
      </div>
    </Router>
  );
}

export default App;