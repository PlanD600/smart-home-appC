import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { HomeProvider } from './context/HomeContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HomeProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </HomeProvider>
  </React.StrictMode>
);