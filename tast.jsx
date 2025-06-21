// client/src/context/HomeContext.jsx - CORRECTED

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';

const HomeContext = createContext();

export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }) => {
    const [activeHome, setActiveHome] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [homes, setHomes] = useState([]);
    const [activeTab, setActiveTab] = useState('shopping-list');
    
    // --- הוספת מפה לתרגום שמות הרשימות ---
    // המפה הזו מבטיחה שנשתמש בשם הנכון בכל מקום
    const listTypeMap = {
        shopping: { clientKey: 'shopping', serverKey: 'shoppingList' },
        tasks: { clientKey: 'tasks', serverKey: 'tasks' } // כפי שמוגדר בשרת שלך
    };
    // ------------------------------------------

    const fetchHomes = useCallback(async () => { /* ... ללא שינוי ... */ });
    
    useEffect(() => { /* ... ללא שינוי ... */ }, [fetchHomes]);

    const initializeHome = useCallback(async (homeId, accessCode) => { /* ... ללא שינוי ... */ });
    const createHome = useCallback(async (homeData) => { /* ... ללא שינוי ... */ });
    const logoutHome = useCallback(() => { /* ... ללא שינוי ... */ });
    const updateHome = useCallback(async () => { /* ... ללא שינוי ... */ });

    // --- פונקציית saveItem מתוקנת ---
    const saveItem = useCallback(async (clientListType, itemData) => {
        if (!activeHome?._id) return;

        // תרגום שם הרשימה מהקליינט לשם שהשרת מצפה לו
        const serverListKey = listTypeMap[clientListType]?.serverKey;

        if (!serverListKey) {
            const errorMessage = `Invalid list type provided to saveItem: ${clientListType}`;
            console.error(errorMessage);
            setError(errorMessage);
            return;
        }

        setLoading(true);
        try {
            // קריאה ל-API עם שם הרשימה הנכון שהשרת מבין
            const newItem = await api.addItemToList(activeHome._id, serverListKey, itemData);
            
            // עדכון המצב המקומי בצורה בטוחה עם הפריט שהתקבל מהשרת
            setActiveHome(prev => ({
                ...prev,
                [serverListKey]: [...(prev[serverListKey] || []), newItem]
            }));
            setError(null);
        } catch (err) {
            console.error(`Failed to add ${clientListType} item:`, err);
            setError(err.message || `Failed to add ${clientListType} item`);
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    // ... כאן יבואו שאר פונקציות הקונטקסט שלך ...
    const modifyItem = useCallback(async (listType, itemId, itemData) => { /* ... */ });
    const removeItem = useCallback(async (listType, itemId) => { /* ... */ });
    const changeActiveTab = useCallback((tabName) => { setActiveTab(tabName); }, []);


    const contextValue = useMemo(() => ({
        activeHome,
        loading,
        error,
        homes,
        activeTab,
        initializeHome,
        logoutHome,
        updateHome,
        saveItem, // <-- הפונקציה המתוקנת
        modifyItem,
        removeItem,
        createHome,
        changeActiveTab,
    }), [
        activeHome, loading, error, homes, activeTab, initializeHome, logoutHome,
        updateHome, saveItem, modifyItem, removeItem, createHome, changeActiveTab
    ]);

    return (
        <HomeContext.Provider value={contextValue}>
            {children}
        </HomeContext.Provider>
    );
};