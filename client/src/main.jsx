import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import { HomeProvider } from './context/HomeContext';
import { ModalProvider } from './context/ModalContext'; // וודא שזה מיובא
import { LanguageProvider } from './context/LanguageContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ModalProvider> {/* ModalProvider עוטף את כל השאר */}
      <LanguageProvider>
        <HomeProvider>
          <App />
        </HomeProvider>
      </LanguageProvider>
    </ModalProvider>
  </React.StrictMode>,
);