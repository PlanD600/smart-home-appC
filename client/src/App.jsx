// client/src/App.jsx

import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import LoginScreen from '@/pages/LoginScreen';
import MainAppScreen from '@/pages/MainAppScreen';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import { useModal } from './context/ModalContext';


const AppContent = () => {
  const { activeHome, loading, error, setError } = useAppContext();
  const { setDirection } = useLanguage();
  const { showModal, hideModal } = useModal();

  useEffect(() => {
    setDirection('rtl');
  }, [setDirection]);

  // הצג שגיאות גלובליות במודל
  useEffect(() => {
    if (error) {
        showModal(
            <div>
                <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                <button onClick={() => { setError(null); hideModal(); }} className="btn btn-primary mt-4">
                    הבנתי
                </button>
            </div>,
            { title: 'התרחשה שגיאה' }
        );
    }
  }, [error, showModal, hideModal, setError]);


  if (loading && !activeHome) {
    return <LoadingSpinner fullPage={true} />;
  }

  return !activeHome ? <LoginScreen /> : <MainAppScreen />;
};


const App = () => (
  // העטיפה בקונטקסטים השונים מתבצעת כבר בקובץ main.jsx
  // לכן אין צורך לעטוף כאן שוב.
  // רק נציג את התוכן הראשי.
  <AppContent />
);

export default App;