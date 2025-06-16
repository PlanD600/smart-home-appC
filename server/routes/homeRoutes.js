const express = require('express');
const router = express.Router();
const {
    getHomes, createHome, getHomeData, loginHome,
    addItem, updateItem, deleteItem,
    archiveItem, restoreItem, deleteArchivedItem,
    addCategory, addSubItem, updateSubItem, deleteSubItem,
    generateListFromAI, payBill, updateBudgets,
    addUser, removeUser,
    createTemplate, updateTemplate, deleteTemplate
} = require('../controllers/homeController');

// The base for these routes is /api/homes (defined in server.js)

// --- Home Authentication & Management ---
router.route('/').get(getHomes).post(createHome); // GET /api/homes, POST /api/homes
router.post('/login', loginHome); // POST /api/homes/login
router.route('/:id').get(getHomeData); // GET /api/homes/some-id

// --- Item Management ---
router.post('/:id/items/:itemType', addItem); // POST /api/homes/some-id/items/shoppingItems
router.route('/:id/items/:itemType/:itemId')
    .put(updateItem)       // PUT /api/homes/some-id/items/shoppingItems/item-id
    .delete(deleteItem);   // DELETE /api/homes/some-id/items/shoppingItems/item-id

// --- Sub-Item Management ---
router.post('/:id/items/:itemType/:itemId/subitems', addSubItem);
router.route('/:id/items/:itemType/:itemId/subitems/:subItemId')
    .put(updateSubItem)
    .delete(deleteSubItem);

// --- Archive Management ---
router.post('/:id/items/:itemType/:itemId/archive', archiveItem);
router.post('/:id/archive/:itemType/:itemId/restore', restoreItem);
router.delete('/:id/archive/:itemType/:itemId', deleteArchivedItem);

// --- Category Management ---
router.post('/:id/categories/:itemType', addCategory);

// --- User Management ---
router.post('/:id/users', addUser);
router.delete('/:id/users/:username', removeUser);

// --- Template Management ---
router.route('/:id/templates').post(createTemplate);
router.route('/:id/templates/:templateId')
    .put(updateTemplate)
    .delete(deleteTemplate);

// --- Finance Management ---
router.post('/:id/finances/bills/:billId/pay', payBill);
router.put('/:id/finances/budgets', updateBudgets);

// --- AI Helper ---
router.post('/ai/generate-list', generateListFromAI); // Note: path changed slightly for clarity

module.exports = router;