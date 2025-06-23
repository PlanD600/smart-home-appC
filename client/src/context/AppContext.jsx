import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '@/services/api';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const HOME_DATA_STORAGE_KEY = 'smart-home-data';
const USER_NAME_STORAGE_KEY = 'smart-home-user-name';

export const AppProvider = ({ children }) => {
    const [activeHome, setActiveHome] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('shopping');

    const persistSession = (home, user) => {
        if (home && user) {
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(home));
            localStorage.setItem(USER_NAME_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(HOME_DATA_STORAGE_KEY);
            localStorage.removeItem(USER_NAME_STORAGE_KEY);
        }
    };
    
    const updateActiveHome = useCallback((newHomeState) => {
        setActiveHome(newHomeState);
        persistSession(newHomeState, currentUser);
    }, [currentUser]);

    useEffect(() => {
        const attemptReLogin = async () => {
            setLoading(true);
            const storedHomeData = localStorage.getItem(HOME_DATA_STORAGE_KEY);
            const storedUserData = localStorage.getItem(USER_NAME_STORAGE_KEY);

            if (storedHomeData && storedUserData) {
                try {
                    const parsedHome = JSON.parse(storedHomeData);
                    const parsedUser = JSON.parse(storedUserData);
                    if (!parsedHome?._id || !parsedUser) throw new Error("Invalid stored data.");
                    
                    const freshHomeDetails = await api.getHomeDetails(parsedHome._id);
                    setActiveHome(freshHomeDetails);
                    setCurrentUser(parsedUser);
                } catch (err) {
                    persistSession(null, null);
                    setActiveHome(null);
                    setCurrentUser(null);
                }
            }
            setLoading(false);
        };
        attemptReLogin();
    }, []);

    const initializeHome = useCallback(async (homeName, accessCode, userName) => {
        setLoading(true);
        setError(null);
        try {
            const home = await api.loginToHome(homeName, accessCode);
            setActiveHome(home);
            setCurrentUser(userName);
            persistSession(home, userName);
            return true;
        } catch (err) {
            setError(err.message || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const createHome = useCallback(async (homeData) => {
        setLoading(true);
        setError(null);
        try {
            const newHome = await api.createHome(homeData);
            const adminUser = homeData.initialUserName;
            setActiveHome(newHome);
            setCurrentUser(adminUser);
            persistSession(newHome, adminUser);
            return true;
        } catch (err) {
            setError(err.message || 'Creation failed');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const logoutHome = useCallback(() => {
        setActiveHome(null);
        setCurrentUser(null);
        persistSession(null, null);
    }, []);
    
    const addHomeUser = useCallback(async (userName) => {
        if (!activeHome?._id) return false;
        setLoading(true);
        try {
            const updatedHome = await api.addUser(activeHome._id, userName);
            updateActiveHome(updatedHome);
            return true;
        } catch (err) {
            setError(err.message || 'Failed to add user');
            return false;
        } finally {
            setLoading(false);
        }
    }, [activeHome, updateActiveHome]);

    const removeHomeUser = useCallback(async (userName) => {
        if (!activeHome?._id) return false;
        setLoading(true);
        try {
            const updatedHome = await api.removeUser(activeHome._id, userName);
            updateActiveHome(updatedHome);
            return true;
        } catch (err) {
            setError(err.message || 'Failed to remove user');
            return false;
        } finally {
            setLoading(false);
        }
    }, [activeHome, updateActiveHome]);
    
    const updateHome = useCallback(async (updates) => {
        if (!activeHome?._id) return false;
        setLoading(true);
        try {
            const updatedHomeFromServer = await api.updateHome(activeHome._id, updates);
            updateActiveHome(updatedHomeFromServer);
            return true;
        } catch (err) {
            setError(err.message || 'Failed to update home');
            return false;
        } finally {
            setLoading(false);
        }
    }, [activeHome, updateActiveHome]);


    const changeActiveTab = useCallback((tabName) => {
        setActiveTab(tabName);
    }, []);

    const contextValue = useMemo(() => ({
        activeHome,
        currentUser,
        loading,
        error,
        activeTab,
        setActiveHome,
        setLoading, // [FIXED] Make sure setLoading is exported
        setError,
        updateActiveHome,
        initializeHome,
        createHome,
        logoutHome,
        updateHome,
        addHomeUser,
        removeHomeUser,
        changeActiveTab,
    }), [
        activeHome, currentUser, loading, error, activeTab, 
        updateActiveHome, initializeHome, createHome, logoutHome, updateHome, 
        addHomeUser, removeHomeUser, changeActiveTab,
        // [FIXED] Add missing state setters to dependency array
        setActiveHome, setLoading, setError 
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
