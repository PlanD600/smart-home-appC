import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api.js'; // ייבוא שירותי ה-API לצורך תקשורת עם השרת (Node.js/MongoDB) - נוספה סיומת קובץ

// יצירת קונטקסט הבית
const HomeContext = createContext();

// Hook מותאם אישית לשימוש בקונטקסט הבית
export const useHome = () => useContext(HomeContext);

/**
 * @file HomeContext component
 * @description Provides global state management for home data, handling fetching, creating,
 * updating, and selecting homes via the Node.js/MongoDB backend API.
 */
export const HomeProvider = ({ children }) => {
  const [currentHome, setCurrentHome] = useState(null); // הבית הפעיל כרגע
  const [homes, setHomes] = useState([]); // רשימת כל הבתים שהמשתמש מחובר אליהם
  const [loading, setLoading] = useState(true); // מצב טעינה גלובלי
  const [error, setError] = useState(null); // מצב שגיאה גלובלי
  const [userId, setUserId] = useState('anonymous_user'); // ID משתמש (כרגע פלייסדר, ישולב עם מערכת אימות מהשרת)

  // פונקציית אתחול ראשונית (במקום אתחול Firebase)
  // כרגע תפקידה העיקרי הוא לטעון בתים אם יש משתמש מאומת
  const initApp = useCallback(async () => {
    setLoading(true);
    try {
      // כאן, אם הייתה מערכת אימות בצד השרת, היינו מאחזרים את ה-userId האמיתי
      // לדוגמה: const authenticatedUserId = await api.getAuthStatus();
      // setUserId(authenticatedUserId || 'anonymous_user');

      // דוגמה: בדיקה אם קיים homeId ב-localStorage כדי לנסות לטעון אותו
      const savedHomeId = localStorage.getItem('activeHomeId');
      if (savedHomeId) {
        await fetchAndSelectHome(savedHomeId);
      } else {
        // אם אין בית פעיל שמור, ננסה לאחזר את רשימת הבתים של המשתמש
        // (בהנחה ש-API.getHomes() מחזיר בתים זמינים למשתמש הנוכחי/אנונימי)
        const fetchedHomes = await api.getHomes(); // קריאה ל-API של השרת
        setHomes(fetchedHomes);
      }
    } catch (err) {
      console.error("Error during app initialization:", err);
      setError("Failed to initialize application.");
    } finally {
      setLoading(false);
    }
  }, []); // ריצה פעם אחת באתחול האפליקציה

  // פונקציה לאחזור ובחירת בית ספציפי
  const fetchAndSelectHome = useCallback(async (homeId) => {
    setLoading(true);
    try {
      const home = await api.getHomeById(homeId); // קריאה ל-API של השרת
      if (home) {
        setCurrentHome(home);
        localStorage.setItem('activeHomeId', homeId); // שמירת ID הבית ב-localStorage
        // מכיוון שאין onSnapshot ב-MongoDB, נצטרך לרענן ידנית או לממש WebSockets
        // נדאג לרענון באמצעות עדכוני state בעת שמירת שינויים.
        console.log("Selected home:", home);
      } else {
        setError("Home not found.");
        setCurrentHome(null);
        localStorage.removeItem('activeHomeId');
      }
    } catch (err) {
      console.error("Error fetching and selecting home:", err);
      setError("Failed to load home.");
    } finally {
      setLoading(false);
    }
  }, []);

  // יצירת בית חדש באמצעות ה-API של השרת
  const createHome = useCallback(async (homeData) => {
    setLoading(true);
    try {
      // אתחול נתונים פיננסיים עם ערכי ברירת מחדל
      const newHomeData = {
        ...homeData,
        members: [userId], // שיוך המשתמש הנוכחי לבית
        createdAt: new Date().toISOString(), // תאריך יצירה בפורמט ISO
        finances: {
          income: [],
          expectedBills: [],
          paidBills: [],
          expenseCategories: [
              { id: 'cat_exp_1', name: "דיור", icon: "fas fa-home", color: "#AED581", budgetAmount: 0 },
              { id: 'cat_exp_2', name: "מזון ומשקאות", icon: "fas fa-utensils", color: "#FFB74D", budgetAmount: 0 },
              { id: 'cat_exp_3', name: "חשבונות", icon: "fas fa-receipt", color: "#4FC3F7", budgetAmount: 0 },
          ],
          savingsGoals: [],
          financeSettings: { currency: "₪" }
        },
        shoppingItems: [],
        taskItems: [],
        users: ["אני"], // משתמש ברירת מחדל
        shoppingCategories: ["כללית"],
        taskCategories: ["כללית"],
        templates: [],
        archivedShopping: [],
        archivedTasks: [],
      };
      const createdHome = await api.createHome(newHomeData); // קריאה ל-API של השרת
      setHomes(prevHomes => [...prevHomes, createdHome]); // עדכון רשימת הבתים המקומית
      await fetchAndSelectHome(createdHome._id); // בחירת הבית החדש שנוצר
      return createdHome;
    } catch (err) {
      console.error("Error creating home:", err);
      setError("Failed to create home.");
      throw err; // זריקת השגיאה כדי שתוכל להיקלט בקומפוננטה שקראה לפונקציה
    } finally {
      setLoading(false);
    }
  }, [userId, fetchAndSelectHome]);

  // עדכון נתוני הבית הנוכחי באמצעות ה-API של השרת
  const updateCurrentHome = useCallback(async (updates) => {
    if (!currentHome || !currentHome._id) {
      console.error("No current home selected for update.");
      setError("No home selected.");
      return;
    }
    setLoading(true);
    try {
      // שולח את העדכונים לשרת. ה-API בצד השרת אמור לטפל במיזוג/עדכון הנתונים ב-MongoDB.
      const updatedHome = await api.updateHome(currentHome._id, updates);
      setCurrentHome(updatedHome); // עדכון הסטייט המקומי עם הנתונים המעודכנים מהשרת
      console.log("Home data updated successfully for ID:", currentHome._id);
    } catch (err) {
      console.error("Error updating home data:", err);
      setError("Failed to update home data.");
      throw err; // זריקת השגיאה
    } finally {
      setLoading(false);
    }
  }, [currentHome]);

  // פונקציית התנתקות
  const logout = useCallback(() => {
    setCurrentHome(null);
    localStorage.removeItem('activeHomeId'); // הסרת הבית הפעיל מ-localStorage
    // אם הייתה מערכת אימות, כאן היינו מבצעים יציאה (לדוגמה: api.logoutUser())
  }, []);

  // הפעלת initApp בעת טעינת הקומפוננטה
  useEffect(() => {
    initApp();
  }, [initApp]);

  // ערכי הקונטקסט שיהיו זמינים לכל הקומפוננטות העוטפות
  const value = {
    currentHome,
    homes, // הוספת רשימת הבתים לקונטקסט
    loading,
    error,
    userId,
    fetchAndSelectHome, // שינוי שם מ-selectHome לבהירות
    createHome,
    updateCurrentHome,
    logout,
  };

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
};
