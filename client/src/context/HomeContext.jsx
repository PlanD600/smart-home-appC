// client/src/context/HomeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    apiGetHomeById,
    apiAddTask, apiUpdateTask, apiDeleteTask,
    apiAddShoppingItem, apiUpdateShoppingItem, apiDeleteShoppingItem,
    apiUpdateFinances
} from '../services/api';

const HomeContext = createContext();
export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }) => {
    const [currentHome, setCurrentHome] = useState(null);
    const [activeHomeId, setActiveHomeId] = useState(() => localStorage.getItem('activeHomeId'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurrentHome = async () => {
            if (activeHomeId) {
                setLoading(true);
                try {
                    const { data } = await apiGetHomeById(activeHomeId);
                    setCurrentHome(data);
                } catch (err) {
                    setError(err.response?.data?.message);
                    setCurrentHome(null);
                    localStorage.removeItem('activeHomeId');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchCurrentHome();
    }, [activeHomeId]);

    const loginUser = (homeData) => {
        setCurrentHome(homeData);
        setActiveHomeId(homeData._id);
        localStorage.setItem('activeHomeId', homeData._id);
    };

    const logoutUser = () => {
        setCurrentHome(null);
        setActiveHomeId(null);
        localStorage.removeItem('activeHomeId');
    };

    const updateHomeOptimistically = (updateFunction) => {
        const previousHome = currentHome;
        setCurrentHome(updateFunction);
        return previousHome;
    };

    const addTask = async (taskData) => {
        const optimisticState = (prev) => ({ ...prev, taskItems: [...prev.taskItems, { ...taskData, _id: `temp-${Date.now()}` }] });
        const previousHome = updateHomeOptimistically(optimisticState);
        try {
            await apiAddTask(activeHomeId, taskData);
            const { data } = await apiGetHomeById(activeHomeId); // Re-sync
            setCurrentHome(data);
        } catch (err) { setError(err.response?.data?.message); setCurrentHome(previousHome); }
    };

    const updateTask = async (taskId, updates) => {
        const optimisticState = (prev) => ({ ...prev, taskItems: prev.taskItems.map(t => t._id === taskId ? { ...t, ...updates } : t) });
        const previousHome = updateHomeOptimistically(optimisticState);
        try {
            await apiUpdateTask(activeHomeId, taskId, updates);
        } catch (err) { setError(err.response?.data?.message); setCurrentHome(previousHome); }
    };

    const deleteTask = async (taskId) => {
        const optimisticState = (prev) => ({ ...prev, taskItems: prev.taskItems.filter(t => t._id !== taskId) });
        const previousHome = updateHomeOptimistically(optimisticState);
        try {
            await apiDeleteTask(activeHomeId, taskId);
        } catch (err) { setError(err.response?.data?.message); setCurrentHome(previousHome); }
    };

    const addShoppingItem = async (itemData) => {
        const optimisticState = (prev) => ({ ...prev, shoppingItems: [...prev.shoppingItems, { ...itemData, _id: `temp-${Date.now()}` }] });
        const previousHome = updateHomeOptimistically(optimisticState);
        try {
            await apiAddShoppingItem(activeHomeId, itemData);
            const { data } = await apiGetHomeById(activeHomeId); // Re-sync
            setCurrentHome(data);
        } catch (err) { setError(err.response?.data?.message); setCurrentHome(previousHome); }
    };

    const updateShoppingItem = async (itemId, updates) => {
        const optimisticState = (prev) => ({ ...prev, shoppingItems: prev.shoppingItems.map(i => i._id === itemId ? { ...i, ...updates } : i) });
        const previousHome = updateHomeOptimistically(optimisticState);
        try {
            await apiUpdateShoppingItem(activeHomeId, itemId, updates);
        } catch (err) { setError(err.response?.data?.message); setCurrentHome(previousHome); }
    };

    const deleteShoppingItem = async (itemId) => {
        const optimisticState = (prev) => ({ ...prev, shoppingItems: prev.shoppingItems.filter(i => i._id !== itemId) });
        const previousHome = updateHomeOptimistically(optimisticState);
        try {
            await apiDeleteShoppingItem(activeHomeId, itemId);
        } catch (err) { setError(err.response?.data?.message); setCurrentHome(previousHome); }
    };
    
    const archiveItem = async (itemType, itemId) => {
        const updates = { isArchived: true };
        const optimisticState = (prev) => {
            const listKey = itemType === 'task' ? 'taskItems' : 'shoppingItems';
            return { ...prev, [listKey]: prev[listKey].filter(i => i._id !== itemId) };
        };
        const previousHome = updateHomeOptimistically(optimisticState);
        try {
            if (itemType === 'task') {
                await apiUpdateTask(activeHomeId, itemId, updates);
            } else {
                await apiUpdateShoppingItem(activeHomeId, itemId, updates);
            }
        } catch (err) { setError(err.response?.data?.message); setCurrentHome(previousHome); }
    };
    
    const value = {
        currentHome, loading, error, loginUser, logoutUser,
        addTask, updateTask, deleteTask,
        addShoppingItem, updateShoppingItem, deleteShoppingItem,
        archiveItem
    };

    return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};