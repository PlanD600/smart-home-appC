import React, { createContext, useState } from 'react';
import {
    loginHome as loginApi,
    addItem as addItemApi,
    updateItem as updateItemApi,
    deleteItem as deleteItemApi,
    archiveItem as archiveItemApi,
    restoreItem as restoreItemApi,
    deleteArchivedItem as deleteArchivedItemApi,
    addCategory as addCategoryApi,
    generateListFromAI as generateListFromAIApi,
    // הפונקציות של תתי-פריטים יטופלו ישירות ברכיב ה-Item, אין צורך לייבא אותן לכאן
} from '../services/api';

export const HomeContext = createContext();

export const HomeProvider = ({ children }) => {
    const [activeHome, setActiveHome] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null });

    // --- Actions ---

    const login = async (homeId, accessCode) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loginApi(homeId, accessCode);
            setActiveHome(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'קוד הגישה שגוי או שגיאת שרת.';
            setError(errorMessage);
            console.error("Login failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setActiveHome(null);
    };

    const updateHomeState = (updatedHome) => {
        setActiveHome(updatedHome);
    };

    const addItemToHome = async (itemType, itemData) => {
        if (!activeHome) return;
        try {
            const response = await addItemApi(activeHome._id, itemType, itemData);
            const newItemFromServer = response.data;

            // עדכון המצב בצורה בטוחה (Immutable)
            setActiveHome(prevHome => {
                // יוצרים עותק עמוק כדי למנוע שינוי ישיר של המצב
                const newHome = JSON.parse(JSON.stringify(prevHome));
                
                if (itemType.includes('.')) {
                    const [mainProp, subProp] = itemType.split('.');
                    newHome[mainProp][subProp].push(newItemFromServer);
                } else {
                    newHome[itemType].push(newItemFromServer);
                }
                return newHome;
            });
        } catch (err) {
            console.error(`Failed to add item to ${itemType}:`, err);
        }
    };

    const updateItemInHome = async (itemType, itemId, updates) => {
        if (!activeHome) return;
        try {
            const response = await updateItemApi(activeHome._id, itemType, itemId, updates);
            const updatedItem = response.data;
            setActiveHome(prevHome => {
                const newHome = JSON.parse(JSON.stringify(prevHome));
                const list = itemType.includes('.') ? newHome[itemType.split('.')[0]][itemType.split('.')[1]] : newHome[itemType];
                const itemIndex = list.findIndex(item => item._id === itemId);
                if (itemIndex > -1) {
                    list[itemIndex] = updatedItem;
                }
                return newHome;
            });
        } catch (err) {
            console.error(`Failed to update item in ${itemType}:`, err);
        }
    };

    const deleteItemFromHome = async (itemType, itemId) => {
        if (!activeHome) return;
        try {
            await deleteItemApi(activeHome._id, itemType, itemId);
            setActiveHome(prevHome => {
                const newHome = JSON.parse(JSON.stringify(prevHome));
                if (itemType.includes('.')) {
                    const [mainProp, subProp] = itemType.split('.');
                    newHome[mainProp][subProp] = newHome[mainProp][subProp].filter(item => item._id !== itemId);
                } else {
                    newHome[itemType] = newHome[itemType].filter(item => item._id !== itemId);
                }
                return newHome;
            });
        } catch (err) {
            console.error(`Failed to delete item from ${itemType}:`, err);
        }
    };
    
    // הפונקציות הבאות (ארכיון, קטגוריות, AI) משתמשות באותה תבנית...

    const addCategoryToHome = async (itemType, categoryName) => {
        if (!activeHome) return;
        try {
            const response = await addCategoryApi(activeHome._id, itemType, categoryName);
            const updatedCategories = response.data;
            setActiveHome(prev => {
                const categoryListKey = `${itemType}Categories`;
                return { ...prev, [categoryListKey]: updatedCategories };
            });
        } catch (err) {
            console.error("Failed to add category:", err);
        }
    };

    const generateAIList = async (type, text) => {
        setLoading(true);
        try {
            const response = await generateListFromAIApi({ text, type });
            const newItems = response.data;
            const targetList = type === 'shopping' ? 'shoppingItems' : 'taskItems';

            // עדכון המצב עם כל הפריטים החדשים מה-AI
            setActiveHome(prevHome => ({
                ...prevHome,
                [targetList]: [...prevHome[targetList], ...newItems]
            }));

        } catch (err) {
            console.error("AI generation failed:", err);
            setError("שגיאה ביצירת רשימה מה-AI.");
        } finally {
            setLoading(false);
        }
    };


    const openModal = (title, content) => setModalConfig({ isOpen: true, title, content });
    const closeModal = () => setModalConfig({ isOpen: false, title: '', content: null });

    const contextValue = {
        activeHome, loading, error, modalConfig,
        login, logout, openModal, closeModal,
        addItemToHome, updateItemInHome, deleteItemFromHome,
        addCategoryToHome, generateAIList, updateHomeState
        // פונקציות ארכיון ותבניות יתווספו באופן דומה
    };

    return (
        <HomeContext.Provider value={contextValue}>
            {children}
        </HomeContext.Provider>
    );
};