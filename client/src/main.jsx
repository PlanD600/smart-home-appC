import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import { HomeProvider } from './context/HomeContext';
import { ModalProvider } from './context/ModalContext';
import { LanguageProvider } from './context/LanguageContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <HomeProvider>
        <ModalProvider> {/* ModalProvider נמצא כעת בתוך HomeProvider */}
          <App />
        </ModalProvider>
      </HomeProvider>
    </LanguageProvider>
  </React.StrictMode>,
);