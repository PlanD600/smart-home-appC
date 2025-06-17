import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { HomeProvider } from './context/HomeContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      עוטפים את כל האפליקציה ב-BrowserRouter.
      זה מספק את ה"הקשר" (context) שכל רכיבי הניווט צריכים כדי לעבוד.
    */}
    <BrowserRouter>
      <HomeProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </HomeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
