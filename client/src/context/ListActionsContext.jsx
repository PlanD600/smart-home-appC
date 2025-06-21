import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppContext } from './AppContext'; // ✅ שימוש בקונטקסט הראשי
import * as api from '../services/api';

const ListActionsContext = createContext();
export const useListActions = () => useContext(ListActionsContext);

const listTypeToStateKey = {
    shopping: 'shoppingList',
    tasks: 'tasksList',
};

export const ListActionsProvider = ({ children }) => {
    const { activeHome, setActiveHome, setError } = useAppContext();
    const HOME_DATA_STORAGE_KEY = 'smart-home-data'; // ודא שהמפתח זהה לזה שב-AppContext

    // פונקציות לניהול פריטים ברשימות
    const addItem = useCallback(async (listType, itemData) => {
        if (!activeHome?._id) return;
        const stateKey = listTypeToStateKey[listType];
        const tempId = `temp_${Date.now()}`;
        const newItemWithTempId = { ...itemData, _id: tempId };

        const previousHome = activeHome;
        const updatedHomeOptimistic = {
            ...activeHome,
            [stateKey]: [...(activeHome[stateKey] || []), newItemWithTempId]
        };
        setActiveHome(updatedHomeOptimistic);

        try {
            const finalItemFromServer = await api.addItemToList(activeHome._id, listType, itemData);
            const finalHomeState = {
                ...updatedHomeOptimistic,
                [stateKey]: updatedHomeOptimistic[stateKey].map(item =>
                    item._id === tempId ? finalItemFromServer : item
                )
            };
            setActiveHome(finalHomeState);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(finalHomeState));
        } catch (err) {
            setError('Failed to add item');
            setActiveHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);

    const modifyItem = useCallback(async (listType, itemId, updates) => {
        if (!activeHome?._id) return;
        const stateKey = listTypeToStateKey[listType];

        const updateRecursively = (items) => items.map(item => {
            if (item._id?.toString() === itemId) return { ...item, ...updates };
            if (item.subItems) return { ...item, subItems: updateRecursively(item.subItems) };
            return item;
        });

        const previousHome = activeHome;
        const updatedList = updateRecursively(activeHome[stateKey] || []);
        const updatedHomeOptimistic = { ...activeHome, [stateKey]: updatedList };
        setActiveHome(updatedHomeOptimistic);

        try {
            await api.updateItemInList(activeHome._id, listType, itemId, updates);
        } catch (err) {
            setError('Failed to update item');
            setActiveHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);

    const removeItem = useCallback(async (listType, itemId) => {
        if (!activeHome?._id) return;
        // מחיקה דורשת תשובה מהשרת כדי לוודא שכל תתי-הפריטים נמחקו
        try {
            const updatedHomeFromServer = await api.deleteItemFromList(activeHome._id, listType, itemId);
            setActiveHome(updatedHomeFromServer);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeFromServer));
        } catch (err) {
            setError('Failed to delete item');
        }
    }, [activeHome, setActiveHome, setError]);

    const clearCompletedItems = useCallback(async (listType) => {
        if (!activeHome?._id) return;
        try {
            const updatedHomeFromServer = await api.clearCompletedItems(activeHome._id, listType);
            setActiveHome(updatedHomeFromServer);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeFromServer));
        } catch (err) {
            setError('Failed to clear completed items');
        }
    }, [activeHome, setActiveHome, setError]);
    
    // פונקציות AI
    const runAiRecipe = useCallback(async (recipeText) => {
        // ... (לוגיקה דומה, בדרך כלל ממתינים לתשובת השרת)
    }, [activeHome, setActiveHome, setError]);
    
    const runAiTask = useCallback(async (taskText) => {
        // ...
    }, [activeHome, setActiveHome, setError]);


    const contextValue = useMemo(() => ({
        addItem,
        modifyItem,
        removeItem,
        clearCompletedItems,
        runAiRecipe,
        runAiTask
    }), [addItem, modifyItem, removeItem, clearCompletedItems, runAiRecipe, runAiTask]);

    return (
        <ListActionsContext.Provider value={contextValue}>
            {children}
        </ListActionsContext.Provider>
    );
};