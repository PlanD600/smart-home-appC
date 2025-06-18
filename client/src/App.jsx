import React, { useEffect } from 'react';
import { useHome } from './context/HomeContext';
import { useModal } from './context/ModalContext';
import { useLanguage } from './context/LanguageContext';
import LoginScreen from './pages/LoginScreen';
import MainAppScreen from './pages/MainAppScreen';
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';

const AppContent = () => {
  const { activeHome, loading, error, /* initializeHome */ } = useHome(); // initializeHome כבר לא נקרא ישירות כאן
  const { isModalOpen, modalContent, modalTitle, hideModal } = useModal();
  const { setDirection } = useLanguage();

  useEffect(() => {
    // הגדרת כיווניות השפה
    setDirection('rtl'); // או דינמית לפי הגדרות שפה בפועל

    // הסרת הקריאה ל-initializeHome מכאן.
    // HomeContext כבר מטפל בטעינה ראשונית של רשימת הבתים
    // או ניסיון התחברות מחדש אם homeId שמור.
    // initializeHome(); // שורה זו הוסרה/הוערה
  }, [setDirection]); // initializeHome הוסר מהתלויות

  if (loading) {
    return <LoadingSpinner />;
  }

  // קובע אם להציג את מסך ההתחברות או את האפליקציה הראשית
  const showLogin = !activeHome;

  return (
    <>
      {showLogin ? <LoginScreen /> : <MainAppScreen />}
      <Modal isOpen={isModalOpen} onClose={hideModal} title={modalTitle}>
        {modalContent}
      </Modal>
    </>
  );
};

const App = () => (
  // LanguageProvider כבר עוטף את App ב-main.jsx
  <AppContent /> 
);

export default App;