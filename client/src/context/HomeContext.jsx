import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';

const HomeContext = createContext();

export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }) => {
    const [activeHome, setActiveHome] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [homes, setHomes] = useState([]); // רשימת כל הבתים הזמינים
    const [activeTab, setActiveTab] = useState('shopping-list');


    // המרה בין שם קצר (לשימוש קל יותר בקומפוננטות) לשם המלא (כפי שמוגדר במודל וב-API)
    const listTypeToStateKey = {
        shopping: 'shoppingList', // 'shopping' כ-key לצורך הפשטה בקומפוננטות
        tasks: 'tasks',
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
            setError(err.response?.data?.message || 'Failed to fetch available homes');
        } finally {
            setLoading(false);
        }
    }, []);

    // ניסיון התחברות אוטומטית בהתבסס על HomeId ב-LocalStorage
    useEffect(() => {
        const storedHomeId = localStorage.getItem('homeId');
        const attemptReLogin = async () => {
            if (storedHomeId) {
                setLoading(true);
                setError(null);
                try {
                    const homeDetails = await api.getHomeDetails(storedHomeId);
                    setActiveHome(homeDetails);
                    localStorage.setItem('homeId', homeDetails._id); // וודא שזה קיים ורצוי
                } catch (err) {
                    console.error("Failed to re-login automatically:", err);
                    localStorage.removeItem('homeId'); // הסר ID אם הכניסה נכשלה
                    setActiveHome(null);
                    setError(err.response?.data?.message || 'Failed to reconnect. Please log in again.');
                    await fetchHomes(); // טען מחדש את רשימת הבתים לאחר כישלון התחברות
                } finally {
                    setLoading(false);
                }
            } else {
                fetchHomes(); // אם אין ID שמור, טען את רשימת הבתים
            }
        };

        attemptReLogin();
    }, [fetchHomes]);

    // פונקציה לכניסה לבית (ממסך הלוגין)
    const initializeHome = useCallback(async (homeId, accessCode) => {
        setLoading(true);
        setError(null);
        try {
            const home = await api.loginToHome(homeId, accessCode);
            setActiveHome(home);
            localStorage.setItem('homeId', home._id);
            setActiveTab('shopping-list'); // הגדר טאב ברירת מחדל
            return true;
        } catch (err) {
            console.error("Initialization error:", err);
            // === תיקון: מיפוי הודעות שגיאה ספציפיות בעברית גם כאן ===
            let userFriendlyMessage = err.response?.data?.message || 'Failed to connect to home';
            if (userFriendlyMessage.includes('Invalid access code')) {
                userFriendlyMessage = 'קוד גישה שגוי.';
            } else if (userFriendlyMessage.includes('Home not found')) {
                userFriendlyMessage = 'הבית לא נמצא במערכת.';
            }
            // ... ניתן להוסיף עוד מיפויים כאן
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
            setActiveHome(newHome); // הגדר את הבית שנוצר כ-activeHome
            localStorage.setItem('homeId', newHome._id); // שמור את ה-ID שלו
            
            // === תיקון 1: וודא ש-fetchHomes מסתיים לפני החזרה מ-createHome ===
            // זה מבטיח שהרשימה 'homes' תהיה מעודכנת עם הבית החדש מיד.
            await fetchHomes(); // השתמש ב-await
            // ===================================================================

            setError(null);
            return true;
        } catch (err) {
            console.error("Failed to create home:", err);
            // === הוספת console.log לאבחון מדויק יותר ===
            console.log("RAW Server Error Message for createHome:", err.response?.data?.message);
            // ===========================================

            let userFriendlyMessage = err.response?.data?.message || 'Failed to create home';
            // === תיקון 2: שימוש ב-toLowerCase() להשוואה חסינת רישיות ===
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
        localStorage.removeItem('homeId');
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
            setError(null);
        } catch (err) {
            console.error("Failed to update home:", err);
            setError(err.response?.data?.message || 'Failed to update home');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    // פונקציות לניהול פריטים (קניות ומשימות)
    const saveItem = useCallback(async (listType, itemData) => {
        if (!activeHome?._id) return;
        const stateKey = listTypeToStateKey[listType];
        if (!stateKey) {
            console.error(`Invalid list type: ${listType}`);
            setError(`Invalid list type: ${listType}`);
            return;
        }
        setLoading(true);
        try {
            const newItem = await api.addItemToList(activeHome._id, stateKey, itemData);
            setActiveHome(prev => ({
                ...prev,
                [stateKey]: [...(prev[stateKey] || []), newItem]
            }));
            setError(null);
        } catch (err) {
            console.error(`Failed to add ${listType} item:`, err);
            setError(err.response?.data?.message || `Failed to add ${listType} item`);
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const modifyItem = useCallback(async (listType, itemId, itemData) => {
        if (!activeHome?._id) return;
        const stateKey = listTypeToStateKey[listType];
        if (!stateKey) {
            console.error(`Invalid list type: ${listType}`);
            setError(`Invalid list type: ${listType}`);
            return;
        }
        setLoading(true);
        try {
            const updatedItem = await api.updateItemInList(activeHome._id, stateKey, itemId, itemData);
            setActiveHome(prev => ({
                ...prev,
                [stateKey]: (prev[stateKey] || []).map(item =>
                    item._id === itemId ? updatedItem : item
                )
            }));
            setError(null);
        } catch (err) {
            console.error(`Failed to update ${listType} item:`, err);
            setError(err.response?.data?.message || `Failed to update ${listType} item`);
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const removeItem = useCallback(async (listType, itemId) => {
        if (!activeHome?._id) return;
        const stateKey = listTypeToStateKey[listType];
        if (!stateKey) {
            console.error(`Invalid list type: ${listType}`);
            setError(`Invalid list type: ${listType}`);
            return;
        }
        setLoading(true);
        try {
            await api.deleteItemFromList(activeHome._id, stateKey, itemId);
            setActiveHome(prev => ({
                ...prev,
                [stateKey]: (prev[stateKey] || []).filter(item => item._id !== itemId)
            }));
            setError(null);
        } catch (err) {
            console.error(`Failed to delete ${listType} item:`, err);
            setError(err.response?.data?.message || `Failed to delete ${listType} item`);
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    // פונקציות לניהול כספים
    const saveBill = useCallback(async (billData) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const newBill = await api.addExpectedBill(activeHome._id, billData);
            setActiveHome(prev => ({
                ...prev,
                finances: {
                    ...prev.finances,
                    expectedBills: [...(prev.finances?.expectedBills || []), newBill]
                }
            }));
            setError(null);
        } catch (err) {
            console.error("Failed to add bill:", err);
            setError(err.response?.data?.message || 'Failed to add bill');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const modifyBill = useCallback(async (billId, billData) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const updatedBill = await api.updateExpectedBill(activeHome._id, billId, billData);
            setActiveHome(prev => ({
                ...prev,
                finances: {
                    ...prev.finances,
                    expectedBills: (prev.finances?.expectedBills || []).map(bill =>
                        bill._id === billId ? updatedBill : bill
                    )
                }
            }));
            setError(null);
        } catch (err) {
            console.error("Failed to update bill:", err);
            setError(err.response?.data?.message || 'Failed to update bill');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const deleteBill = useCallback(async (billId) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            await api.deleteExpectedBill(activeHome._id, billId);
            setActiveHome(prev => ({
                ...prev,
                finances: {
                    ...prev.finances,
                    expectedBills: (prev.finances?.expectedBills || []).filter(bill => bill._id !== billId)
                }
            }));
            setError(null);
        } catch (err) {
            console.error("Failed to delete bill:", err);
            setError(err.response?.data?.message || 'Failed to delete bill');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const payExistingBill = useCallback(async (billId) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const updatedFinances = await api.payBill(activeHome._id, billId);
            setActiveHome(prev => ({
                ...prev,
                finances: updatedFinances
            }));
            setError(null);
        } catch (err) {
            console.error("Failed to pay bill:", err);
            setError(err.response?.data?.message || 'Failed to pay bill');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const saveIncome = useCallback(async (incomeData) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const newIncome = await api.addIncome(activeHome._id, incomeData);
            setActiveHome(prev => ({
                ...prev,
                finances: {
                    ...prev.finances,
                    income: [...(prev.finances?.income || []), newIncome]
                }
            }));
            setError(null);
        } catch (err) {
            console.error("Failed to add income:", err);
            setError(err.response?.data?.message || 'Failed to add income');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const saveSavingsGoal = useCallback(async (goalData) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const newGoal = await api.addSavingsGoal(activeHome._id, goalData);
            setActiveHome(prev => ({
                ...prev,
                finances: {
                    ...prev.finances,
                    savingsGoals: [...(prev.finances?.savingsGoals || []), newGoal]
                }
            }));
            setError(null);
        } catch (err) {
            console.error("Failed to add savings goal:", err);
            setError(err.response?.data?.message || 'Failed to add savings goal');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const addFundsToSavingsGoal = useCallback(async (goalId, amount) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const updatedGoal = await api.addFundsToSavingsGoal(activeHome._id, goalId, amount);
            setActiveHome(prev => ({
                ...prev,
                finances: {
                    ...prev.finances,
                    savingsGoals: (prev.finances?.savingsGoals || []).map(goal =>
                        goal._id === goalId ? updatedGoal : goal
                    )
                }
            }));
            setError(null);
        } catch (err) {
            console.error("Failed to add funds to savings goal:", err);
            setError(err.response?.data?.message || 'Failed to add funds to savings goal');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const saveBudgets = useCallback(async (budgetsData) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const updatedCategories = await api.updateBudgets(activeHome._id, budgetsData);
            setActiveHome(prev => ({
                ...prev,
                finances: {
                    ...prev.finances,
                    expenseCategories: updatedCategories
                }
            }));
            setError(null);
        } catch (err) {
            console.error("Failed to save budgets:", err);
            setError(err.response?.data?.message || 'Failed to save budgets');
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const fetchUserMonthlyFinanceSummary = useCallback(async (year, month) => {
        if (!activeHome?._id) return null;
        setLoading(true);
        try {
            const summary = await api.getUserMonthlyFinanceSummary(activeHome._id, year, month);
            setError(null);
            return summary;
        } catch (err) {
            console.error("Failed to fetch user monthly finance summary:", err);
            setError(err.response?.data?.message || 'Failed to fetch user monthly finance summary');
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
            setActiveHome(prev => ({
                ...prev,
                users: response // response אמור להיות מערך המשתמשים החדש
            }));
            setError(null);
            return true;
        } catch (err) {
            console.error("Failed to add user:", err);
            setError(err.response?.data?.message || 'Failed to add user');
            return false;
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const removeHomeUser = useCallback(async (userName) => {
        if (!activeHome?._id) return;
        setLoading(true);
        try {
            const response = await api.removeUser(activeHome._id, userName);
            setActiveHome(prev => ({
                ...prev,
                users: response.users // נשתמש במערך ה-users מתוך התגובה
            }));
            setError(null);
            return true;
        } catch (err) {
            console.error("Failed to remove user:", err);
            setError(err.response?.data?.message || 'Failed to remove user');
            return false;
        } finally {
            setLoading(false);
        }
    }, [activeHome?._id]);

    const changeActiveTab = useCallback((tabName) => {
        setActiveTab(tabName);
    }, []);

    // === פונקציית בדיקת בידוד חדשה ===
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
            const createSuccess = await createHome(homeData); // קורא לפונקציית createHome של הקונטקסט
            
            if (createSuccess) {
                console.log(`Home '${testHomeName}' created successfully via createHome.`);
                console.log("Active Home after creation:", activeHome); // זה יהיה עדיין null כאן כי ה-state לא עודכן
                // מאחר ש-createHome כבר מגדיר activeHome ו-localStorage, הבית אמור להיות פעיל.
                // ננסה לוודא את זה על ידי בדיקה ישירה של ה-activeHome מהסטייט
                // או על ידי ניסיון לאחזר פרטים.
                
                // הדרך הטובה ביותר לוודא התחברות:
                // מכיוון ש-createHome כבר קורא ל-setActiveHome, נצפה ש-activeHome יתעדכן.
                // נצטרך לעטוף את זה ב-setTimeout או לרוץ מחוץ ל-useCallback כדי לראות את השינוי ב-activeHome.
                // לעכשיו, נסתמך על כך ש-createHome מחזיר true אם התחברנו.

                if (activeHome?._id) { // בדיקה שה-activeHome כבר נקבע
                     console.log(`Successfully connected to newly created home: ${activeHome.name} (ID: ${activeHome._id})`);
                } else {
                     console.warn("activeHome was not immediately set after createHome success. This might be a timing issue in React state updates.");
                     // ננסה לבצע initializeHome במפורש כדי לבדוק
                     console.log(`Attempting explicit login to ${testHomeName} (ID: ${newHome._id}) with code: ${testAccessCode}`);
                     const explicitLoginSuccess = await initializeHome(newHome._id, testAccessCode);
                     if(explicitLoginSuccess) {
                         console.log(`Explicit login to '${testHomeName}' successful!`);
                     } else {
                         console.error(`Explicit login to '${testHomeName}' FAILED. Error: ${error}`);
                     }
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
    }, [createHome, initializeHome, activeHome, error]); // תלויות

    const contextValue = useMemo(() => ({
        activeHome,
        loading,
        error,
        homes,
        activeTab,
        initializeHome,
        logoutHome,
        updateHome,
        saveItem,
        modifyItem,
        removeItem,
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
        runIsolatedTest // הוספת פונקציית הבדיקה לקונטקסט
    }), [
        activeHome,
        loading,
        error,
        homes,
        activeTab,
        initializeHome,
        logoutHome,
        updateHome,
        saveItem,
        modifyItem,
        removeItem,
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
        runIsolatedTest // הוספה לתלויות
    ]);

    return (
        <HomeContext.Provider value={contextValue}>
            {children}
        </HomeContext.Provider>
    );
};
