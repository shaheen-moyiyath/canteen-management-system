const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// All order routes require authentication
router.use(authenticateToken);

// POST /api/orders (Submit daily order)
router.post('/', orderController.createOrder);

// GET /api/orders/history (Fetch past orders for student)
router.get('/history', orderController.getOrderHistory);

module.exports = router;
