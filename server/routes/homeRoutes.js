// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/server/routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const {
    getHomes, createHome, getHomeById, loginHome,
    addTask, updateTask, deleteTask,
    addShoppingItem, updateShoppingItem, deleteShoppingItem, // Assuring these are included
    addUserToHome, removeUserFromHome,
    addCategory,
    updateFinances,
} = require('../controllers/homeController.js');

// --- Primary Routes ---
router.route('/').get(getHomes).post(createHome);
router.route('/login').post(loginHome);
router.route('/:id').get(getHomeById); // This is the route that likely caused the error

// --- Sub-document Routes ---
// Task routes
router.route('/:id/tasks').post(addTask);
router.route('/:id/tasks/:taskId').put(updateTask).delete(deleteTask);

// Shopping routes
router.route('/:id/shopping-list').post(addShoppingItem);
router.route('/:id/shopping-list/:itemId').put(updateShoppingItem).delete(deleteShoppingItem);

// User management routes
router.route('/:id/users').post(addUserToHome);
router.route('/:id/users/remove').post(removeUserFromHome);

// Category management routes
router.route('/:id/categories').post(addCategory);

// Finance management route
router.route('/:id/finances').put(updateFinances);

module.exports = router;