const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// ניהול בתים
router.get('/', homeController.getHomes); // קבלת כל הבתים הזמינים (למסך הלוגין)
router.post('/', homeController.createHome); // יצירת בית חדש
router.post('/login', homeController.loginToHome); // התחברות לבית קיים (שונה ל-loginToHome)

// קבלת פרטי בית לפי מזהה (שונה ל-getHomeDetails)
router.get('/:homeId', homeController.getHomeDetails);

// ניהול פריטים (קניות ומשימות)
// הנתיב השתנה כדי להיות ספציפי יותר להוספה
router.post('/:homeId/:listType/add', homeController.addItem); 
router.put('/:homeId/:listType/:itemId', homeController.updateItem);
router.delete('/:homeId/:listType/:itemId', homeController.deleteItem);

// ניהול משתמשים
router.post('/:homeId/users/add', homeController.addUser); // הוספת משתמש לבית (שונה ל-addUser)
// שונה ל-POST כדי לאפשר העברת userName ב-body
router.post('/:homeId/users/remove', homeController.removeUser); // הסרת משתמש מהבית (שונה ל-removeUser)

// ניהול כספים
router.post('/:homeId/finance/bills/expected', homeController.addExpectedBill);
router.put('/:homeId/finance/bills/expected/:billId', homeController.updateExpectedBill);
router.delete('/:homeId/finance/bills/expected/:billId', homeController.deleteExpectedBill);
router.post('/:homeId/finance/bills/pay/:billId', homeController.payBill);
router.post('/:homeId/finance/income', homeController.addIncome);
router.post('/:homeId/finance/savings-goals', homeController.addSavingsGoal);
router.post('/:homeId/finance/savings-goals/:goalId/add-funds', homeController.addFundsToSavingsGoal);
router.put('/:homeId/finance/budgets', homeController.updateBudgets);
router.get('/:homeId/finance/summary/:year/:month', homeController.getUserMonthlyFinanceSummary);

// אינטגרציית Gemini AI
router.post('/:homeId/gemini/recipe-to-shopping', homeController.transformRecipeToShoppingList);
router.post('/:homeId/gemini/breakdown-task', homeController.breakdownComplexTask);

module.exports = router;