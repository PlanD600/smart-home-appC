const express = require('express');
const router = express.Router();

// [FIXED] Importing ALL the controllers we created.
const homeController = require('../controllers/homeController');
const userController = require('../controllers/userController');
const listController = require('../controllers/listController');
const financeController = require('../controllers/financeController');
const templateController = require('../controllers/templateController');
const aiController = require('../controllers/aiController');
const archiveController = require('../controllers/archiveController');

// --- General Routes ---
router.post('/home', homeController.createHome);
router.get('/homes', homeController.getHomes);
router.post('/home/login', homeController.loginToHome);

// --- User Management ---
router.post('/home/:homeId/users', userController.addUser);
router.delete('/home/:homeId/users', userController.removeUser);

// --- List Management & Archive ---
router.post('/home/:homeId/lists/:listType', listController.addItemToList);
router.put('/home/:homeId/lists/:listType/:itemId', listController.updateItemInList);
router.post('/home/:homeId/lists/:listType/clear-completed', listController.clearCompletedItems);
router.post('/home/:homeId/lists/:listType/:itemId/archive', archiveController.archiveItem);
router.delete('/home/:homeId/lists/:listType/:itemId', listController.deleteItemPermanently);
router.delete('/home/:homeId/lists/:listType/clear', listController.clearList);

// --- Archive Management ---
router.post('/home/:homeId/archive/:itemId/restore', archiveController.restoreItem);
router.delete('/home/:homeId/archive/:itemId', archiveController.deleteArchivedItem);
router.delete('/home/:homeId/archive', archiveController.clearArchive);

// --- Finance Management ---
router.get('/home/:homeId/finances/summary/:year/:month', financeController.getUserMonthlyFinanceSummary);
router.post('/home/:homeId/finances/bills', financeController.addExpectedBill);
router.put('/home/:homeId/finances/bills/:billId', financeController.updateExpectedBill);
router.delete('/home/:homeId/finances/bills/:billId', financeController.deleteExpectedBill);
router.post('/home/:homeId/finances/bills/:billId/pay', financeController.payBill);
router.post('/home/:homeId/finances/income', financeController.addIncome);
router.post('/home/:homeId/finances/savings-goals', financeController.addSavingsGoal);
router.patch('/home/:homeId/finances/savings-goals/:goalId/add-funds', financeController.addFundsToSavingsGoal);
router.put('/home/:homeId/finances/budgets', financeController.updateBudgets);

// --- Template Management ---
router.put('/home/:homeId/templates', templateController.saveTemplates);

// --- AI Integrations ---
router.post('/home/:homeId/ai/transform-recipe', aiController.transformRecipeToShoppingList);
router.post('/home/:homeId/ai/breakdown-task', aiController.breakdownComplexTask);

// --- General Home Details & Updates (should be last) ---
router.get('/home/:homeId', homeController.getHomeDetails);
router.put('/home/:homeId', homeController.updateHome);

module.exports = router;
