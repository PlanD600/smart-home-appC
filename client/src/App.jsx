import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useHome } from './context/HomeContext.jsx';
import { useModal } from './context/ModalContext.jsx';
import LoginScreen from './pages/LoginScreen.jsx';
import MainAppScreen from './pages/MainAppScreen.jsx';
import Modal from './components/Modal.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

/**
 * @file App.jsx
 * @description הקומפוננטה הראשית של האפליקציה.
 * היא אחראית על הניווט (routing) בהתבסס על מצב החיבור (אם נטען "בית"),
 * ועל הצגת רכיבים גלובליים כמו המודל וספינר הטעינה.
 */
function App() {
  // קבלת המצב והפונקציות מה-Context Hooks
  const { currentHome, loading } = useHome();
  const { modalContent, modalTitle, modalButtons, isModalVisible, hideModal } = useModal();

  // בזמן שה-HomeContext בודק את המצב (למשל, טוען נתונים מהשרת או מהאחסון המקומי),
  // הצג ספינר טעינה.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // לאחר סיום הטעינה, הצג את התוכן המתאים
  return (
    <>
      {/* לוגיקת הניווט (Routing) להצגת המסך הנכון */}
      <Routes>
        <Route
          path="/"
          element={
            // אם המשתמש מחובר ל"בית", העבר אותו למסך האפליקציה.
            // אחרת, הצג את מסך ההתחברות.
            currentHome ? <Navigate to="/app" /> : <LoginScreen />
          }
        />
        <Route
          path="/app"
          element={
            // הגן על מסך האפליקציה: רק משתמש מחובר יכול לגשת אליו.
            currentHome ? <MainAppScreen /> : <Navigate to="/" />
          }
        />
        {/* ניתוב ברירת מחדל למקרה שמוזנת כתובת לא תקינה */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* המודל הגלובלי שמוצג מעל כל תוכן אחר באפליקציה */}
      <Modal
        title={modalTitle}
        body={modalContent}
        buttons={modalButtons}
        isVisible={isModalVisible}
        onClose={hideModal}
      />
    </>
  );
}

export default App;
