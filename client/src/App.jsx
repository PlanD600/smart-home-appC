import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeContext from './context/HomeContext.jsx';
import LoginScreen from './pages/LoginScreen.jsx';
import MainAppScreen from './pages/MainAppScreen.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

function App() {
    const { loading } = useContext(HomeContext);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginScreen />} />
                <Route path="/app" element={<MainAppScreen />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
