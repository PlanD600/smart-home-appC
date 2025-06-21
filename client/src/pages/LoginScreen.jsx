import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useModal } from "@/context/ModalContext";
import CreateHomeForm from "@/features/auth/CreateHomeForm";
import HomeCard from "@/components/HomeCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import "./LoginScreen.css";

const LoginScreen = () => {
  const { homes, initializeHome, loading, error, setError } = useAppContext();
  const { showModal, hideModal } = useModal();
  const [accessCode, setAccessCode] = useState("");
  const [selectedHomeId, setSelectedHomeId] = useState(null);
  const [userName, setUserName] = useState("");

  // ✅ Clear errors when component mounts
  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleHomeSelection = (home) => {
    setSelectedHomeId(home._id);
    setError(null);
    setAccessCode("");
    setUserName("");
    
    showModal(
      <div className="login-modal-content p-4">
        <h3 className="text-xl font-bold mb-4">כניסה לבית: {home.name}</h3>
        <p className="mb-4">הזן את שם המשתמש שלך ואת קוד הכניסה לבית.</p>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="השם שלך"
            className="w-full p-3 border rounded-md"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="קוד כניסה"
            className="w-full p-3 border rounded-md"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        
        {error && <p className="text-red-500 mt-2">{error}</p>}
        
        <div className="flex gap-2 mt-6">
          <button 
            onClick={handleLogin} 
            className="flex-1 bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={loading || !userName.trim() || !accessCode.trim()}
          >
            {loading ? <LoadingSpinner size="sm" /> : "כניסה"}
          </button>
          <button 
            onClick={hideModal}
            className="px-4 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            ביטול
          </button>
        </div>
      </div>,
      { title: "כניסה לבית" }
    );
  };

  const handleLogin = async () => {
    if (!userName.trim()) {
      setError("חובה להזין שם משתמש.");
      return;
    }
    
    if (!accessCode.trim()) {
      setError("חובה להזין קוד גישה.");
      return;
    }

    const success = await initializeHome(selectedHomeId, accessCode, userName.trim());
    if (success) {
      hideModal();
    }
  };

  const openCreateHomeModal = () => {
    showModal(<CreateHomeForm onSuccess={hideModal} />, { title: "יצירת בית חדש" });
  };

  return (
    <div className="login-screen min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="login-container max-w-4xl w-full">
        <header className="login-header text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">ברוכים השבים!</h1>
          <p className="text-xl text-gray-600">בחרו בית קיים או צרו בית חדש כדי להתחיל</p>
        </header>

        {loading && homes.length === 0 ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="homes-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {homes.map((home) => (
              <HomeCard
                key={home._id}
                home={home}
                onClick={handleHomeSelection}
                className="cursor-pointer transform hover:scale-105 transition-transform"
              />
            ))}
          </div>
        )}

        <div className="login-actions text-center">
          <button 
            onClick={openCreateHomeModal} 
            className="bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <i className="fas fa-plus-circle mr-2"></i> צור בית חדש
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
