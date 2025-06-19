const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController'); // וודא שהנתיב לקובץ ה-Controller נכון

// --- Home Management ---
// ה-api.js שולח POST /home, ואם ה-router מותקן ב-/api, אז זה הופך ל-/api/home
router.post('/', homeController.createHome); // תיקון: הנתיב הוא '/' בתוך הראוטר
router.get('/', homeController.getHomes); // תיקון: הנתיב הוא '/' בתוך הראוטר (עבור getHomes)
router.post('/login', homeController.loginToHome);
router.get('/:homeId', homeController.getHomeDetails);

// --- User Management ---
router.post('/:homeId/users', homeController.addUser); // תיקון: הוסר '/add'
router.delete('/:homeId/users', homeController.removeUser); // תיקון: מתודה שונתה ל-DELETE

// --- Finance Routes ---
// הנתיבים האלה בתוך הראוטר צריכים להיות יחסיים ל-/api
router.get('/:homeId/finances/summary/:year/:month', homeController.getUserMonthlyFinanceSummary);
router.post('/:homeId/finances/expected-bills', homeController.addExpectedBill);
router.put('/:homeId/finances/expected-bills/:billId', homeController.updateExpectedBill);
router.delete('/:homeId/finances/expected-bills/:billId', homeController.deleteExpectedBill);
router.post('/:homeId/finances/pay-bill/:billId', homeController.payBill);
router.post('/:homeId/finances/income', homeController.addIncome);
router.post('/:homeId/finances/savings-goals', homeController.addSavingsGoal);
// תיקון: מתודה שונתה ל-PATCH ב-api.js, אז גם כאן
router.patch('/:homeId/finances/savings-goals/:goalId/add-funds', homeController.addFundsToSavingsGoal);
router.put('/:homeId/finances/budgets', homeController.updateBudgets);

// --- Gemini AI Integrations ---
router.post('/:homeId/ai/transform-recipe', homeController.transformRecipeToShoppingList);
router.post('/:homeId/ai/breakdown-task', homeController.breakdownComplexTask);

// --- Generic Item Routes (for Shopping and Tasks) ---
// אלו הם הנתיבים הכלליים ביותר
router.post('/:homeId/:listType', homeController.addItemToList); // תיקון: הוסר '/add'
router.put('/:homeId/:listType/:itemId', homeController.updateItemInList);
router.delete('/:homeId/:listType/:itemId', homeController.deleteItemFromList);

module.exports = router;
