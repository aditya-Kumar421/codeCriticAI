const express = require('express');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Get statistics about stored interactions
router.get('/stats', adminController.getStats);

// Get recent interactions with pagination
router.get('/interactions', adminController.getRecentInteractions);

// Get interactions by specific IP
router.get('/interactions/ip/:ip', adminController.getInteractionsByIP);

module.exports = router;