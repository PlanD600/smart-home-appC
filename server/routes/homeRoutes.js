const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Home Management
router.get('/', homeController.getHomes); // Get all available homes (for initial login screen)
router.post('/', homeController.createHome); // Create a new home
router.post('/login', homeController.loginHome); // Login to an existing home

// NEW: Get home details by ID (for re-login/refreshing data)
router.get('/:homeId', homeController.getHomeById);

// Item Management (Shopping & Tasks)
router.post('/:homeId/:listType', homeController.addItem);
router.put('/:homeId/:listType/:itemId', homeController.updateItem);
router.delete('/:homeId/:listType/:itemId', homeController.deleteItem);

// User Management
router.post('/:homeId/users', homeController.addUserToHome);
router.delete('/:homeId/users/:userName', homeController.removeUserFromHome);

// Finance Management
router.post('/:homeId/finance/bills/expected', homeController.addExpectedBill);
router.put('/:homeId/finance/bills/expected/:billId', homeController.updateExpectedBill);
router.delete('/:homeId/finance/bills/expected/:billId', homeController.deleteExpectedBill);
router.post('/:homeId/finance/bills/pay/:billId', homeController.payBill);
router.post('/:homeId/finance/income', homeController.addIncome);
router.post('/:homeId/finance/savings-goals', homeController.addSavingsGoal);
router.post('/:homeId/finance/savings-goals/:goalId/add-funds', homeController.addFundsToSavingsGoal);
router.put('/:homeId/finance/budgets', homeController.updateBudgets); // Updated to PUT
router.get('/:homeId/finance/summary/:year/:month', homeController.getUserMonthlyFinanceSummary);

// Gemini AI Integration
router.post('/:homeId/gemini/recipe-to-shopping', homeController.transformRecipeToShoppingList);
router.post('/:homeId/gemini/breakdown-task', homeController.breakdownComplexTask);


module.exports = router;