const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// --- Home Management ---
router.post('/', homeController.createHome);
router.get('/', homeController.getHomes);
router.post('/login', homeController.loginToHome);
router.get('/:homeId', homeController.getHomeDetails);

// --- User Management ---
router.post('/:homeId/users/add', homeController.addUser);
router.post('/:homeId/users/remove', homeController.removeUser);

// --- Finance Routes (Specific routes first) ---
router.get('/:homeId/finance/summary/:year/:month', homeController.getUserMonthlyFinanceSummary);
router.post('/:homeId/finance/bills/expected', homeController.addExpectedBill);
router.put('/:homeId/finance/bills/expected/:billId', homeController.updateExpectedBill);
router.delete('/:homeId/finance/bills/expected/:billId', homeController.deleteExpectedBill);
router.post('/:homeId/finance/bills/pay/:billId', homeController.payBill);
router.post('/:homeId/finance/income', homeController.addIncome);
router.post('/:homeId/finance/savings-goals', homeController.addSavingsGoal);
router.post('/:homeId/finance/savings-goals/:goalId/add-funds', homeController.addFundsToSavingsGoal);
// ========================================================
// התיקון כאן: העברנו את הנתיב הספציפי הזה לפני הנתיבים הכלליים
router.put('/:homeId/finance/budgets', homeController.updateBudgets);
// ========================================================

// --- Gemini AI Integrations (Specific routes) ---
router.post('/:homeId/gemini/recipe-to-shopping', homeController.transformRecipeToShoppingList);
router.post('/:homeId/gemini/breakdown-task', homeController.breakdownComplexTask);

// --- Generic Item Routes (for Shopping and Tasks) ---
// These are last because their pattern is very general.
router.post('/:homeId/:listType/add', homeController.addItem);
router.put('/:homeId/:listType/:itemId', homeController.updateItem);
router.delete('/:homeId/:listType/:itemId', homeController.deleteItem);

module.exports = router;