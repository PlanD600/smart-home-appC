import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppContext } from './AppContext';
import * as api from '../services/api';
import { useArchiveActions } from './ArchiveActionsContext'; 

const ListActionsContext = createContext();
export const useListActions = () => useContext(ListActionsContext);

export const ListActionsProvider = ({ children }) => {
    const { activeHome, currentUser, updateActiveHome, loading, setLoading, setError } = useAppContext();
    const { archiveItem } = useArchiveActions();

    const handleApiCall = useCallback(async (apiFunction, args) => {
        if (!activeHome?._id) return;
        setLoading(true);
        setError(null);
        try {
            const updatedHome = await apiFunction(activeHome._id, ...args);
            if (updatedHome && updatedHome._id) { updateActiveHome(updatedHome); }
        } catch (err) {
            setError(err.message || 'An action failed.');
            throw err;
        } finally { setLoading(false); }
    }, [activeHome, updateActiveHome, setLoading, setError]);

    const addItem = useCallback((listType, itemData) => handleApiCall(api.addItemToList, [listType, { ...itemData, createdBy: currentUser }]), [handleApiCall, currentUser]);
    const modifyItem = useCallback((listType, itemId, updates) => handleApiCall(api.updateItemInList, [listType, itemId, updates]), [handleApiCall]);
    const removeItem = useCallback((listType, itemId) => archiveItem(listType, itemId), [archiveItem]);
    const clearCompletedItems = useCallback((listType) => handleApiCall(api.clearCompletedItems, [listType]), [handleApiCall]);
    const deleteItemPermanently = useCallback((listType, itemId) => handleApiCall(api.deleteItemPermanently, [listType, itemId]), [handleApiCall]);
    const clearList = useCallback((listType) => handleApiCall(api.clearList, [listType]), [handleApiCall]);
    const groupItems = useCallback((listType, draggedItemId, targetItemId, newFolderName) => handleApiCall(api.groupItems, [listType, draggedItemId, targetItemId, newFolderName]), [handleApiCall]);
    const unGroupFolder = useCallback((listType, folderId) => handleApiCall(api.unGroupFolder, [listType, folderId]), [handleApiCall]);
    const runAiRecipe = useCallback(async (recipeText) => handleApiCall(api.transformRecipeToShoppingList, [recipeText, currentUser]), [handleApiCall, currentUser]);
    const runAiTask = useCallback((taskText) => handleApiCall(api.breakdownComplexTask, [taskText, currentUser]), [handleApiCall, currentUser]);
    const applyTemplate = useCallback(async (template) => {
        if (!activeHome?._id || !template.items) return;
        setLoading(true); setError(null);
        try {
            let lastUpdatedHome = activeHome;
            for (const item of template.items) {
                lastUpdatedHome = await api.addItemToList(activeHome._id, template.type, { ...item, createdBy: currentUser });
            }
            updateActiveHome(lastUpdatedHome);
        } catch (err) {
            setError(err.message || "Failed to apply template.");
        } finally { setLoading(false); }
    }, [activeHome, currentUser, updateActiveHome, setLoading, setError]);

    const contextValue = useMemo(() => ({
        loading, addItem, modifyItem, removeItem, clearCompletedItems, runAiRecipe,
        runAiTask, applyTemplate, deleteItemPermanently, clearList, groupItems, unGroupFolder,
    }), [ loading, addItem, modifyItem, removeItem, clearCompletedItems, runAiRecipe, runAiTask, applyTemplate, deleteItemPermanently, clearList, groupItems, unGroupFolder ]);

    return <ListActionsContext.Provider value={contextValue}>{children}</ListActionsContext.Provider>;
};
