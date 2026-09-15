const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /api/menu (Fetch items where is_available = 1)
router.get('/', menuController.getAvailableMenu);

module.exports = router;
