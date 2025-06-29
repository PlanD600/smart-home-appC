import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/00-globals.css';
import './styles/01-layout.css';
import './styles/02-login.css';
import './styles/03-lists.css';
import './styles/04-finance.css';


// Importing all context providers
import { LanguageProvider } from '@/context/LanguageContext';
import { ModalProvider } from '@/context/ModalContext';
import { AppProvider } from '@/context/AppContext';
import { ListActionsProvider } from '@/context/ListActionsContext';
import { FinanceActionsProvider } from '@/context/FinanceActionsContext';
import { ArchiveActionsProvider } from '@/context/ArchiveActionsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      {/* AppProvider is the base and must wrap everything that needs its state. */}
      <AppProvider>
        {/* All action providers depend on AppProvider */}
        <ArchiveActionsProvider>
          <ListActionsProvider>
            <FinanceActionsProvider>
              {/* ModalProvider should be inside the data providers so its content can access them. */}
              <ModalProvider>
                <App />
              </ModalProvider>
            </FinanceActionsProvider>
          </ListActionsProvider>
        </ArchiveActionsProvider>
      </AppProvider>
    </LanguageProvider>
  </React.StrictMode>
);
