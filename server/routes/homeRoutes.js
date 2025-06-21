// server/routes/homeRoutes.js

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// --- Home Management ---
router.post('/', homeController.createHome);
router.get('/', homeController.getHomes);
router.post('/login', homeController.loginToHome);
router.get('/:homeId', homeController.getHomeDetails);

// --- User Management ---
router.post('/:homeId/users', homeController.addUser);
router.delete('/:homeId/users', homeController.removeUser);

// --- Finance Routes ---
router.get('/:homeId/finances/summary/:year/:month', homeController.getUserMonthlyFinanceSummary);
router.post('/:homeId/bills/expected', homeController.addExpectedBill); // נתיב נכון, השני נמחק
router.put('/:homeId/finances/expected-bills/:billId', homeController.updateExpectedBill);
router.delete('/:homeId/finances/expected-bills/:billId', homeController.deleteExpectedBill);
router.post('/:homeId/finances/pay-bill/:billId', homeController.payBill);
router.post('/:homeId/finances/income', homeController.addIncome);
router.post('/:homeId/finances/savings-goals', homeController.addSavingsGoal);
router.patch('/:homeId/finances/savings-goals/:goalId/add-funds', homeController.addFundsToSavingsGoal);
router.put('/:homeId/finances/budgets', homeController.updateBudgets);

// --- Gemini AI Integrations ---
router.post('/:homeId/ai/transform-recipe', homeController.transformRecipeToShoppingList);
router.post('/:homeId/ai/breakdown-task', homeController.breakdownComplexTask);

// --- Generic Item Routes (for Shopping and Tasks) ---
router.post('/:homeId/:listType', homeController.addItemToList);
router.put('/:homeId/:listType/:itemId', homeController.updateItemInList);
router.delete('/:homeId/:listType/:itemId', homeController.deleteItemFromList);
router.post('/:homeId/:listType/clear-completed', homeController.clearCompletedItems);

router.put('/:homeId/templates', homeController.saveTemplates);
router.put('/:homeId', homeController.updateHome);

module.exports = router;