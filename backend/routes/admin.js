const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All admin routes require authenticated admin
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// Menu Management
router.get('/menu', adminController.getAllMenuItems);
router.post('/menu', adminController.createMenuItem);
router.put('/menu/:id', adminController.updateMenuItem);
router.delete('/menu/:id', adminController.deleteMenuItem);

// Live Dashboard (real-time order counts, item-wise breakdown totals, and student order lists)
router.get('/dashboard', adminController.getLiveDashboard);

// Daily Summary Report (static summary reports for order reconciliation)
router.get('/reports/daily', adminController.getDailyReport);

// Update order status (counter verification)
router.patch('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
