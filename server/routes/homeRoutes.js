const express = require('express');
const router = express.Router();
const {
  getHomes,
  createHome,
  getHomeByAccessCode,
  addItem,
  updateItem,
  deleteItem
} = require('../controllers/homeController');

// --- Basic Home Routes ---
router.get('/', getHomes);
router.post('/', createHome);
router.post('/login', getHomeByAccessCode);

// --- Item Routes (Shopping & Tasks) ---
// listType will be 'shopping' or 'tasks'
router.post('/:homeId/:listType', addItem);
router.put('/:homeId/:listType/:itemId', updateItem);
router.delete('/:homeId/:listType/:itemId', deleteItem);


// --- Finance Routes ---
router.post('/:homeId/finance/expected-bills', require('../controllers/homeController').addExpectedBill);
router.post('/:homeId/finance/pay-bill/:billId', require('../controllers/homeController').payBill);
router.post('/:homeId/finance/income', require('../controllers/homeController').addIncome);
router.put('/:homeId/finance/budgets', require('../controllers/homeController').updateBudgets);
router.post('/:homeId/finance/savings-goals', require('../controllers/homeController').addSavingsGoal);
router.put('/:homeId/finance/savings-goals/:goalId', require('../controllers/homeController').addToSavingsGoal);

module.exports = router;