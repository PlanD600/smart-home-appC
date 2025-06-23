import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppContext } from './AppContext';
import * as api from '../services/api';

const ArchiveActionsContext = createContext();

export const useArchiveActions = () => useContext(ArchiveActionsContext);

export const ArchiveActionsProvider = ({ children }) => {
    // Depend on AppContext for the core state and setters
    const { activeHome, updateActiveHome, loading, setLoading, setError } = useAppContext();

    /**
     * A generic wrapper for archive-related API calls to handle loading, errors, and state updates.
     */
    const handleArchiveApiCall = useCallback(async (apiFunction, args, optimisticUpdateFn) => {
        if (!activeHome?._id) return;

        let previousHomeState = activeHome;
        
        if (optimisticUpdateFn) {
            const optimisticState = optimisticUpdateFn(activeHome);
            updateActiveHome(optimisticState); // Apply optimistic update
        }

        setLoading(true);
        setError(null);
        
        try {
            const result = await apiFunction(activeHome._id, ...args);
            
            // If the API returns the full, updated home object, use it directly.
            if (result && result._id) {
                updateActiveHome(result);
            }
            
        } catch (err) {
            setError(err.message || 'An archive action failed.');
            // On error, rollback to the previous state if an optimistic update was made
            if (optimisticUpdateFn) {
                updateActiveHome(previousHomeState);
            }
        } finally {
            setLoading(false);
        }
    }, [activeHome, updateActiveHome, setLoading, setError]);

    const archiveItem = useCallback((listType, itemId) => {
        return handleArchiveApiCall(api.archiveItem, [listType, itemId]);
    }, [handleArchiveApiCall]);

    const restoreItem = useCallback((itemId) => {
        return handleArchiveApiCall(api.restoreItem, [itemId]);
    }, [handleArchiveApiCall]);

    const deleteArchivedItem = useCallback((itemId) => {
        const optimisticUpdate = (currentHome) => ({
            ...currentHome,
            archivedItems: currentHome.archivedItems.filter(item => item._id !== itemId),
        });
        return handleArchiveApiCall(api.deleteArchivedItem, [itemId], optimisticUpdate);
    }, [handleArchiveApiCall]);
    
    const clearArchive = useCallback(() => {
        return handleArchiveApiCall(api.clearArchive, []);
    }, [handleArchiveApiCall]);


    const contextValue = useMemo(() => ({
        loading, // <-- [FIXED] Pass the loading state through the context
        archiveItem,
        restoreItem,
        deleteArchivedItem,
        clearArchive,
    }), [loading, archiveItem, restoreItem, deleteArchivedItem, clearArchive]);

    return (
        <ArchiveActionsContext.Provider value={contextValue}>
            {children}
        </ArchiveActionsContext.Provider>
    );
};
