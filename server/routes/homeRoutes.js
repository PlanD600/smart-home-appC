// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/server/routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const {
    getHomes,
    createHome,
    getHomeById,
    updateHome,
    deleteHome,
    addTask,
    updateTask,
    addShoppingItem,
    updateShoppingItem,
    addSubItem,
    updateSubItem,
    deleteSubItem,
    updateFinance,
} = require('../controllers/homeController.js');

// Base routes for homes
router.route('/').get(getHomes).post(createHome);
router.route('/:id').get(getHomeById).put(updateHome).delete(deleteHome);

// Task routes
router.route('/:id/tasks').post(addTask);
router.route('/:id/tasks/:taskId').put(updateTask); // Note: delete is handled by updating the home document

// Shopping routes
router.route('/:id/shopping-list').post(addShoppingItem);
router.route('/:id/shopping-list/:itemId').put(updateShoppingItem);

// Sub-item routes
router.route('/:homeId/shopping-list/:itemId/sub-items').post(addSubItem);
router.route('/:homeId/shopping-list/:itemId/sub-items/:subItemId').put(updateSubItem).delete(deleteSubItem);

// Finance routes
router.route('/:id/finance').put(updateFinance);

module.exports = router;