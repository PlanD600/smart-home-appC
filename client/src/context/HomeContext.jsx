import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api'; // ייבוא כל הפונקציות מ-api.js

const HomeContext = createContext();

export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }) => {
    const [activeHome, setActiveHome] = useState(null); 
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // מצב טעינה ראשוני כ-true
    const [error, setError] = useState(null); // יכול להיות string או object
    const [homes, setHomes] = useState([]); // רשימת כל הבתים הזמינים (למסך הלוגין)
    const [activeTab, setActiveTab] = useState('shopping-list'); // טאב פעיל ב-UI

    // מפתח ל-localStorage
    const HOME_DATA_STORAGE_KEY = 'smart-home-data';
    const USER_DATA_STORAGE_KEY = 'smart-home-user';

    // המרה בין שם קצר (לשימוש קל יותר בקומפוננטות) לשם המלא (כפי שמוגדר במודל וב-API)
    // ה-API מצפה לשם הקצר ("shopping", "tasks") והוא ממיר אותו לצד השרת.
    // אבל ב-Context אנחנו צריכים לדעת איך לעדכן את המצב.
    const listTypeToStateKey = {
        shopping: 'shoppingList', 
        tasks: 'tasksList', // התאמה לשם החדש במודל
    };

    // פונקציה לטעינת כל הבתים הזמינים (למסך הלוגין)
    const fetchHomes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const allHomes = await api.getHomes();
            setHomes(allHomes);
        } catch (err) {
            console.error("Failed to fetch homes:", err);
            setError(err.message || 'Failed to fetch available homes');
        } finally {
            setLoading(false);
        }
    }, []);

    // ניסיון התחברות אוטומטית בהתבסס על HomeId ו-CurrentUser ב-LocalStorage
    useEffect(() => {
        const storedHomeData = localStorage.getItem(HOME_DATA_STORAGE_KEY);
        const storedUserData = localStorage.getItem(USER_DATA_STORAGE_KEY);
        
        const attemptReLogin = async () => {
            if (storedHomeData && storedUserData) {
                try {
                    const parsedHome = JSON.parse(storedHomeData);
                    const parsedUser = JSON.parse(storedUserData);

                    // ניתן לנסות לאמת את הבית מול השרת (אופציונלי אך מומלץ)
                    // לצורך הפשטות, נניח שהנתונים ב-localStorage תקפים ונרענן אותם
                    const homeDetails = await api.getHomeDetails(parsedHome._id);
                    setActiveHome(homeDetails);
                    setCurrentUser(parsedUser);
                    setError(null); // נקה כל שגיאה קודמת
                } catch (err) {
                    console.error("Failed to re-login automatically or parse data:", err);
                    localStorage.removeItem(HOME_DATA_STORAGE_KEY);
                    localStorage.removeItem(USER_DATA_STORAGE_KEY);
                    setActiveHome(null);
                    setCurrentUser(null);
                    setError(err.message || 'Failed to reconnect. Please log in again.');
                    await fetchHomes(); // טען מחדש את רשימת הבתים לאחר כישלון התחברות
                } finally {
                    setLoading(false);
                }
            } else {
                fetchHomes(); // אם אין נתונים שמורים, טען את רשימת הבתים
                setLoading(false); // וסיים טעינה
            }
        };

        attemptReLogin();
    }, [fetchHomes]);

    // פונקציה לכניסה לבית (ממסך הלוגין) - מקבלת כעת גם את שם המשתמש
    const initializeHome = useCallback(async (homeId, accessCode, userName) => {
        setLoading(true);
        setError(null);
        try {
            const home = await api.loginToHome(homeId, accessCode);
            setActiveHome(home);
            setCurrentUser(userName);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(home));
            localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(userName));
            setActiveTab('shopping-list'); // הגדר טאב ברירת מחדל
            return true;
        } catch (err) {
            console.error("Initialization error:", err);
            let userFriendlyMessage = err.response?.data?.message || err.message || 'Failed to connect to home';
            if (userFriendlyMessage.includes('Invalid access code')) {
                userFriendlyMessage = 'קוד גישה שגוי.';
            } else if (userFriendlyMessage.includes('Home not found')) {
                userFriendlyMessage = 'הבית לא נמצא במערכת.';
            }
            setError(userFriendlyMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // פונקציה ליצירת בית חדש
    const createHome = useCallback(async (homeData) => {
        setLoading(true);
        setError(null);
        try {
            const newHome = await api.createHome(homeData);
            setActiveHome(newHome);
            // כאשר יוצרים בית, המשתמש הראשון ברשימת ה-users הוא האדמין והוא המשתמש הנוכחי
            const adminUser = homeData.users && homeData.users.length > 0 ? homeData.users[0].name : 'Admin';
            setCurrentUser(adminUser);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(newHome));
            localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(adminUser));
            await fetchHomes(); // וודא שרשימת הבתים מעודכנת
            setError(null);
            return true;
        } catch (err) {
            console.error("Failed to create home:", err);
            let userFriendlyMessage = err.response?.data?.message || err.message || 'Failed to create home';
            if (userFriendlyMessage.toLowerCase().includes('a home with this name already exists.')) {
                userFriendlyMessage = 'שם בית זה כבר קיים במערכת.';
            } else if (userFriendlyMessage.includes('Name and access code are required')) {
                userFriendlyMessage = 'שם הבית וקוד הגישה נדרשים.';
            } else if (userFriendlyMessage.includes('At least one user is required to create a home.')) {
                userFriendlyMessage = 'נדרש לפחות משתמש אחד ליצירת בית.';
            }
            setError(userFriendlyMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchHomes]); 

    // פונקציה להתנתקות מהבית הנוכחי
    const logoutHome = useCallback(() => {
        setActiveHome(null);
        setCurrentUser(null);
        localStorage.removeItem(HOME_DATA_STORAGE_KEY);
        localStorage.removeItem(USER_DATA_STORAGE_KEY);
        setHomes([]); // איפוס רשימת הבתים (ייתכן ותרצה לטעון אותם מחדש)
        fetchHomes(); // טען את רשימת הבתים למסך הלוגין
        setActiveTab('shopping-list');
    }, [fetchHomes]);

    // פונקציה לרענון נתוני הבית הנוכחי
    const updateHome = useCallback(async () => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const refreshedHome = await api.getHomeDetails(activeHome._id);
            setActiveHome(refreshedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(refreshedHome));
            setError(null);
        } catch (err) {
            console.error("Failed to update home:", err);
            setError(err.response?.data?.message || err.message || 'Failed to update home');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    // פונקציה מתוקנת להוספת פריט (קניות ומשימות)
    const saveItem = useCallback(async (listType, itemData) => { // השם שונה מ-saveItem ל-addItem
        if (!activeHome?._id) return;

        const stateKey = listTypeToStateKey[listType]; // "shoppingList" or "tasksList"
        if (!stateKey) {
            console.error(`Invalid list type: ${listType}`);
            return setError(`Invalid list type: ${listType}`);
        }

        setLoading(true);
        try {
            // קוראים ל-API עם השם המקוצר, כפי שהשרת מצפה לו עכשיו
            const newItemFromServer = await api.addItemToList(activeHome._id, listType, itemData);
            
            // מעדכנים את המצב המקומי עם הפריט המלא שהתקבל מהשרת
            const updatedHome = {
                ...activeHome,
                [stateKey]: [...(activeHome[stateKey] || []), newItemFromServer]
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
        } catch (err) {
            console.error(`Failed to add ${listType} item:`, err);
            setError(err.response?.data?.message || err.message || `Failed to add ${listType} item`);
        } finally {
            setLoading(false);
        }
    }, [activeHome]); // activeHome כתלות כדי לגשת ל-activeHome[stateKey] ו-activeHome._id

    const modifyItem = useCallback(async (listType, itemId, updates) => {
        if (!activeHome?._id) return;
        const stateKey = listTypeToStateKey[listType]; // "shoppingList" or "tasksList"
        if (!stateKey) {
            console.error(`Invalid list type: ${listType}`);
            setError(`Invalid list type: ${listType}`);
            return;
        }

        // פונקציה רקורסיבית למציאה ועדכון של פריט ותתי-פריטים
        const updateRecursively = (items) => {
            return items.map(item => {
                // השווה את ה-ID באופן חזק (toString) במקרה של ObjectIds
                if (item._id && item._id.toString() === itemId) {
                    return { ...item, ...updates };
                }
                if (item.subItems && item.subItems.length > 0) {
                    return { ...item, subItems: updateRecursively(item.subItems) };
                }
                return item;
            });
        };

        // עדכון אופטימי: נעדכן את המצב מיד כדי שה-UI יגיב מהר
        const previousHome = activeHome; // שמירת עותק למקרה של כישלון
        const updatedList = updateRecursively(activeHome[stateKey]); // שימוש ב-stateKey
        const updatedHomeOptimistic = { ...activeHome, [stateKey]: updatedList };
        setActiveHome(updatedHomeOptimistic);
        localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeOptimistic));
        setError(null); // ננקה שגיאות קודמות כי אנחנו מנסים פעולה חדשה

        try {
            // קריאה ל-API לעדכון בפועל - ה-API בקר מצפה ל-listType המקוצר
            await api.updateItemInList(activeHome._id, listType, itemId, updates);
            // אם הצליח, המצב כבר מעודכן אופטימית. אין צורך לעשות שום דבר נוסף.
        } catch (err) {
            console.error(`Failed to update ${listType} item:`, err);
            setError(err.response?.data?.message || err.message || 'Failed to update item');
            setActiveHome(previousHome); // במקרה של כישלון, נחזיר את המצב הקודם
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(previousHome));
        } finally {
            setLoading(false);
        }
    }, [activeHome]); // activeHome כתלות כדי ש-updateRecursively תראה את המצב העדכני

    const removeItem = useCallback(async (listType, itemId) => {
        if (!activeHome?._id) return;
        const stateKey = listTypeToStateKey[listType]; // "shoppingList" or "tasksList"
        if (!stateKey) {
            console.error(`Invalid list type: ${listType}`);
            setError(`Invalid list type: ${listType}`);
            return;
        }
        setLoading(true);
        try {
            // השרת מחזיר את אובייקט הבית המעודכן לאחר המחיקה (כולל מחיקה רקורסיבית)
            // ה-API בקר מצפה ל-listType המקוצר ("shopping" או "tasks")
            const updatedHomeFromServer = await api.deleteItemFromList(activeHome._id, listType, itemId);
            setActiveHome(updatedHomeFromServer); // עדכון הבית כולו מהשרת
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeFromServer));
            setError(null);
        } catch (err) {
            console.error(`Failed to delete ${listType} item:`, err);
            setError(err.response?.data?.message || err.message || `Failed to delete ${listType} item`);
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    // פונקציה למחיקת כל הפריטים שהושלמו (completed: true) מרשימה, כולל תתי-מטלות.
    const clearCompletedItems = useCallback(async (listType) => {
        if (!activeHome?._id) return;
        const stateKey = listTypeToStateKey[listType]; // "shoppingList" or "tasksList"
        if (!stateKey) {
            console.error(`Invalid list type: ${listType}`);
            setError(`Invalid list type: ${listType}`);
            return;
        }
        setLoading(true);
        try {
            // ה-API בקר מצפה ל-listType המקוצר ("shopping" או "tasks")
            const updatedHomeFromServer = await api.clearCompletedItems(activeHome._id, listType);
            setActiveHome(updatedHomeFromServer);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeFromServer));
            setError(null);
        } catch (err) {
            console.error(`Failed to clear completed items from ${listType}:`, err);
            setError(err.response?.data?.message || err.message || `Failed to clear completed items from ${listType}`);
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    // פונקציה למחיקה גורפת של כל הפריטים מרשימה
    const clearAllItemsFromList = useCallback(async (listType) => {
        if (!activeHome?._id) return;
        const stateKey = listTypeToStateKey[listType]; // "shoppingList" or "tasksList"
        if (!stateKey) {
            console.error(`Invalid list type: ${listType}`);
            setError(`Invalid list type: ${listType}`);
            return;
        }
        setLoading(true);
        try {
            // ה-API בקר מצפה ל-listType המקוצר ("shopping" או "tasks")
            const response = await api.clearAllItemsFromList(activeHome._id, listType);
            // השרת מחזיר אובייקט עם message ו-home מעודכן, לכן נשתמש ב-response.home
            setActiveHome(response.home); 
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(response.home));
            setError(null);
        } catch (err) {
            console.error(`Failed to clear all items from ${listType}:`, err);
            setError(err.response?.data?.message || err.message || `Failed to clear all items from ${listType}`);
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);


    // --- פונקציות לניהול כספים ---
    const saveBill = useCallback(async (billData) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const newBill = await api.addExpectedBill(activeHome._id, billData);
            const updatedHome = {
                ...activeHome,
                finances: {
                    ...activeHome.finances,
                    expectedBills: [...(activeHome.finances?.expectedBills || []), newBill]
                }
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
        } catch (err) {
            console.error("Failed to add bill:", err);
            setError(err.response?.data?.message || err.message || 'Failed to add bill');
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    const modifyBill = useCallback(async (billId, billData) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const updatedBill = await api.updateExpectedBill(activeHome._id, billId, billData);
            const updatedHome = {
                ...activeHome,
                finances: {
                    ...activeHome.finances,
                    expectedBills: (activeHome.finances?.expectedBills || []).map(bill =>
                        bill._id === billId ? updatedBill : bill
                    )
                }
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
        } catch (err) {
            console.error("Failed to update bill:", err);
            setError(err.response?.data?.message || err.message || 'Failed to update bill');
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    const deleteBill = useCallback(async (billId) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            await api.deleteExpectedBill(activeHome._id, billId);
            const updatedHome = {
                ...activeHome,
                finances: {
                    ...activeHome.finances,
                    expectedBills: (activeHome.finances?.expectedBills || []).filter(bill => bill._id !== billId)
                }
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
        } catch (err) {
            console.error("Failed to delete bill:", err);
            setError(err.response?.data?.message || err.message || 'Failed to delete bill');
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    const payExistingBill = useCallback(async (billId) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const updatedFinances = await api.payBill(activeHome._id, billId);
            const updatedHome = {
                ...activeHome,
                finances: updatedFinances
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
        } catch (err) {
            console.error("Failed to pay bill:", err);
            setError(err.response?.data?.message || err.message || 'Failed to pay bill');
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    const saveIncome = useCallback(async (incomeData) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const newIncome = await api.addIncome(activeHome._id, incomeData);
            const updatedHome = {
                ...activeHome,
                finances: {
                    ...activeHome.finances,
                    income: [...(activeHome.finances?.income || []), newIncome]
                }
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
        } catch (err) {
            console.error("Failed to add income:", err);
            setError(err.response?.data?.message || err.message || 'Failed to add income');
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    const saveSavingsGoal = useCallback(async (goalData) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const newGoal = await api.addSavingsGoal(activeHome._id, goalData);
            const updatedHome = {
                ...activeHome,
                finances: {
                    ...activeHome.finances,
                    savingsGoals: [...(activeHome.finances?.savingsGoals || []), newGoal]
                }
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
        } catch (err) {
            console.error("Failed to add savings goal:", err);
            setError(err.response?.data?.message || err.message || 'Failed to add savings goal');
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    const addFundsToSavingsGoal = useCallback(async (goalId, amount) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const updatedGoal = await api.addFundsToSavingsGoal(activeHome._id, goalId, amount);
            const updatedHome = {
                ...activeHome,
                finances: {
                    ...activeHome.finances,
                    savingsGoals: (activeHome.finances?.savingsGoals || []).map(goal =>
                        goal._id === goalId ? updatedGoal : goal
                    )
                }
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
        } catch (err) {
            console.error("Failed to add funds to savings goal:", err);
            setError(err.response?.data?.message || err.message || 'Failed to add funds to savings goal');
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    const saveBudgets = useCallback(async (budgetsData) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const updatedCategories = await api.updateBudgets(activeHome._id, budgetsData);
            const updatedHome = {
                ...activeHome,
                finances: {
                    ...activeHome.finances,
                    expenseCategories: updatedCategories
                }
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
        } catch (err) {
            console.error("Failed to save budgets:", err);
            setError(err.response?.data?.message || err.message || 'Failed to save budgets');
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    const fetchUserMonthlyFinanceSummary = useCallback(async (year, month) => {
        if (!activeHome?._id) return null;
        setLoading(true);
        try {
            const summary = await api.getUserMonthlyFinanceSummary(activeHome._id, year, month);
            setError(null);
            return summary;
        } catch (err) {
            console.error("Failed to fetch user monthly finance summary:", err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch user monthly finance summary');
            return null;
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const addHomeUser = useCallback(async (userName) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const response = await api.addUser(activeHome._id, userName);
            const updatedHome = {
                ...activeHome,
                users: response // response אמור להיות מערך המשתמשים החדש
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
            return true;
        } catch (err) {
            console.error("Failed to add user:", err);
            setError(err.response?.data?.message || err.message || 'Failed to add user');
            return false;
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    const removeHomeUser = useCallback(async (userName) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const response = await api.removeUser(activeHome._id, userName);
            const updatedHome = {
                ...activeHome,
                users: response.users // נשתמש במערך ה-users מתוך התגובה
            };
            setActiveHome(updatedHome);
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHome));
            setError(null);
            return true;
        } catch (err) {
            console.error("Failed to remove user:", err);
            setError(err.response?.data?.message || err.message || 'Failed to remove user');
            return false;
        } finally {
            setLoading(false);
        }
    }, [activeHome]);

    const changeActiveTab = useCallback((tabName) => {
        setActiveTab(tabName);
    }, []);

    // --- פונקציות AI (קריאות ל-API ועדכון המצב) ---
    const runAiRecipe = useCallback(async (recipeText) => {
        if (!activeHome?._id) return;
        setLoading(true);
        setError(null);
        try {
            // ה-API אמור להחזיר את הבית המעודכן כולו (למרות שהיה Mock)
            const updatedHomeFromServer = await api.transformRecipeToShoppingList(activeHome._id, recipeText);
            setActiveHome(updatedHomeFromServer); // עדכון הבית כולו מהשרת
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeFromServer));
        } catch (err) {
            console.error("Failed to run AI recipe transform:", err);
            setError(err.response?.data?.message || err.message || 'AI recipe transformation failed');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const runAiTask = useCallback(async (taskText) => {
        if (!activeHome?._id) return;
        setLoading(true);
        setError(null);
        try {
            // ה-API אמור להחזיר את הבית המעודכן כולו עם תתי-המשימות (למרות שהיה Mock)
            const updatedHomeFromServer = await api.breakdownComplexTask(activeHome._id, taskText);
            setActiveHome(updatedHomeFromServer); // עדכון הבית כולו מהשרת
            localStorage.setItem(HOME_DATA_STORAGE_KEY, JSON.stringify(updatedHomeFromServer));
        } catch (err) {
            console.error("Failed to run AI task breakdown:", err);
            setError(err.response?.data?.message || err.message || 'AI task breakdown failed');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    // פונקציית בדיקת בידוד (למטרות פיתוח ובדיקה בלבד)
    const runIsolatedTest = useCallback(async () => {
        console.log("--- Starting Isolated Test ---");
        setLoading(true);
        setError(null);

        const testHomeName = `TestHome_${Date.now()}`;
        const testAccessCode = "test1234";
        const testIcon = "fas fa-tree";
        const testInitialUser = "TesterAdmin";

        const homeData = {
            name: testHomeName,
            accessCode: testAccessCode,
            iconClass: testIcon,
            colorClass: "card-color-1", // צבע ברירת מחדל
            users: [{ name: testInitialUser, isAdmin: true }],
            currency: "ILS",
        };

        try {
            console.log(`Attempting to create home: ${testHomeName}`);
            const createSuccess = await createHome(homeData); 
            
            if (createSuccess) {
                console.log(`Home '${testHomeName}' created successfully via createHome.`);
                const reloadedHomeData = localStorage.getItem(HOME_DATA_STORAGE_KEY);
                if (reloadedHomeData) {
                    const reloadedHome = JSON.parse(reloadedHomeData);
                    console.log(`Successfully connected to newly created home (reloaded from localStorage): ${reloadedHome.name} (ID: ${reloadedHome._id})`);
                } else {
                    console.warn("activeHome or currentUser was not immediately set after createHome success, state update is pending.");
                }
            } else {
                console.error(`Failed to create home '${testHomeName}'. Context Error: ${error}`);
            }
        } catch (testErr) {
            console.error("Error during isolated test:", testErr);
        } finally {
            setLoading(false);
            console.log("--- Isolated Test Finished ---");
        }
    }, [createHome, error]); 

    const contextValue = useMemo(() => ({
        activeHome,
        currentUser, 
        loading,
        error,
        homes,
        activeTab,
        initializeHome,
        logoutHome,
        updateHome,
        addItem, // שם הפונקציה הוא addItem כעת
        modifyItem,
        removeItem,
        clearCompletedItems, 
        clearAllItemsFromList, 
        saveBill,
        modifyBill,
        deleteBill,
        payExistingBill,
        saveIncome,
        saveSavingsGoal,
        addFundsToSavingsGoal,
        saveBudgets,
        fetchUserMonthlyFinanceSummary,
        addHomeUser,
        removeHomeUser,
        createHome,
        changeActiveTab,
        runAiRecipe, 
        runAiTask, 
        runIsolatedTest 
    }), [
        activeHome,
        currentUser, 
        loading,
        error,
        homes,
        activeTab,
        initializeHome,
        logoutHome,
        updateHome,
        addItem, 
        modifyItem,
        removeItem,
        clearCompletedItems,
        clearAllItemsFromList,
        saveBill,
        modifyBill,
        deleteBill,
        payExistingBill,
        saveIncome,
        saveSavingsGoal,
        addFundsToSavingsGoal,
        saveBudgets,
        fetchUserMonthlyFinanceSummary,
        addHomeUser,
        removeHomeUser,
        createHome,
        changeActiveTab,
        runAiRecipe,
        runAiTask,
        runIsolatedTest
    ]);

    return (
        <HomeContext.Provider value={contextValue}>
            {children}
        </HomeContext.Provider>
    );
};
