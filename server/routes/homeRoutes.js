// server/routes/homeRoutes.js

const express = require('express');
const router = express.Router();

// נייבא את כל הקונטרולר כאובייקט אחד
const homeController = require('../controllers/homeController');

// ונקרא לפונקציות דרך האובייקט הזה
router.route('/')
    .get(homeController.getHomes)
    .post(homeController.createHome);

router.route('/:id')
    .get(homeController.getHomeById);

// Shopping List Routes
router.route('/:id/shopping-list')
    .post(homeController.createShoppingItem);

router.route('/:id/shopping-list/:itemId')
    .put(homeController.updateShoppingItem) // שימוש מפורש בפונקציה מהאובייקט
    .delete(homeController.deleteShoppingItem);

// Task List Routes
router.route('/:id/tasks')
    .post(homeController.createTask);

router.route('/:id/tasks/:taskId')
    .put(homeController.updateTask) // שימוש מפורש בפונקציה מהאובייקט
    .delete(homeController.deleteTask);

module.exports = router;