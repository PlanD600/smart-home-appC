import React from 'react';
import { useHome } from './context/HomeContext';
import LoginScreen from './pages/LoginScreen';
import MainAppScreen from './pages/MainAppScreen';
import LoadingSpinner from './components/LoadingSpinner';
import './style.css'; // Import the main stylesheet

function App() {
  const { activeHome, isLoading } = useHome();

  if (isLoading && !activeHome) {
    // Show a full-screen loader on initial load or during login
    return <LoadingSpinner fullPage={true} />;
  }

  return (
    <div className="container">
      {activeHome ? <MainAppScreen /> : <LoginScreen />}
    </div>
  );
}

export default App;