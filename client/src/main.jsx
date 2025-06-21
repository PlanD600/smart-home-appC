import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// ✅ שימוש בנתיבים החדשים עם @
import { LanguageProvider } from '@/context/LanguageContext';
import { ModalProvider } from '@/context/ModalContext';
import { AppProvider } from '@/context/AppContext';
import { ListActionsProvider } from '@/context/ListActionsContext';
import { FinanceActionsProvider } from '@/context/FinanceActionsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <ModalProvider>
        <AppProvider>
          <ListActionsProvider>
            <FinanceActionsProvider>
              <App />
            </FinanceActionsProvider>
          </ListActionsProvider>
        </AppProvider>
      </ModalProvider>
    </LanguageProvider>
  </React.StrictMode>
);