const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController'); // וודא שהנתיב לקובץ ה-Controller נכון
// שימו לב שאין צורך בייבוא מפורש של כל פונקציה כמו בקוד החדש,
// כי אנחנו מייבאים את כל האובייקט `homeController` ומשתמשים בפונקציות שלו.

// --- Home Management ---
// ה-api.js שולח POST /home, ואם ה-router מותקן ב-/api, אז זה הופך ל-/api/home
router.post('/', homeController.createHome);
router.get('/', homeController.getHomes);
router.post('/login', homeController.loginToHome);
router.get('/:homeId', homeController.getHomeDetails); // השם בבקר הוא getHomeDetails

// --- User Management ---
router.post('/:homeId/users', homeController.addUser); // השם בבקר הוא addUser
router.delete('/:homeId/users', homeController.removeUser);

// --- Finance Routes ---
router.get('/:homeId/finances/summary/:year/:month', homeController.getUserMonthlyFinanceSummary);
router.post('/:homeId/finances/expected-bills', homeController.addExpectedBill);
router.put('/:homeId/finances/expected-bills/:billId', homeController.updateExpectedBill);
router.delete('/:homeId/finances/expected-bills/:billId', homeController.deleteExpectedBill);
router.post('/:homeId/finances/pay-bill/:billId', homeController.payBill);
router.post('/:homeId/finances/income', homeController.addIncome);
router.post('/:homeId/finances/savings-goals', homeController.addSavingsGoal);
router.patch('/:homeId/finances/savings-goals/:goalId/add-funds', homeController.addFundsToSavingsGoal);
router.put('/:homeId/finances/budgets', homeController.updateBudgets);

// --- Gemini AI Integrations ---
router.post('/:homeId/ai/transform-recipe', homeController.transformRecipeToShoppingList); // שם הפונקציה בבקר הוא transformRecipeToShoppingList
router.post('/:homeId/ai/breakdown-task', homeController.breakdownComplexTask);

// --- Generic Item Routes (for Shopping and Tasks) ---
router.post('/:homeId/:listType', homeController.addItemToList);
router.put('/:homeId/:listType/:itemId', homeController.updateItemInList);
router.delete('/:homeId/:listType/:itemId', homeController.deleteItemFromList);

// --- נתיב חדש: מחיקת פריטים שהושלמו ---
router.post('/:homeId/:listType/clear-completed', homeController.clearCompletedItems); // נתיב חדש לפונקציה החדשה

module.exports = router;