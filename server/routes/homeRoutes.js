const express = require('express');
const router = express.Router();

// --- Import all the new controllers ---
const homeController = require('../controllers/homeController');
const userController = require('../controllers/userController');
const listController = require('../controllers/listController');
const financeController = require('../controllers/financeController');
const templateController = require('../controllers/templateController');
const aiController = require('../controllers/aiController');

// --- Home Management Routes ---
// Base routes for creating, listing, and logging into homes.
router.post('/', homeController.createHome);
router.get('/', homeController.getHomes);
router.post('/login', homeController.loginToHome);

// --- Specific Home Routes (prefixed with /:homeId) ---
// These routes operate on a specific home context.
const homeRouter = express.Router({ mergeParams: true });

// User Management in a specific home
homeRouter.post('/users', userController.addUser);
homeRouter.delete('/users', userController.removeUser);

// List Management (Shopping & Tasks) in a specific home
homeRouter.post('/:listType', listController.addItemToList);
homeRouter.put('/:listType/:itemId', listController.updateItemInList);
homeRouter.delete('/:listType/:itemId', listController.deleteItemFromList);
homeRouter.post('/:listType/clear-completed', listController.clearCompletedItems);

// Finance Management in a specific home
homeRouter.get('/finances/summary/:year/:month', financeController.getUserMonthlyFinanceSummary);
homeRouter.post('/finances/bills', financeController.addExpectedBill);
homeRouter.put('/finances/bills/:billId', financeController.updateExpectedBill);
homeRouter.delete('/finances/bills/:billId', financeController.deleteExpectedBill);
homeRouter.post('/finances/bills/:billId/pay', financeController.payBill);
homeRouter.post('/finances/income', financeController.addIncome);
homeRouter.post('/finances/savings-goals', financeController.addSavingsGoal);
homeRouter.patch('/finances/savings-goals/:goalId/add-funds', financeController.addFundsToSavingsGoal);
homeRouter.put('/finances/budgets', financeController.updateBudgets);

// Template Management in a specific home
homeRouter.put('/templates', templateController.saveTemplates);

// AI Integrations for a specific home
homeRouter.post('/ai/transform-recipe', aiController.transformRecipeToShoppingList);
homeRouter.post('/ai/breakdown-task', aiController.breakdownComplexTask);

// General Home Details & Updates
homeRouter.get('/', homeController.getHomeDetails);
homeRouter.put('/', homeController.updateHome);


// Mount the specific home router under the /:homeId parameter
router.use('/:homeId', homeRouter);

module.exports = router;
