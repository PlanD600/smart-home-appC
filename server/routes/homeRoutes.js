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
router.put('/:homeId/finance/budgets', homeController.updateBudgets);


// --- The route that causes the 404 error ---
// We add a console.log here to see if it's even defined.
console.log("Defining PUT route for /:homeId/finance/budgets");
router.post('/:homeId/finance/budgets', homeController.updateBudgets);

// User Routes
router.post('/:homeId/users', homeController.addUser);

module.exports = router;