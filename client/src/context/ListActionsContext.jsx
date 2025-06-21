// client/src/context/ListActionsContext.jsx

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppContext } from './AppContext';
import * as api from '../services/api';

const ListActionsContext = createContext();
export const useListActions = () => useContext(ListActionsContext);

const listTypeToStateKey = {
    shopping: 'shoppingList',
    tasks: 'tasksList',
};

export const ListActionsProvider = ({ children }) => {
    const { activeHome, setActiveHome, setLoading, setError } = useAppContext();
    const HOME_DATA_STORAGE_KEY = 'smart-home-data';

    const addItem = useCallback(async (listType, itemData) => {
        if (!activeHome?._id) return;
        const stateKey = listTypeToStateKey[listType];
        setLoading(true);

        try {
            const finalItemFromServer = await api.addItemToList(activeHome._id, listType, itemData);
            const updatedHome = {
                ...activeHome,
                [stateKey]: [...(activeHome[stateKey] || []), finalItemFromServer]
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
        } catch (err) {
            setError('Failed to add item');
        } finally {
            setLoading(false);
        }
    }, [activeHome, setActiveHome, setLoading, setError]);

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
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeOptimistic));
        } catch (err) {
            setError('Failed to update item');
            setActiveHome(previousHome);
        }
    }, [activeHome, setActiveHome, setError]);

    const removeItem = useCallback(async (listType, itemId) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const updatedHomeFromServer = await api.deleteItemFromList(activeHome._id, listType, itemId);
            setActiveHome(updatedHomeFromServer);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeFromServer));
        } catch (err) {
            setError('Failed to delete item');
        } finally {
            setLoading(false);
        }
    }, [activeHome, setActiveHome, setLoading, setError]);

    const clearCompletedItems = useCallback(async (listType) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const updatedHomeFromServer = await api.clearCompletedItems(activeHome._id, listType);
            setActiveHome(updatedHomeFromServer);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeFromServer));
        } catch (err) {
            setError('Failed to clear completed items');
        } finally {
            setLoading(false);
        }
    }, [activeHome, setActiveHome, setLoading, setError]);

    // פונקציות AI
    const runAiRecipe = useCallback(async (recipeText) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const response = await api.transformRecipeToShoppingList(activeHome._id, recipeText);
            const updatedHome = { ...activeHome, shoppingList: [...activeHome.shoppingList, ...response.newItems] };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
        } catch (err) {
            setError(err.message || 'AI recipe transformation failed');
        } finally {
            setLoading(false);
        }
    }, [activeHome, setActiveHome, setLoading, setError]);
    
    const runAiTask = useCallback(async (taskText) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const response = await api.breakdownComplexTask(activeHome._id, taskText);
            const updatedHome = { ...activeHome, tasksList: [...activeHome.tasksList, ...response.newItems] };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
        } catch(err) {
            setError(err.message || 'AI task breakdown failed');
        } finally {
            setLoading(false);
        }
    }, [activeHome, setActiveHome, setLoading, setError]);

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