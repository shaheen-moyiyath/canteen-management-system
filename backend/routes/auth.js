const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register (Utility endpoint)
router.post('/register', authController.register);

// GET /api/auth/me
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
