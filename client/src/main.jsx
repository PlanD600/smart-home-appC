// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import { HomeProvider } from './context/HomeContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx'; // 1. ייבוא

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HomeProvider>
      <ModalProvider> {/* 2. עטיפה */}
        <App />
      </ModalProvider>
    </HomeProvider>
  </React.StrictMode>,
)