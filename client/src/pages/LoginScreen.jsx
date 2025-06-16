// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/pages/LoginScreen.jsx
import React, { useEffect, useState } from 'react';
import { useHome } from '../context/HomeContext'; // <-- This is the only import needed from HomeContext
import LoadingSpinner from '../components/LoadingSpinner';

function LoginScreen() {
    const { homes, loading, error, fetchHomes, setActiveHomeId } = useHome();
    const [accessCodes, setAccessCodes] = useState({});

    useEffect(() => {
        fetchHomes();
    }, []);

    const handleAccessCodeChange = (id, value) => {
        setAccessCodes(prev => ({ ...prev, [id]: value }));
    };

    const handleLogin = (home) => {
        // In a real app, you'd verify the access code against the backend
        // For now, we'll just set the active home
        console.log(`Logging into ${home.name} with code ${accessCodes[home._id]}`);
        setActiveHomeId(home._id);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div id="login-screen" className="screen active">
            <h1>בחר בית</h1>
            <div className="home-cards-container">
                {homes.map(home => (
                    <div key={home._id} className={`home-card ${home.colorClass}`}>
                        <div className="icon-placeholder"><i className={home.iconClass}></i></div>
                        <h4>{home.name}</h4>
                        <input
                            type="password"
                            placeholder="קוד כניסה"
                            className="home-password-input"
                            value={accessCodes[home._id] || ''}
                            onChange={(e) => handleAccessCodeChange(home._id, e.target.value)}
                        />
                        <button className="login-home-btn" onClick={() => handleLogin(home)}>
                            <i className="fas fa-arrow-right"></i> כניסה
                        </button>
                    </div>
                ))}
                {/* We can add the "Add Home" card logic here later */}
            </div>
        </div>
    );
}

export default LoginScreen;