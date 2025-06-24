import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppContext } from './AppContext';
import * as api from '../services/api';
import { Gemini } from '../services/gemini'; // <-- ייבוא השירות של Gemini
import { useArchiveActions } from './ArchiveActionsContext'; 

const ListActionsContext = createContext();
export const useListActions = () => useContext(ListActionsContext);

const listTypeToStateKey = {
    shopping: 'shoppingList',
    tasks: 'tasksList',
};

export const ListActionsProvider = ({ children }) => {
    const { activeHome, currentUser, updateActiveHome, loading, setLoading, setError } = useAppContext();
    const { archiveItem } = useArchiveActions();

    /**
     * פונקציית עזר מרכזית, עכשיו היא תמיד מעדכנת את ה-state מהתשובה של השרת
     */
    const handleListApiCall = useCallback(async (apiFunction, args) => {
        if (!activeHome?._id) return;

        setLoading(true);
        setError(null);
        
        try {
            // ה-API תמיד יחזיר את אובייקט הבית המעודכן במלואו
            const updatedHome = await apiFunction(activeHome._id, ...args);
            
            // נעדכן את ה-state רק אם השרת החזיר אובייקט בית תקין
            if (updatedHome && updatedHome._id) {
                updateActiveHome(updatedHome);
            }
        } catch (err) {
            setError(err.message || 'An action failed.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [activeHome, updateActiveHome, setLoading, setError]);

    const addItem = useCallback((listType, itemData) => {
        // --- תיקון: קוראים ישירות ל-handleListApiCall, ללא onSuccess ---
        return handleListApiCall(
            api.addItemToList, 
            [listType, { ...itemData, createdBy: currentUser }]
        );
    }, [handleListApiCall, currentUser]);
    
    const modifyItem = useCallback((listType, itemId, updates) => {
        // --- תיקון: קוראים ישירות ל-handleListApiCall, ללא optimisticUpdate ---
        // העדכון יתבצע כשהשרת יחזיר תשובה, מה שמבטיח שהמידע תמיד נכון.
        return handleListApiCall(
            api.updateItemInList, 
            [listType, itemId, updates]
        );
    }, [handleListApiCall]);

    const removeItem = useCallback((listType, itemId) => {
        if (archiveItem) {
            archiveItem(listType, itemId);
        } else {
            console.error("archiveItem function is not available from context.");
        }
    }, [archiveItem]);

    const clearCompletedItems = useCallback((listType) => {
        return handleListApiCall(api.clearCompletedItems, [listType]);
    }, [handleListApiCall]);

    const deleteItemPermanently = useCallback((listType, itemId) => {
        return handleListApiCall(api.deleteItemPermanently, [listType, itemId]);
    }, [handleListApiCall]);

    const clearList = useCallback((listType) => {
        return handleListApiCall(api.clearList, [listType]);
    }, [handleListApiCall]);
    
    // --- AI and Template functions remain largely the same, but simplified ---

  const runAiRecipe = useCallback(async (recipeText) => {
        setLoading(true);
        setError(null);
        
        const prompt = `
            You are an expert chef's assistant. Your task is to generate a shopping list of ingredients based on a user's request in Hebrew.
            - If the user provides a dish name, generate a typical list of ingredients for that dish.
            - If the user provides a full recipe, extract only the ingredients from it.
            - The output must be a simple list of Hebrew strings.

            Example for the model:
            User request: "עוגת גבינה פירורים"
            Your generated list of ingredients: ["250 גרם ביסקוויטים פתי בר", "100 גרם חמאה מומסת", "750 גרם גבינה לבנה 5%", "1 מיכל שמנת חמוצה", "1 כוס סוכר", "4 ביצים", "1 כפית תמצית וניל", "גרידת לימון מחצי לימון"]
            
            Now, fulfill this user request: "${recipeText}"
        `;

        // --- הסכמה הנכונה עם אותיות קטנות ---
        const responseSchema = {
            type: "object",
            properties: {
                ingredients: {
                    type: "array",
                    items: { type: "string" }
                }
            }
        };

        try {
            const structuredData = await Gemini.generateStructuredText(prompt, responseSchema);
            
            if (structuredData && structuredData.ingredients && structuredData.ingredients.length > 0) {
                let lastUpdatedHome = activeHome;
                for (const ingredient of structuredData.ingredients) {
                    const newItemData = { text: ingredient, createdBy: currentUser, category: 'ממתכון AI' };
                    lastUpdatedHome = await api.addItemToList(activeHome._id, 'shopping', newItemData);
                }
                updateActiveHome(lastUpdatedHome);
            } else {
                setError("לא הצלחתי להפיק רשימת מצרכים מהטקסט שהוזן. נסה לפרט יותר.");
            }
        } catch (err) {
            setError(err.message || "שגיאה בתקשורת עם שירות ה-AI.");
            console.error("[AI] Error:", err);
        } finally {
            setLoading(false);
        }
    }, [activeHome, currentUser, updateActiveHome, setLoading, setError]);
    
    const runAiTask = useCallback((taskText) => {
        return handleListApiCall(api.breakdownComplexTask, [taskText]);
    }, [handleListApiCall]);

    const applyTemplate = useCallback(async (template) => {
        if (!activeHome?._id || !template.items) return;
        setLoading(true);
        setError(null);
        
        try {
            const addPromises = template.items.map(item => 
                api.addItemToList(activeHome._id, template.type, {
                    ...item,
                    createdBy: currentUser,
                })
            );
            const results = await Promise.all(addPromises);
            // נעדכן את ה-state עם התוצאה האחרונה שחזרה מהשרת, שהיא הבית המעודכן ביותר
            if (results.length > 0) {
                updateActiveHome(results[results.length - 1]);
            }
        } catch (err) {
            setError(err.message || "Failed to apply template.");
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id, currentUser, updateActiveHome, setLoading, setError]);

    const contextValue = useMemo(() => ({
        loading,
        addItem,
        modifyItem,
        removeItem,
        clearCompletedItems,
        runAiRecipe,
        runAiTask,
        applyTemplate,
        deleteItemPermanently,
        clearList,
    }), [
        loading, addItem, modifyItem, removeItem, clearCompletedItems, 
        runAiRecipe, runAiTask, applyTemplate, deleteItemPermanently, clearList
    ]);

    return (
        <ListActionsContext.Provider value={contextValue}>
            {children}
        </ListActionsContext.Provider>
    );
};