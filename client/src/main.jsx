import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import { ModalProvider } from './context/ModalContext.jsx';
import { HomeProvider } from './context/HomeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx'; // ודא שאתה מייבא את LanguageProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* סדר העטיפה קריטי: ModalProvider חייב לעטוף את HomeProvider מכיוון ש-HomeProvider משתמש ב-useModal */}
    {/* LanguageProvider יכול להיות כאן או לעטוף את AppContent בתוך App.jsx - נמקם אותו כאן לבהירות */}
    <ModalProvider>
      <HomeProvider>
        <LanguageProvider> 
          <App />
        </LanguageProvider>
      </HomeProvider>
    </ModalProvider>
  </React.StrictMode>,
);