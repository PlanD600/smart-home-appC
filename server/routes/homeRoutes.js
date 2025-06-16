const express = require('express');
const router = express.Router();
const {
    getHomes,
    createHome,
    getHomeData,
    loginHome,
    addItem,
    updateItem,
    deleteItem,
    archiveItem,
    restoreItem,
    deleteArchivedItem,
    addCategory,
    addSubItem,
    updateSubItem,
    deleteSubItem, // הוספת ייבוא עבור מחיקת תת-פריט
    generateListFromAI,
    payBill,         // הוספת ייבוא עבור תשלום חשבון
    updateBudgets,   // הוספת ייבוא עבור עדכון תקציבים
    addUser,         // הוספת ייבוא עבור הוספת משתמש
    removeUser,      // הוספת ייבוא עבור הסרת משתמש
    createTemplate,  // הוספת ייבוא עבור יצירת תבנית
    updateTemplate,  // הוספת ייבוא עבור עדכון תבנית
    deleteTemplate   // הוספת ייבוא עבור מחיקת תבנית
} = require('../controllers/homeController');

// --- Route specifically for logging in ---
router.post('/login', loginHome);

// --- Routes for Homes ---
router.route('/homes') // שינוי ל- /homes כדי להיות יותר RESTful
    .get(getHomes)
    .post(createHome);

router.route('/homes/:id')
    .get(getHomeData);

// --- Generic Routes for Items (Shopping, Tasks, Finance Items like Bills/Income/SavingsGoals) ---
// שימו לב: itemType כעת יכול להיות גם 'finances.expectedBills' וכדומה
router.post('/homes/:id/items/:itemType', addItem);

router.route('/homes/:id/items/:itemType/:itemId')
    .put(updateItem)
    .delete(deleteItem);

// --- Routes for Archiving ---
router.post('/homes/:id/items/:itemType/:itemId/archive', archiveItem);
router.post('/homes/:id/archive/:itemType/:itemId/restore', restoreItem); // נתיב לשחזור פריט
router.delete('/homes/:id/archive/:itemType/:itemId', deleteArchivedItem); // נתיב למחיקה סופית מהארכיון

// --- Routes for Categories (Shopping, Tasks, Expenses) ---
// itemType יכול להיות 'shopping', 'task', 'expense'
router.post('/homes/:id/categories/:itemType', addCategory);


// --- Routes for Sub-items ---
router.post('/homes/:id/items/:itemType/:itemId/subitems', addSubItem);
router.route('/homes/:id/items/:itemType/:itemId/subitems/:subItemId')
    .put(updateSubItem)
    .delete(deleteSubItem); // הוספת ראוט למחיקת תת-פריט

// --- Routes for Users ---
router.post('/homes/:id/users', addUser);
router.delete('/homes/:id/users/:username', removeUser); // נתיב למחיקת משתמש לפי שם

// --- Routes for Templates ---
router.post('/homes/:id/templates', createTemplate);
router.route('/homes/:id/templates/:templateId') // templateId הוא ה-_id של התבנית
    .put(updateTemplate)
    .delete(deleteTemplate);

// --- Routes for Finance Specific Actions ---
// תשלום חשבון
router.post('/homes/:id/finances/bills/:billId/pay', payBill);
// עדכון תקציבים
router.put('/homes/:id/finances/budgets', updateBudgets);


// --- Route for AI helper (Gemini) ---
// נתיב זה אינו תלוי ב-homeId מכיוון שהוא יכול להיות קריאה כללית למודל AI
// אם הוא צריך להיות קשור לבית ספציפי, יש לשנות ל- /homes/:id/ai-generate-list
router.post('/ai-generate-list', generateListFromAI);


module.exports = router;