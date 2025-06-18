import React, { useEffect } from 'react';
import { useHome } from './context/HomeContext';
import { useLanguage } from './context/LanguageContext';
import LoginScreen from './pages/LoginScreen';
import MainAppScreen from './pages/MainAppScreen';
import LoadingSpinner from './components/LoadingSpinner';

const AppContent = () => {
  const { activeHome, loading } = useHome();
  const { setDirection } = useLanguage();

  useEffect(() => {
    // This defines the language direction for the app
    setDirection('rtl');
  }, [setDirection]);

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  // Determines whether to show the login screen or the main app
  const showLogin = !activeHome;

  return (
    <>
      {showLogin ? <LoginScreen /> : <MainAppScreen />}
      {/* The Modal component is no longer rendered here. 
        It's now handled centrally by the ModalProvider, which is the correct approach.
      */}
    </>
  );
};

const App = () => (
  <AppContent />
);

export default App;