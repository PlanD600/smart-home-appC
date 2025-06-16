import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
    fetchHomes as apiFetchHomes, 
    addHome as apiAddHome, 
    updateHome as apiUpdateHome, 
    deleteHome as apiDeleteHome,
    addTask as apiAddTask,
    updateTask as apiUpdateTask,
    addShoppingItem as apiAddShoppingItem,
    updateShoppingItem as apiUpdateShoppingItem,
    updateFinance as apiUpdateFinance,
    addSubItem as apiAddSubItem,
    updateSubItem as apiUpdateSubItem,
    deleteSubItem as apiDeleteSubItem
} from '../services/api';

const HomeContext = createContext();

export const HomeProvider = ({ children }) => {
    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeHome, setActiveHome] = useState(null);

    const loadHomes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiFetchHomes();
            setHomes(data);
            if (data.length > 0 && !activeHome) {
                const lastActiveHomeId = localStorage.getItem('lastActiveHome');
                const homeToActivate = data.find(h => h._id === lastActiveHomeId) || data[0];
                setActiveHome(homeToActivate);
            }
        } catch (err) {
            setError('Failed to fetch homes from server.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    useEffect(() => {
        loadHomes();
    }, [loadHomes]);

    const handleSetActiveHome = (home) => {
        setActiveHome(home);
        localStorage.setItem('lastActiveHome', home._id);
    };

    const updateAndSetActiveHome = (updatedHome) => {
        setHomes(prevHomes => prevHomes.map(h => (h._id === updatedHome._id ? updatedHome : h)));
        if (activeHome?._id === updatedHome._id) {
            handleSetActiveHome(updatedHome);
        }
    };

    const addHome = async (homeData) => {
        try {
            const newHome = await apiAddHome(homeData);
            setHomes(prevHomes => [...prevHomes, newHome]);
            handleSetActiveHome(newHome);
        } catch (err) {
            setError('Failed to add home.');
            console.error(err);
        }
    };

    const updateHome = async (id, homeData) => {
        try {
            const updatedHome = await apiUpdateHome(id, homeData);
            updateAndSetActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to update home.');
            console.error(err);
        }
    };
    
    const deleteHome = async (id) => {
        try {
            await apiDeleteHome(id);
            const remainingHomes = homes.filter(h => h._id !== id);
            setHomes(remainingHomes);
            if (activeHome?._id === id) {
                const newActiveHome = remainingHomes.length > 0 ? remainingHomes[0] : null;
                if (newActiveHome) {
                    handleSetActiveHome(newActiveHome);
                } else {
                    setActiveHome(null);
                    localStorage.removeItem('lastActiveHome');
                }
            }
        } catch (err) {
            setError('Failed to delete home.');
            console.error(err);
        }
    };

    const addTask = async (homeId, taskData) => {
        try {
            const updatedHome = await apiAddTask(homeId, taskData);
            updateAndSetActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to add task.');
            console.error(err);
        }
    };

    const updateTask = async (homeId, taskId, taskData) => {
        try {
            const updatedHome = await apiUpdateTask(homeId, taskId, taskData);
            updateAndSetActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to update task.');
            console.error(err);
        }
    };

    const addShoppingItem = async (homeId, itemData) => {
        try {
            const updatedHome = await apiAddShoppingItem(homeId, itemData);
            updateAndSetActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to add shopping item.');
            console.error(err);
        }
    };

     const updateShoppingItem = async (homeId, itemId, itemData) => {
        try {
            const updatedHome = await apiUpdateShoppingItem(homeId, itemId, itemData);
            updateAndSetActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to update shopping item.');
            console.error(err);
        }
    };

    const updateFinance = async (homeId, financeData) => {
        try {
            const updatedHome = await apiUpdateFinance(homeId, financeData);
            updateAndSetActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to update finance data.');
            console.error(err);
        }
    };

    const addSubItem = async (homeId, itemId, subItemData) => {
        try {
            const updatedHome = await apiAddSubItem(homeId, itemId, subItemData);
            updateAndSetActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to add sub-item.');
            console.error(err);
        }
    };

    const updateSubItem = async (homeId, itemId, subItemId, subItemData) => {
        try {
            const updatedHome = await apiUpdateSubItem(homeId, itemId, subItemId, subItemData);
            updateAndSetActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to update sub-item.');
            console.error(err);
        }
    };

    const deleteSubItem = async (homeId, itemId, subItemId) => {
        try {
            const updatedHome = await apiDeleteSubItem(homeId, itemId, subItemId);
            updateAndSetActiveHome(updatedHome);
        } catch (err) {
            setError('Failed to delete sub-item.');
            console.error(err);
        }
    };

    return (
        <HomeContext.Provider value={{ 
            homes, 
            loading, 
            error, 
            activeHome, 
            setActiveHome: handleSetActiveHome,
            addHome, 
            updateHome,
            deleteHome,
            addTask,
            updateTask,
            addShoppingItem,
            updateShoppingItem,
            updateFinance,
            addSubItem,
            updateSubItem,
            deleteSubItem,
            loadHomes
        }}>
            {children}
        </HomeContext.Provider>
    );
};

export default HomeContext;
