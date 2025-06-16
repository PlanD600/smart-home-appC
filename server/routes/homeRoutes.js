const express = require('express');
const router = express.Router();
const {
    getHomes,
    createHome,
    updateHome,
    deleteHome,
    createTask,
    updateTask,
    createShoppingItem,
    updateShoppingItem,
    createSubItem,
    updateSubItem,
    deleteSubItem,
    updateFinance,
} = require('../controllers/homeController');

// Home routes
router.route('/')
    .get(getHomes)
    .post(createHome);

router.route('/:id')
    .put(updateHome)
    .delete(deleteHome);

// Task routes
router.route('/:id/tasks')
    .post(createTask);

router.route('/:id/tasks/:taskId')
    .put(updateTask);

// Shopping list routes
router.route('/:id/shopping-list')
    .post(createShoppingItem);

router.route('/:id/shopping-list/:itemId')
    .put(updateShoppingItem);

// Sub-item routes
router.route('/:id/shopping-list/:itemId/sub-items')
    .post(createSubItem);

router.route('/:id/shopping-list/:itemId/sub-items/:subItemId')
    .put(updateSubItem)
    .delete(deleteSubItem);

// Finance routes
router.route('/:id/finance')
    .put(updateFinance);

module.exports = router;
