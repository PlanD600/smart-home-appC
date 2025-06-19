import axios from 'axios';

// כתובת ה-API הבסיסית, משתמשת במשתנה סביבה או בברירת מחדל
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// יצירת מופע של Axios עם הגדרות בסיסיות
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // הגדרת כותרת ברירת מחדל ל-JSON
  },
});

/**
 * פונקציית עזר לטיפול בשגיאות מה-API.
 * מדפיסה את השגיאה לקונסול וזורקת שגיאה חדשה עם הודעה ידידותית.
 * @param {object} error - אובייקט השגיאה שקיבל מ-Axios.
 * @param {string} defaultMessage - הודעה שתשמש אם אין הודעת שגיאה ספציפית מהשרת.
 */
const handleApiError = (error, defaultMessage = 'An unexpected error occurred.') => {
  // הדפסת פרטי השגיאה המלאים לקונסול (עבור Debugging)
  console.error("API Error:", error.response || error.message || error);
  // זריקת שגיאה חדשה עם הודעה ידידותית יותר למשתמש, המבוססת על תגובת השרת
  throw new Error(error.response?.data?.message || defaultMessage);
};

// --- Home related APIs ---

/**
 * מביא את רשימת כל הבתים הקיימים (רק ID, שם, אייקון, וסכימת צבע).
 * @returns {Promise<Array>} - מערך של אובייקטי בית.
 */
export const getHomes = async () => {
  try {
    // === התיקון כאן: שינוי מ-'/homes' ל-'/home' ===
    // השרת מצפה ל-GET /api/home (כי ה-router מותקן ב-/api/home ומוגדר כ-'/').
    const response = await api.get('/home'); 
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch homes.');
  }
};

/**
 * יוצר בית חדש.
 * @param {object} homeData - נתוני הבית החדש (שם, קוד גישה, משתמשים, וכו').
 * @returns {Promise<object>} - אובייקט הבית שנוצר.
 */
export const createHome = async (homeData) => {
  try {
    const response = await api.post('/home', homeData); 
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to create home.');
  }
};

/**
 * מבצע התחברות לבית קיים באמצעות ID וקוד גישה.
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} accessCode - קוד הגישה של הבית.
 * @returns {Promise<object>} - אובייקט הבית אם ההתחברות הצליחה.
 */
export const loginToHome = async (homeId, accessCode) => {
  try {
    const response = await api.post(`/home/login`, { homeId, accessCode });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to login to home. Check ID and access code.');
  }
};

/**
 * מביא פרטים מלאים של בית ספציפי.
 * @param {string} homeId - ה-ID של הבית.
 * @returns {Promise<object>} - אובייקט הבית המלא.
 */
export const getHomeDetails = async (homeId) => {
  try {
    const response = await api.get(`/home/${homeId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to fetch details for home ${homeId}.`);
  }
};


// --- Item (Shopping & Tasks) related APIs ---

/**
 * מוסיף פריט לרשימה ספציפית (קניות או משימות).
 * @param {string} homeId - ה-ID של הבית.
 * @param {'shoppingList'|'tasks'} listType - סוג הרשימה (חייב להיות "shoppingList" או "tasks").
 * @param {object} itemData - נתוני הפריט להוספה.
 * @returns {Promise<object>} - אובייקט הפריט שנוסף.
 */
export const addItemToList = async (homeId, listType, itemData) => {
  try {
    // הנתיב תואם ל-Backend
    const response = await api.post(`/home/${homeId}/${listType}`, itemData);
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to add ${listType} item.`);
  }
};

/**
 * מעדכן פריט קיים ברשימה ספציפית (קניות או משימות).
 * @param {string} homeId - ה-ID של הבית.
 * @param {'shoppingList'|'tasks'} listType - סוג הרשימה.
 * @param {string} itemId - ה-ID של הפריט לעדכון.
 * @param {object} itemData - הנתונים לעדכון הפריט.
 * @returns {Promise<object>} - אובייקט הפריט המעודכן.
 */
export const updateItemInList = async (homeId, listType, itemId, itemData) => {
  try {
    // הנתיב תואם ל-Backend
    const response = await api.put(`/home/${homeId}/${listType}/${itemId}`, itemData);
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to update ${listType} item.`);
  }
};

/**
 * מוחק פריט מרשימה ספציפית (קניות או משימות).
 * @param {string} homeId - ה-ID של הבית.
 * @param {'shoppingList'|'tasks'} listType - סוג הרשימה.
 * @param {string} itemId - ה-ID של הפריט למחיקה.
 * @returns {Promise<void>}
 */
export const deleteItemFromList = async (homeId, listType, itemId) => {
  try {
    // הנתיב תואם ל-Backend
    await api.delete(`/home/${homeId}/${listType}/${itemId}`);
  } catch (error) {
    handleApiError(error, `Failed to delete ${listType} item.`);
  }
};

// --- Finance related APIs ---

/**
 * מוסיף חשבון צפוי חדש.
 * @param {string} homeId - ה-ID של הבית.
 * @param {object} billData - נתוני החשבון הצפוי.
 * @returns {Promise<object>} - אובייקט החשבון שנוסף.
 */
export const addExpectedBill = async (homeId, billData) => {
  try {
    const response = await api.post(`/home/${homeId}/finances/expected-bills`, billData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add expected bill.');
  }
};

/**
 * מעדכן חשבון צפוי קיים.
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} billId - ה-ID של החשבון לעדכון.
 * @param {object} billData - הנתונים לעדכון החשבון.
 * @returns {Promise<object>} - אובייקט החשבון המעודכן.
 */
export const updateExpectedBill = async (homeId, billId, billData) => {
  try {
    const response = await api.put(`/home/${homeId}/finances/expected-bills/${billId}`, billData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to update expected bill.');
  }
};

/**
 * מוחק חשבון צפוי.
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} billId - ה-ID של החשבון למחיקה.
 * @returns {Promise<void>}
 */
export const deleteExpectedBill = async (homeId, billId) => {
  try {
    await api.delete(`/home/${homeId}/finances/expected-bills/${billId}`);
  } catch (error) {
    handleApiError(error, 'Failed to delete expected bill.');
  }
};

/**
 * מסמן חשבון כ"שולם" ומעביר אותו לרשימת החשבונות ששולמו.
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} billId - ה-ID של החשבון לתשלום.
 * @returns {Promise<object>} - אובייקט הפיננסים המעודכן של הבית.
 */
export const payBill = async (homeId, billId) => {
  try {
    const response = await api.post(`/home/${homeId}/finances/pay-bill/${billId}`);
    return response.data; 
  } catch (error) {
    handleApiError(error, 'Failed to pay bill.');
  }
};

/**
 * מוסיף הכנסה חדשה.
 * @param {string} homeId - ה-ID של הבית.
 * @param {object} incomeData - נתוני ההכנסה.
 * @returns {Promise<object>} - אובייקט ההכנסה שנוסף.
 */
export const addIncome = async (homeId, incomeData) => {
  try {
    const response = await api.post(`/home/${homeId}/finances/income`, incomeData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add income.');
  }
};

/**
 * מוסיף יעד חיסכון חדש.
 * @param {string} homeId - ה-ID של הבית.
 * @param {object} goalData - נתוני יעד החיסכון.
 * @returns {Promise<object>} - אובייקט יעד החיסכון שנוסף.
 */
export const addSavingsGoal = async (homeId, goalData) => {
  try {
    const response = await api.post(`/home/${homeId}/finances/savings-goals`, goalData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add savings goal.');
  }
};

/**
 * מוסיף כספים ליעד חיסכון קיים.
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} goalId - ה-ID של יעד החיסכון.
 * @param {number} amount - הסכום להוספה.
 * @returns {Promise<object>} - אובייקט יעד החיסכון המעודכן.
 */
export const addFundsToSavingsGoal = async (homeId, goalId, amount) => {
  try {
    const response = await api.patch(`/home/${homeId}/finances/savings-goals/${goalId}/add-funds`, { amount });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add funds to savings goal.');
  }
};

/**
 * מעדכן את תקציבי קטגוריות ההוצאה.
 * @param {string} homeId - ה-ID של הבית.
 * @param {Array<object>} budgetsData - מערך של אובייקטי קטגוריה עם תקציבים מעודכנים.
 * @returns {Promise<Array>} - מערך קטגוריות ההוצאה המעודכן.
 */
export const updateBudgets = async (homeId, budgetsData) => {
    try {
        const response = await api.put(`/home/${homeId}/finances/budgets`, budgetsData);
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Failed to update budgets.');
    }
};

/**
 * מביא סיכום פיננסי חודשי לפי משתמש.
 * @param {string} homeId - ה-ID של הבית.
 * @param {number} year - השנה.
 * @param {number} month - החודש (1-12).
 * @returns {Promise<object>} - אובייקט סיכום פיננסי לפי משתמש.
 */
export const getUserMonthlyFinanceSummary = async (homeId, year, month) => {
  try {
    const response = await api.get(`/home/${homeId}/finances/summary/${year}/${month}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch user monthly finance summary.');
  }
};

// --- User management APIs ---

/**
 * מוסיף משתמש לבית.
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} userName - שם המשתמש להוספה.
 * @returns {Promise<Array>} - מערך המשתמשים המעודכן.
 */
export const addUser = async (homeId, userName) => {
  try {
    const response = await api.post(`/home/${homeId}/users`, { userName });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add user to home.');
  }
};

/**
 * מסיר משתמש מבית.
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} userName - שם המשתמש להסרה.
 * @returns {Promise<object>} - אובייקט עם מערך המשתמשים המעודכן והודעת הצלחה.
 */
export const removeUser = async (homeId, userName) => {
  try {
    const response = await api.delete(`/home/${homeId}/users`, { data: { userName } });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to remove user from home.');
  }
};

// --- Gemini integration APIs (Mocked on Backend) ---

/**
 * ממיר טקסט מתכון לרשימת קניות. (פונקציית Mock כרגע ב-Backend).
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} recipeText - טקסט המתכון.
 * @returns {Promise<object>} - אובייקט עם הודעה ורשימת הפריטים שנוספו.
 */
export const transformRecipeToShoppingList = async (homeId, recipeText) => {
  try {
    const response = await api.post(`/home/${homeId}/ai/transform-recipe`, { recipeText });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to transform recipe using Gemini.');
  }
};

/**
 * מפרק משימה מורכבת לתת-משימות. (פונקציית Mock כרגע ב-Backend).
 * @param {string} homeId - ה-ID של הבית.
 * @param {string} taskText - טקסט המשימה המורכבת.
 * @returns {Promise<object>} - אובייקט עם הודעה ורשימת תת-המשימות שנוספו.
 */
export const breakdownComplexTask = async (homeId, taskText) => {
  try {
    const response = await api.post(`/home/${homeId}/ai/breakdown-task`, { taskText });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to breakdown task using Gemini.');
  }
};
