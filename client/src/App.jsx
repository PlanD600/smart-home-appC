// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useHome } from './context/HomeContext.jsx';
import LoginScreen from './pages/LoginScreen.jsx';
import MainAppScreen from './pages/MainAppScreen.jsx';
import Modal from './components/Modal.jsx';

function ProtectedRoute({ children }) {
  const { currentHome } = useHome();
  if (!currentHome) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainAppScreen />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Modal />
      </div>
    </Router>
  );
}
export default App;