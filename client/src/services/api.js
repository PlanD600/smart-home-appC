import axios from 'axios';

// וודא שכתובת ה-URL הזו נכונה עבור השרת שלך.
// במקרה של פיתוח מקומי, 5001 היא נפוצה.
const API_URL = 'http://localhost:5001/api';

export const getHomes = () => {
    return axios.get(`${API_URL}/homes`);
};

export const loginHome = (homeId, accessCode) => {
    return axios.post(`${API_URL}/homes/login`, { homeId, accessCode });
};

export const createHome = (homeData) => {
    return axios.post(`${API_URL}/homes`, homeData); // נוסף: יצירת בית חדש
};

export const getHomeData = (homeId) => {
    return axios.get(`${API_URL}/homes/${homeId}`); // נוסף: קבלת נתוני בית ספציפי
};

// פונקציה גנרית להוספת פריט (קניות, מטלות, חשבונות, הכנסות, יעדי חיסכון)
export const addItem = (homeId, itemType, itemData) => {
    // itemType יכול להיות 'shoppingItems', 'taskItems', 'finances.expectedBills' וכו'.
    // ה-Backend ידע לנתב את זה נכון.
    return axios.post(`${API_URL}/homes/${homeId}/items/${itemType}`, itemData);
};

// פונקציה גנרית לעדכון כל שדה בפריט (הושלם, הערה, וכו')
export const updateItem = (homeId, itemType, itemId, updates) => {
    return axios.put(`${API_URL}/homes/${homeId}/items/${itemType}/${itemId}`, updates);
};

export const deleteItem = (homeId, itemType, itemId) => {
    return axios.delete(`${API_URL}/homes/${homeId}/items/${itemType}/${itemId}`);
};

export const archiveItem = (homeId, itemType, itemId) => {
    return axios.post(`${API_URL}/homes/${homeId}/items/${itemType}/${itemId}/archive`);
};

export const restoreItem = (homeId, itemType, itemId) => {
    return axios.post(`${API_URL}/homes/${homeId}/archive/${itemType}/${itemId}/restore`);
};

export const deleteArchivedItem = (homeId, itemType, itemId) => {
    return axios.delete(`${API_URL}/homes/${homeId}/archive/${itemType}/${itemId}`);
};

// קטגוריות (לרשימות קניות, מטלות, והוצאות)
export const addCategory = (homeId, itemType, data) => { // data יכיל { categoryName: "שם", color: "#...", icon: "..." } עבור הוצאות
    return axios.post(`${API_URL}/homes/${homeId}/categories/${itemType}`, data);
};

// תתי-פריטים
export const addSubItem = (homeId, itemType, parentItemId, subItemData) => { // subItemData הוא { text: "..." }
    return axios.post(`${API_URL}/homes/${homeId}/items/${itemType}/${parentItemId}/subitems`, subItemData);
};

export const updateSubItem = (homeId, itemType, parentItemId, subItemId, updates) => {
    return axios.put(`${API_URL}/homes/${homeId}/items/${itemType}/${parentItemId}/subitems/${subItemId}`, updates);
};

export const deleteSubItem = (homeId, itemType, parentItemId, subItemId) => { // נוסף: מחיקת תת-פריט
    return axios.delete(`${API_URL}/homes/${homeId}/items/${itemType}/${parentItemId}/subitems/${subItemId}`);
};

// AI Helper (Gemini)
// הנתיב ל-AI אינו מכיל homeId ב-URL לפי הראוטר המעודכן
export const generateListFromAI = (data) => { // data יכיל { text: "מתכון", type: "shopping" }
    return axios.post(`${API_URL}/ai-generate-list`, data);
};

// ניהול חשבונות כספים
export const payBill = (homeId, billId) => { // נוסף: תשלום חשבון
    return axios.post(`${API_URL}/homes/${homeId}/finances/bills/${billId}/pay`);
};

export const updateBudgets = (homeId, budgetData) => { // נוסף: עדכון תקציבים
    return axios.put(`${API_URL}/homes/${homeId}/finances/budgets`, budgetData);
};

// ניהול משתמשים
export const addUser = (homeId, userData) => { // נוסף: הוספת משתמש
    return axios.post(`${API_URL}/homes/${homeId}/users`, userData);
};

export const removeUser = (homeId, username) => { // נוסף: הסרת משתמש
    return axios.delete(`${API_URL}/homes/${homeId}/users/${username}`);
};

// ניהול תבניות
export const createTemplate = (homeId, templateData) => { // נוסף: יצירת תבנית
    return axios.post(`${API_URL}/homes/${homeId}/templates`, templateData);
};

export const updateTemplate = (homeId, templateId, templateData) => { // נוסף: עדכון תבנית
    return axios.put(`${API_URL}/homes/${homeId}/templates/${templateId}`, templateData);
};

export const deleteTemplate = (homeId, templateId) => { // נוסף: מחיקת תבנית
    return axios.delete(`${API_URL}/homes/${homeId}/templates/${templateId}`);
};