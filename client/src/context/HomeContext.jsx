// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/context/HomeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    apiGetHomes,
    apiGetHomeById,
    apiUpdateHome,
    // You can import more specific functions as needed
} from '../services/api';

const HomeContext = createContext();

export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }) => {
    const [homes, setHomes] = useState([]);
    const [currentHome, setCurrentHome] = useState(null);
    const [activeHomeId, setActiveHomeId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all homes for login screen
    const fetchHomes = async () => {
        try {
            setLoading(true);
            const { data } = await apiGetHomes();
            setHomes(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch homes');
        } finally {
            setLoading(false);
        }
    };

    // Fetch details of the selected home
    useEffect(() => {
        const fetchCurrentHome = async () => {
            if (activeHomeId) {
                try {
                    setLoading(true);
                    const { data } = await apiGetHomeById(activeHomeId);
                    setCurrentHome(data);
                    setError(null);
                } catch (err) {
                    setError(err.response?.data?.message || `Failed to fetch home ${activeHomeId}`);
                    setCurrentHome(null); // Clear home on error
                } finally {
                    setLoading(false);
                }
            } else {
                setCurrentHome(null); // Clear home if no ID is active
            }
        };
        fetchCurrentHome();
    }, [activeHomeId]);

    // Generic function to update any part of the current home
    // This is our main workhorse for all updates
    const updateCurrentHome = async (updatedData) => {
        if (!currentHome) return;

        try {
            setLoading(true);
            // The API expects the entire updated home object or a subset of fields
            // We create a deep copy and merge changes
            const payload = { ...currentHome, ...updatedData };
            
            const { data: updatedHome } = await apiUpdateHome(currentHome._id, payload);
            
            // Update state with the response from the server
            setCurrentHome(updatedHome);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update home');
            // Optional: Re-fetch to revert optimistic update on failure
            // fetchCurrentHome(activeHomeId);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        homes,
        currentHome,
        loading,
        error,
        fetchHomes,
        setActiveHomeId, // To be called on login
        updateCurrentHome, // The new generic update function
    };

    return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};