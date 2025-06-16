import React, { useContext } from 'react';
// --- תיקון ---
// שינוי הייבוא ל-default import (ללא סוגריים מסולסלים)
import HomeContext from '../context/HomeContext.jsx';
import TaskList from '../features/tasks/TaskList';
import ShoppingList from '../features/shopping/ShoppingList';
import FinanceManagement from '../features/finance/FinanceManagement';
import LoadingSpinner from '../components/LoadingSpinner';

const MainAppScreen = () => {
    const { activeHome, homes, setActiveHome, loading, error } = useContext(HomeContext);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-8">{error}</div>;
    }

    if (!activeHome) {
        return (
            <div className="text-center text-gray-500 mt-8">
                <h2>No active home selected.</h2>
                <p>Please select a home or create a new one.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">{activeHome.name}</h1>
                <p className="text-gray-500">Welcome back!</p>
                {homes.length > 1 && (
                     <select 
                        value={activeHome._id} 
                        onChange={(e) => setActiveHome(homes.find(h => h._id === e.target.value))}
                        className="mt-4 p-2 border rounded"
                    >
                        {homes.map(home => (
                            <option key={home._id} value={home._id}>{home.name}</option>
                        ))}
                    </select>
                )}
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <TaskList home={activeHome} />
                </div>
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <ShoppingList home={activeHome} />
                </div>
                <div className="md:col-span-2 lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                   <FinanceManagement home={activeHome} />
                </div>
            </div>
        </div>
    );
};

export default MainAppScreen;
