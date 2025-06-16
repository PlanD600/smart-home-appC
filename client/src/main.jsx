import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { HomeProvider } from './context/HomeContext.jsx' // ייבוא המנהל

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HomeProvider> {/* עטיפת האפליקציה */}
      <App />
    </HomeProvider>
  </React.StrictMode>,
)