import React, { useContext } from 'react';
import './style.css';
import { HomeContext } from './context/HomeContext.jsx';
import LoginScreen from './pages/LoginScreen.jsx';
import MainAppScreen from './pages/MainAppScreen.jsx';
import Modal from './components/Modal.jsx'; // ייבוא המודל

function App() {
  const { activeHome, modalConfig, closeModal } = useContext(HomeContext);

  return (
    <div className="container">
      {activeHome ? <MainAppScreen /> : <LoginScreen />}

      {/* הצגת המודל כאשר הוא פתוח */}
      <Modal 
        isOpen={modalConfig.isOpen} 
        onClose={closeModal} 
        title={modalConfig.title}
      >
        {modalConfig.content}
      </Modal>
    </div>
  );
}

export default App;