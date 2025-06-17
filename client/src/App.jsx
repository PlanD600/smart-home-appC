import React, { useState, useEffect } from 'react';
import { useHome } from './context/HomeContext.jsx'; // ייבוא תקין עם סיומת מפורשת
import { useModal } from './context/ModalContext.jsx'; // ייבוא תקין עם סיומת מפורשת
import LoginScreen from './pages/LoginScreen.jsx'; // ייבוא תקין עם סיומת מפורשת
import MainAppScreen from './pages/MainAppScreen.jsx'; // ייבוא תקין עם סיומת מפורשת
import Modal from './components/Modal.jsx'; // ייבוא תקין עם סיומת מפורשת
import LoadingSpinner from './components/LoadingSpinner.jsx'; // ייבוא תקין עם סיומת מפורשת

/**
 * @file App component
 * @description The main application component, handling global state, routing between login/main app,
 * and rendering the modal and loading spinner.
 */
function App() {
  // Destructure values and functions from HomeContext
  const { currentHome, loading, initFirebase, userId } = useHome();
  // Destructure values and functions from ModalContext
  const { modalContent, modalTitle, modalButtons, isModalVisible, hideModal } = useModal();
  // State to track if Firebase authentication is ready
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Effect hook to initialize Firebase and set up the authentication listener.
  // This runs once when the component mounts.
  useEffect(() => {
    const initialize = async () => {
      // Call initFirebase to set up Firebase app and authenticate the user.
      // This function (from HomeContext) should handle signInWithCustomToken or signInAnonymously.
      await initFirebase();
      setIsAuthReady(true); // Mark authentication as ready after initialization
    };
    initialize();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Display a loading spinner if the application is still loading data or authentication is not ready.
  if (loading || !isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Conditionally render LoginScreen if no current home is selected, otherwise render MainAppScreen */}
      {!currentHome ? (
        <LoginScreen />
      ) : (
        <MainAppScreen />
      )}

      {/* Render the global Modal component */}
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
