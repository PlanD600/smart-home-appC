import React, { useState, useEffect, useContext } from 'react';
import { getHomes } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { HomeContext } from '../context/HomeContext.jsx'; // ייבוא ה-Context

function LoginScreen() {
  const { login, error: loginError, loading: isLoggingIn } = useContext(HomeContext); // שימוש ב-Context

  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [passwords, setPasswords] = useState({}); // אובייקט שינהל את כל הסיסמאות

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        setLoading(true);
        const response = await getHomes();
        setHomes(response.data);
        setFetchError(null);
      } catch (err) {
        setFetchError('Failed to fetch homes from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchHomes();
  }, []);

  const handlePasswordChange = (homeId, value) => {
    setPasswords(prev => ({ ...prev, [homeId]: value }));
  };

  const handleLogin = (homeId) => {
    const password = passwords[homeId] || '';
    console.log(`ניסיון התחברות לבית עם ID: ${homeId} וסיסמה: ${password}`);
    login(homeId, password); // קורא לפונקציה מה-Context
  };

  if (loading) return <LoadingSpinner />;
  if (fetchError) return <div>שגיאה: {fetchError}</div>;

  return (
    <div id="login-screen" className="screen active">
      <h1>בחר בית</h1>
      {loginError && <p style={{ color: 'red', textAlign: 'center' }}>{loginError}</p>}
      <div className="home-cards-container">
        {homes.map(home => (
          <div key={home._id} className={`home-card ${home.colorClass}`}>
            <div className="icon-placeholder"><i className={home.iconClass}></i></div>
            <h4>{home.name}</h4>
            <input
              type="password"
              placeholder="קוד כניסה"
              className="home-password-input"
              value={passwords[home._id] || ''}
              onChange={(e) => handlePasswordChange(home._id, e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin(home._id)}
            />
            <button className="login-home-btn" onClick={() => handleLogin(home._id)} disabled={isLoggingIn}>
              {isLoggingIn ? 'מתחבר...' : 'כניסה'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoginScreen;