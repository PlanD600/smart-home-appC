import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [activeHome, setActiveHome] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [homes, setHomes] = useState([]);

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
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        attemptReLogin();
    }, []);

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
            setError(err.response?.data?.message || 'Login failed');
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
            setError(err.response?.data?.message || 'Creation failed');
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchHomes]);

    const logoutHome = useCallback(() => {
        setActiveHome(null);
        setCurrentUser(null);
        localStorage.removeItem(HOME_DATA_STORAGE_KEY);
        localStorage.removeItem(USER_DATA_STORAGE_KEY);
        fetchHomes();
    }, [fetchHomes]);

    const contextValue = useMemo(() => ({
        activeHome,
        currentUser,
        loading,
        error,
        homes,
        setActiveHome, // חשוב לחשוף את ה-setter
        setError,      // חשוב לחשוף את ה-setter
        setLoading,    // חשוב לחשוף את ה-setter
        initializeHome,
        createHome,
        logoutHome,
        fetchHomes
    }), [activeHome, currentUser, loading, error, homes, initializeHome, createHome, logoutHome, fetchHomes]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};