import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useModal } from "@/context/ModalContext";
import CreateHomeForm from "@/features/auth/CreateHomeForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import "./LoginScreen.css";

const LoginScreen = () => {
    // initializeHome is now expected to receive (homeName, accessCode, userName)
    const { initializeHome, loading, error, setError } = useAppContext();
    const { showModal } = useModal();

    // State for the new direct login form
    const [homeName, setHomeName] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [userName, setUserName] = useState("");

    // Clear any previous errors when the component mounts
    useEffect(() => {
        setError(null);
    }, [setError]);

    /**
     * Handles the form submission for logging in.
     */
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!userName.trim() || !homeName.trim() || !accessCode.trim()) {
            setError("Please fill in all fields: Your Name, Home Name, and Access Code.");
            return;
        }
        
        // The AppContext's initializeHome now takes homeName instead of homeId
        await initializeHome(homeName, accessCode, userName);
    };

    /**
     * Opens the modal for creating a new home.
     */
    const openCreateHomeModal = () => {
        showModal(<CreateHomeForm />, { title: "Create a New Home" });
    };

    return (
        <div className="login-screen min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <header className="login-header text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">ברוכים הבאים לבית החכם</h1>
                <p className="text-xl text-gray-600">התחברו לבית קיים או צרו בית חדש</p>
            </header>
            
            <div className="main-login-card">
                <h2 className="text-2xl font-semibold mb-6">כניסה לבית</h2>
                <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="homeName">שם הבית</label>
                            <input
                                id="homeName"
                                type="text"
                                placeholder="לדוגמה: בית משפחת כהן"
                                className="w-full p-3 border rounded-md"
                                value={homeName}
                                onChange={(e) => setHomeName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                         <div>
                            <label htmlFor="userName">השם שלך</label>
                            <input
                                id="userName"
                                type="text"
                                placeholder="לדוגמה: ישראל"
                                className="w-full p-3 border rounded-md"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="accessCode">קוד גישה</label>
                            <input
                                id="accessCode"
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-3 border rounded-md"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    {error && <p className="error-message mt-4">{error}</p>}
                    
                    <button 
                        type="submit"
                        className="login-button w-full mt-6"
                        disabled={loading}
                    >
                        {loading ? <LoadingSpinner size="sm" /> : "כניסה"}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-600 mb-2">אין לכם בית עדיין?</p>
                <button 
                    onClick={openCreateHomeModal} 
                    className="font-semibold text-blue-600 hover:underline"
                    disabled={loading}
                >
                    צרו בית חדש
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;
