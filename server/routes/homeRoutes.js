const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController'); // ייבוא הקונטרולר

/**
 * @file homeRoutes.js
 * @description Defines API routes for home management, linking them to controller functions.
 */

// יצירת בית חדש
router.post('/', homeController.createHome);

// אחזור כל הבתים
router.get('/', homeController.getHomes);

// אחזור בית לפי ID
router.get('/:id', homeController.getHomeById);

// עדכון בית לפי ID
router.put('/:id', homeController.updateHome);

// מחיקת בית לפי ID
router.delete('/:id', homeController.deleteHome);

module.exports = router;
