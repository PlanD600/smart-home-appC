// client/src/context/AppContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '@/services/api';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [activeHome, setActiveHome] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [homes, setHomes] = useState([]);
    const [activeTab, setActiveTab] = useState('shopping-list'); // הוספת ניהול הטאב הפעיל

    const HOME_DATA_STORAGE_KEY = 'smart-home-data';
    const USER_DATA_STORAGE_KEY = 'smart-home-user';

    const fetchHomes = useCallback(async () => {
        setLoading(true);
        try {
            const allHomes = await api.getHomes();
            setHomes(allHomes);
        } catch (err) {
            setError('Failed to fetch homes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const attemptReLogin = async () => {
            const storedHomeData = localStorage.getItem(HOME_DATA_STORAGE_KEY);
            const storedUserData = localStorage.getItem(USER_DATA_STORAGE_KEY);
            if (storedHomeData && storedUserData && storedHomeData !== 'undefined') {
                try {
                    const parsedHome = JSON.parse(storedHomeData);
                    const parsedUser = JSON.parse(storedUserData);
                    if (!parsedHome || !parsedUser) throw new Error("Invalid stored data.");
                    
                    const homeDetails = await api.getHomeDetails(parsedHome._id);
                    setActiveHome(homeDetails);
                    setCurrentUser(parsedUser);
                } catch (err) {
                    localStorage.clear();
                    setActiveHome(null);
                    setCurrentUser(null);
                    fetchHomes(); // אם הכניסה האוטומטית נכשלת, טען את רשימת הבתים
                } finally {
                    setLoading(false);
                }
            } else {
                fetchHomes();
                setLoading(false);
            }
        };
        attemptReLogin();
    }, [fetchHomes]);

    const initializeHome = useCallback(async (homeId, accessCode, userName) => {
        setLoading(true);
        try {
            const home = await api.loginToHome(homeId, accessCode);
            setActiveHome(home);
            setCurrentUser(userName);
            if (home) localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(home));
            if (userName) localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(userName));
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const createHome = useCallback(async (homeData) => {
        setLoading(true);
        try {
            const newHome = await api.createHome(homeData);
            const adminUser = homeData.users[0]?.name || 'Admin';
            setActiveHome(newHome);
            setCurrentUser(adminUser);
            if (newHome) localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(newHome));
            if (adminUser) localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(adminUser));
            await fetchHomes();
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Creation failed';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchHomes]);
    
   const updateHome = useCallback(async (updates) => {
    if (!activeHome?._id) return;
    const previousHome = activeHome;
    const updatedHomeOptimistic = { ...activeHome, ...updates };
    setActiveHome(updatedHomeOptimistic);
    
    try {
        // כאן צריך להיות API call מתאים לעדכון כללי של הבית אם יש,
        // כרגע נניח שזה בעיקר לתבניות
        if (updates.templates) {
            const updatedHomeFromServer = await api.saveTemplates(activeHome._id, updates.templates);
            setActiveHome(updatedHomeFromServer);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeFromServer));
        }
    } catch(err) {
        setError(err.message || 'Failed to update home');
        setActiveHome(previousHome);
    }
}, [activeHome, setActiveHome, setError]);

    const logoutHome = useCallback(() => {
        setActiveHome(null);
        setCurrentUser(null);
        localStorage.removeItem(HOME_DATA_STORAGE_KEY);
        localStorage.removeItem(USER_DATA_STORAGE_KEY);
        fetchHomes();
    }, [fetchHomes]);

    const addHomeUser = useCallback(async (userName) => {
        if (!activeHome?._id) return false;
        setLoading(true);
        try {
            const updatedUsers = await api.addUser(activeHome._id, userName);
            const updatedHome = { ...activeHome, users: updatedUsers };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add user');
            return false;
        } finally {
            setLoading(false);
        }
    }, [activeHome, setActiveHome, setError]);

    const removeHomeUser = useCallback(async (userName) => {
        if (!activeHome?._id) return false;
        setLoading(true);
        try {
            const response = await api.removeUser(activeHome._id, userName);
            const updatedHome = { ...activeHome, users: response.users };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove user');
            return false;
        } finally {
            setLoading(false);
        }
    }, [activeHome, setActiveHome, setError]);

    const changeActiveTab = useCallback((tabName) => {
        setActiveTab(tabName);
    }, []);

    const contextValue = useMemo(() => ({
        activeHome,
        currentUser,
        loading,
        error,
        homes,
        activeTab, // הוספה
        setActiveHome,
        setError,
        setLoading,
        initializeHome,
        createHome,
        logoutHome,
        updateHome, // הוספה
        addHomeUser, // הוספה
        removeHomeUser, // הוספה
        fetchHomes,
        changeActiveTab, // הוספה
    }), [activeHome, currentUser, loading, error, homes, activeTab, initializeHome, createHome, logoutHome, updateHome, fetchHomes, changeActiveTab, addHomeUser, removeHomeUser]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};