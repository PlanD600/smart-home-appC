import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// --- תיקון ---
// שינוי הייבוא ל-default import (ללא סוגריים מסולסלים)
import HomeContext from '../context/HomeContext.jsx';

const LoginScreen = () => {
  const [homeName, setHomeName] = useState('');
  const { addHome, homes, setActiveHome } = useContext(HomeContext);
  const navigate = useNavigate();

  const handleLogin = (home) => {
    setActiveHome(home);
    navigate('/app');
  };

  const handleCreateHome = async (e) => {
    e.preventDefault();
    if (homeName.trim()) {
      await addHome({ name: homeName });
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">Welcome to Smart Home</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Select an Existing Home</h2>
          {homes.length > 0 ? (
            <ul className="space-y-2">
              {homes.map(home => (
                <li key={home._id}>
                  <button 
                    onClick={() => handleLogin(home)}
                    className="w-full text-left p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
                  >
                    {home.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No homes found. Create one below.</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Or Create a New Home</h2>
          <form onSubmit={handleCreateHome}>
            <input
              type="text"
              value={homeName}
              onChange={(e) => setHomeName(e.target.value)}
              placeholder="Enter new home name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              type="submit"
              className="w-full mt-4 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors font-semibold"
            >
              Create Home
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
