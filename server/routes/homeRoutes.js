const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

console.log("✅ homeRoutes.js file loaded successfully.");

// Basic Home Routes
router.get('/', homeController.getHomes);
router.post('/', homeController.createHome);
router.post('/login', homeController.getHomeByAccessCode);

// Item Routes
router.post('/:homeId/:listType', homeController.addItem);
router.put('/:homeId/:listType/:itemId', homeController.updateItem);
router.delete('/:homeId/:listType/:itemId', homeController.deleteItem);

// Finance Routes
router.post('/:homeId/finance/expected-bills', homeController.addExpectedBill);
router.delete('/:homeId/finance/expected-bills/:billId', homeController.deleteExpectedBill);
router.put('/:homeId/finance/expected-bills/:billId', homeController.updateExpectedBill);
router.post('/:homeId/finance/pay-bill/:billId', homeController.payBill);
router.post('/:homeId/finance/income', homeController.addIncome);
router.post('/:homeId/finance/savings-goals', homeController.addSavingsGoal);
router.put('/:homeId/finance/savings-goals/:goalId', homeController.addToSavingsGoal);
router.get('/:homeId/finances/user-summary/:year/:month', homeController.getUserMonthlyFinanceSummary);

// Route for updating budgets
// The client-side (BudgetForm) is designed to send the full list of categories,
// so PUT is the appropriate method for a full replacement/update of the collection.
router.put('/:homeId/finance/budgets', homeController.updateBudgets);

// Remove the problematic POST route for budgets to avoid conflicts.
// The previous console.log and comment about 404 error suggested this route was causing issues.
// router.post('/:homeId/finance/budgets', homeController.updateBudgets); // REMOVED

// User Routes
router.post('/:homeId/users', homeController.addUser);
router.delete('/:homeId/users/:userName', homeController.removeUser);

module.exports = router;