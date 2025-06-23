import React, { useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import { useLanguage } from './context/LanguageContext';
import LoginScreen from './pages/LoginScreen';
import MainAppScreen from './pages/MainAppScreen';
import LoadingSpinner from './components/LoadingSpinner';

/**
 * A simple wrapper component to conditionally render content.
 * This prevents re-rendering the entire App when context changes.
 */
const AppContent = () => {
  const { activeHome, loading } = useAppContext();
  
  // The main loading state for the initial app load or login attempt
  if (loading && !activeHome) {
    return <LoadingSpinner fullPage text="טוען אפליקציה..." />;
  }

  // If there's an active home, show the main app screen, otherwise show the login screen.
  return activeHome ? <MainAppScreen /> : <LoginScreen />;
};

function App() {
  const { direction } = useLanguage();

  // [FIXED] The useEffect that was calling setDirection has been removed,
  // as this logic is now handled automatically within LanguageContext.
  useEffect(() => {
    // This effect now correctly handles the document's direction based on the context.
    document.body.dir = direction;
  }, [direction]);

  return <AppContent />;
}

export default App;
