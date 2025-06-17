import axios from 'axios';

/**
 * @file api.js
 * @description Centralized API service for interacting with the Node.js backend.
 * Uses Axios for HTTP requests.
 */

// הגדרת בסיס ה-URL לשרת שלך
// יש לוודא שזה תואם לכתובת השרת שלך (לרוב localhost:3001 בפיתוח)
const API_URL = 'http://localhost:3001/api/homes'; 

/**
 * פונקציית עזר לטיפול בשגיאות מה-API.
 * @param {Error} error - אובייקט השגיאה.
 * @returns {Promise<Error>} - מחזיר Promise שנכשל עם אובייקט שגיאה מפורט.
 */
const handleError = (error) => {
  const errorMessage = error.response?.data?.message || error.message || 'שגיאה לא ידועה';
  console.error('API Error:', errorMessage, error.response || error);
  // ניתן לזרוק שגיאה עם הודעה מותאמת אישית או קוד סטטוס
  throw new Error(errorMessage);
};

/**
 * מאחזר את רשימת כל הבתים מהשרת.
 * @returns {Promise<Array>} - Promise עם מערך הבתים.
 */
export const getHomes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * מאחזר בית ספציפי לפי ID.
 * @param {string} id - ה-ID של הבית.
 * @returns {Promise<Object>} - Promise עם אובייקט הבית.
 */
export const getHomeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * יוצר בית חדש.
 * @param {Object} homeData - נתוני הבית ליצירה.
 * @returns {Promise<Object>} - Promise עם אובייקט הבית שנוצר.
 */
export const createHome = async (homeData) => {
  try {
    const response = await axios.post(API_URL, homeData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * מעדכן בית קיים לפי ID.
 * @param {string} id - ה-ID של הבית לעדכון.
 * @param {Object} updates - האובייקט המכיל את השדות לעדכון.
 * @returns {Promise<Object>} - Promise עם אובייקט הבית המעודכן.
 */
export const updateHome = async (id, updates) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updates);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * מוחק בית קיים לפי ID.
 * @param {string} id - ה-ID של הבית למחיקה.
 * @returns {Promise<Object>} - Promise עם הודעת הצלחה.
 */
export const deleteHome = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * מאחזר בית לפי קוד גישה.
 * @param {string} accessCode - קוד הגישה של הבית.
 * @returns {Promise<Object>} - Promise עם אובייקט הבית.
 */
export const getHomeByAccessCode = async (accessCode) => {
  try {
    const response = await axios.get(`<span class="math-inline">\{API\_URL\}/byAccessCode/</span>{accessCode}`);
    return response.data;
  } catch (error) {
    // שים לב: כאן אנו רוצים שהשגיאה תיזרק חזרה לקומפוננטה
    // כדי שנוכל להציג הודעה למשתמש (למשל "קוד שגוי").
    console.error('Error fetching home by access code:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// ניתן להוסיף כאן פונקציות API נוספות עבור פעולות ספציפיות יותר
// אם הקונטרולר בצד השרת יפוצל לפונקציות עדינות יותר
// לדוגמה:
/*
export const addItemToShoppingList = async (homeId, itemData) => {
  try {
    const response = await axios.post(`${API_URL}/${homeId}/shopping-items`, itemData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};
*/
