import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppContext } from './AppContext';
import * as api from '../services/api';
import { useArchiveActions } from './ArchiveActionsContext'; 

// הגדרת הקונטקסט וה-hook שלו
const ListActionsContext = createContext();
export const useListActions = () => useContext(ListActionsContext);

const listTypeToStateKey = {
    shopping: 'shoppingList',
    tasks: 'tasksList',
};

export const ListActionsProvider = ({ children }) => {
    const { activeHome, currentUser, updateActiveHome, loading, setLoading, setError, setActiveHome } = useAppContext();
    const { archiveItem } = useArchiveActions();

    /**
     * פונקציית עזר מרכזית לטיפול בקריאות API לרשימות.
     * מטפלת בטעינה, שגיאות, עדכונים אופטימיים ועדכון המצב הגלובלי.
     */
    const handleListApiCall = useCallback(async (apiFunction, args, options = {}) => {
        if (!activeHome?._id) return;

        let previousHomeState = activeHome; // לשמירת מצב קודם במקרה של שגיאה בעדכון אופטימי
        
        if (options.optimisticUpdate) {
            const optimisticState = options.optimisticUpdate(activeHome);
            setActiveHome(optimisticState); // עדכון אופטימי מיידי
        } else {
            setLoading(true); // הצגת טעינה אם אין עדכון אופטימי
        }
        
        setError(null); // ניקוי שגיאות קודמות
        
        try {
            const result = await apiFunction(activeHome._id, ...args);
            
            if (options.onSuccess) {
                const finalState = options.onSuccess(activeHome, result);
                updateActiveHome(finalState); // עדכון מצב הבית לאחר הצלחה מותאמת אישית
            } else if (result && result._id) { // [FIXED/IMPROVEMENT] אם ה-API מחזיר את אובייקט הבית המעודכן, נעדכן אותו
                updateActiveHome(result); 
            }
        } catch (err) {
            setError(err.message || 'An action failed.'); // הצגת שגיאה
            if (options.optimisticUpdate) {
                setActiveHome(previousHomeState); // החזרת מצב קודם במקרה של שגיאה בעדכון אופטימי
            }
            throw err; // זריקת השגיאה הלאה
        } finally {
            // [FIXED/IMPROVEMENT] כיבוי טעינה רק אם לא היה עדכון אופטימי, או תמיד אם השלמת הקריאה.
            // עדיף תמיד לכבות ב-finally.
            setLoading(false); 
        }
    }, [activeHome, updateActiveHome, setLoading, setError, setActiveHome]); // תלויות ל-useCallback

    const addItem = useCallback((listType, itemData) => {
        const stateKey = listTypeToStateKey[listType];
        const onSuccess = (currentHome, newItem) => ({
            ...currentHome,
            [stateKey]: [...(currentHome[stateKey] || []), newItem],
        });
        // שימו לב ש-handleListApiCall כבר מטפל ב-return של ה-Promise
        return handleListApiCall(api.addItemToList, [listType, { ...itemData, createdBy: currentUser }], { onSuccess });
    }, [handleListApiCall, currentUser]);
    
    const modifyItem = useCallback((listType, itemId, updates) => {
        const stateKey = listTypeToStateKey[listType];
        const optimisticUpdate = (currentHome) => {
            const updateRecursively = (items) => items.map(item => {
                if (item._id?.toString() === itemId) return { ...item, ...updates };
                if (item.subItems) return { ...item, subItems: updateRecursively(item.subItems) };
                return item;
            });
            const updatedList = updateRecursively(currentHome[stateKey] || []);
            return { ...currentHome, [stateKey]: updatedList };
        };
        // שימו לב ש-handleListApiCall כבר מטפל ב-return של ה-Promise
        return handleListApiCall(api.updateItemInList, [listType, itemId, updates], { optimisticUpdate });
    }, [handleListApiCall]);

    // [MODIFIED] This function is now responsible for ARCHIVING, not deleting.
    const removeItem = useCallback((listType, itemId) => {
        if (archiveItem) {
            archiveItem(listType, itemId); // קורא לפונקציית הארכיון
        } else {
            console.error("archiveItem function is not available from context. Please ensure ArchiveActionsProvider is used.");
        }
    }, [archiveItem]);

    const clearCompletedItems = useCallback((listType) => {
        // [IMPROVEMENT] הוספת עדכון אופטימי גם ל-clearCompletedItems
        return handleListApiCall(api.clearCompletedItems, [listType], {
            optimisticUpdate: (currentHome) => {
                const stateKey = listTypeToStateKey[listType];
                const updatedList = (currentHome[stateKey] || []).filter(item => !item.completed);
                // אופציונלי: אפשר להוסיף את הפריטים שהושלמו לרשימת הארכיון באופן אופטימי כאן אם רוצים לראות אותם שם מיד.
                return { ...currentHome, [stateKey]: updatedList };
            }
        });
    }, [handleListApiCall]);

    // [FIXED] פונקציה למחיקה לצמיתות (הועברה לתוך הקומפוננטה ונוספה לוגיקה אופטימית)
    const deleteItemPermanently = useCallback((listType, itemId) => {
        return handleListApiCall(api.deleteItemPermanently, [listType, itemId], {
            optimisticUpdate: (currentHome) => {
                const stateKey = listTypeToStateKey[listType];
                const removeRecursively = (items) => items.filter(item => {
                    if (item._id?.toString() === itemId) return false;
                    if (item.subItems) {
                        // יצירת עותק חדש של subItems כדי למנוע מוטציה ישירה
                        item.subItems = removeRecursively(item.subItems); 
                    }
                    return true;
                });
                const updatedList = removeRecursively(currentHome[stateKey] || []);
                return { ...currentHome, [stateKey]: updatedList };
            }
        });
    }, [handleListApiCall]);

    // [FIXED] פונקציה למחיקת רשימה שלמה לצמיתות (הועברה לתוך הקומפוננטה ונוספה לוגיקה אופטימית)
    const clearList = useCallback((listType) => {
        return handleListApiCall(api.clearList, [listType], {
            optimisticUpdate: (currentHome) => {
                const stateKey = listTypeToStateKey[listType];
                return { ...currentHome, [stateKey]: [] }; // מרוקן את הרשימה באופן אופטימי
            }
        });
    }, [handleListApiCall]);
    
    // AI Actions (ללא שינוי מהותי)
    const runAiRecipe = useCallback((recipeText) => {
        const onSuccess = (currentHome, response) => ({
            ...currentHome,
            shoppingList: [...currentHome.shoppingList, ...(response.newItems || [])] // ודא ש-response.newItems קיים
        });
        return handleListApiCall(api.transformRecipeToShoppingList, [recipeText], { onSuccess });
    }, [handleListApiCall]);

    const runAiTask = useCallback((taskText) => {
        const onSuccess = (currentHome, response) => ({
            ...currentHome,
            tasksList: [...currentHome.tasksList, ...(response.newItems || [])] // ודא ש-response.newItems קיים
        });
        return handleListApiCall(api.breakdownComplexTask, [taskText], { onSuccess });
    }, [handleListApiCall]);

    const applyTemplate = useCallback(async (template) => {
        if (!activeHome?._id || !template.items) return;
        setLoading(true); // ללא עדכון אופטימי בגלל ריבוי קריאות
        setError(null);
        
        try {
            const addPromises = template.items.map(item => 
                api.addItemToList(activeHome._id, template.type, {
                    ...item,
                    createdBy: currentUser,
                })
            );
            const newItems = await Promise.all(addPromises);
            
            const stateKey = listTypeToStateKey[template.type];
            const updatedHome = {
                ...activeHome,
                [stateKey]: [...(activeHome[stateKey] || []), ...newItems]
            };
            updateActiveHome(updatedHome);

        } catch (err) {
            setError(err.message || "Failed to apply template.");
        } finally {
            setLoading(false);
        }
    }, [activeHome, currentUser, setLoading, setError, updateActiveHome]);


    // useMemo לערך הקונטקסט (ודא שכל הפונקציות נכללות כאן)
    const contextValue = useMemo(() => ({
        loading,
        addItem,
        modifyItem,
        removeItem,
        clearCompletedItems,
        runAiRecipe,
        runAiTask,
        applyTemplate,
        deleteItemPermanently, // נחשפת
        clearList, // נחשפת
    }), [
        loading, 
        addItem, 
        modifyItem, 
        removeItem, 
        clearCompletedItems, 
        runAiRecipe, 
        runAiTask, 
        applyTemplate,
        deleteItemPermanently, // תלות
        clearList // תלות
    ]);

    return (
        <ListActionsContext.Provider value={contextValue}>
            {children}
        </ListActionsContext.Provider>
    );
};