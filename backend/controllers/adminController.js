const { db } = require('../config/db');

// GET /api/admin/menu
// Retrieve all items (available & unavailable)
exports.getAllMenuItems = async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT item_id, name, description, price, is_available, created_at FROM menu_items ORDER BY item_id DESC'
    );

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('getAllMenuItems error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch all menu items.' });
  }
};

// POST /api/admin/menu
// Create a new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, is_available = 1 } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item name and price are required.'
      });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number.'
      });
    }

    const [result] = await db.query(
      'INSERT INTO menu_items (name, description, price, is_available) VALUES (?, ?, ?, ?)',
      [name.trim(), description ? description.trim() : null, numericPrice.toFixed(2), is_available ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully.',
      item_id: result.insertId
    });
  } catch (error) {
    console.error('createMenuItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to create menu item.' });
  }
};

// PUT /api/admin/menu/:id
// Update an existing menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, is_available } = req.body;

    const [existing] = await db.query('SELECT item_id FROM menu_items WHERE item_id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description.trim());
    }
    if (price !== undefined) {
      const num = parseFloat(price);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ success: false, message: 'Invalid price value.' });
      }
      updates.push('price = ?');
      values.push(num.toFixed(2));
    }
    if (is_available !== undefined) {
      updates.push('is_available = ?');
      values.push(is_available ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    values.push(id);
    await db.query(`UPDATE menu_items SET ${updates.join(', ')} WHERE item_id = ?`, values);

    res.json({
      success: true,
      message: 'Menu item updated successfully.'
    });
  } catch (error) {
    console.error('updateMenuItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to update menu item.' });
  }
};

// DELETE /api/admin/menu/:id
// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item has order history
    const [orderRef] = await db.query(
      'SELECT order_item_id FROM order_items WHERE item_id = ? LIMIT 1',
      [id]
    );

    if (orderRef && orderRef.length > 0) {
      // Soft-delete by setting is_available = 0 to protect historic order records
      await db.query('UPDATE menu_items SET is_available = 0 WHERE item_id = ?', [id]);
      return res.json({
        success: true,
        message: 'Menu item has previous order records; marked as unavailable instead of deleting.'
      });
    }

    await db.query('DELETE FROM menu_items WHERE item_id = ?', [id]);
    res.json({
      success: true,
      message: 'Menu item deleted successfully.'
    });
  } catch (error) {
    console.error('deleteMenuItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete menu item.' });
  }
};

// GET /api/admin/dashboard
// Live dashboard API returning real-time order counts, item-wise breakdown totals, and student order lists
exports.getLiveDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Overall stats for today
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
       FROM orders 
       WHERE order_date = ?`,
      [today]
    );

    // 2. Item-wise breakdown tally for today (e.g., "Veg Thali: 52", "Chicken Biryani: 35")
    const [itemTally] = await db.query(
      `SELECT 
        m.item_id,
        m.name,
        COALESCE(SUM(oi.quantity), 0) as total_quantity,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_sales
       FROM menu_items m
       LEFT JOIN order_items oi ON m.item_id = oi.item_id
       LEFT JOIN orders o ON oi.order_id = o.order_id AND o.order_date = ? AND o.status != 'cancelled'
       GROUP BY m.item_id, m.name
       ORDER BY total_quantity DESC, m.name ASC`,
      [today]
    );

    // 3. Detailed student orders for counter verification
    const [studentOrders] = await db.query(
      `SELECT 
        o.order_id,
        o.user_id,
        u.name as student_name,
        u.college_id,
        o.order_date,
        o.total_amount,
        o.status,
        o.created_at
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       WHERE o.order_date = ?
       ORDER BY o.created_at DESC`,
      [today]
    );

    // Fetch items for each of today's orders
    let populatedOrders = [];
    if (studentOrders.length > 0) {
      const orderIds = studentOrders.map(o => o.order_id);
      const placeholders = orderIds.map(() => '?').join(',');

      const [items] = await db.query(
        `SELECT oi.order_id, oi.item_id, oi.quantity, oi.unit_price, m.name as item_name
         FROM order_items oi
         JOIN menu_items m ON oi.item_id = m.item_id
         WHERE oi.order_id IN (${placeholders})`,
        orderIds
      );

      const itemsByOrder = {};
      items.forEach(item => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      });

      populatedOrders = studentOrders.map(order => ({
        ...order,
        items: itemsByOrder[order.order_id] || []
      }));
    }

    res.json({
      success: true,
      date: today,
      stats: {
        total_orders: parseInt(stats[0]?.total_orders || 0, 10),
        total_revenue: parseFloat(stats[0]?.total_revenue || 0).toFixed(2),
        pending_count: parseInt(stats[0]?.pending_count || 0, 10),
        completed_count: parseInt(stats[0]?.completed_count || 0, 10),
        cancelled_count: parseInt(stats[0]?.cancelled_count || 0, 10)
      },
      item_tally: itemTally.map(t => ({
        item_id: t.item_id,
        name: t.name,
        total_quantity: parseInt(t.total_quantity || 0, 10),
        total_sales: parseFloat(t.total_sales || 0).toFixed(2)
      })),
      orders: populatedOrders
    });
  } catch (error) {
    console.error('getLiveDashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load live dashboard data.' });
  }
};

// GET /api/admin/reports/daily
// Generate daily static summary reports for order reconciliation
exports.getDailyReport = async (req, res) => {
  try {
    const reportDate = req.query.date || new Date().toISOString().split('T')[0];

    // 1. Overall day summary
    const [daySummary] = await db.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
       FROM orders 
       WHERE order_date = ?`,
      [reportDate]
    );

    // 2. Item-wise sales breakdown for this date
    const [itemSales] = await db.query(
      `SELECT 
        m.item_id,
        m.name as item_name,
        m.price as current_price,
        SUM(oi.quantity) as quantity_sold,
        SUM(oi.quantity * oi.unit_price) as revenue_generated
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       JOIN menu_items m ON oi.item_id = m.item_id
       WHERE o.order_date = ? AND o.status != 'cancelled'
       GROUP BY m.item_id, m.name, m.price
       ORDER BY quantity_sold DESC`,
      [reportDate]
    );

    // 3. Complete list of student orders on this date for audit & reconciliation
    const [ordersList] = await db.query(
      `SELECT 
        o.order_id,
        u.name as student_name,
        u.college_id,
        o.total_amount,
        o.status,
        o.created_at
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       WHERE o.order_date = ?
       ORDER BY o.order_id ASC`,
      [reportDate]
    );

    res.json({
      success: true,
      report_date: reportDate,
      generated_at: new Date().toISOString(),
      summary: {
        total_orders: parseInt(daySummary[0]?.total_orders || 0, 10),
        total_revenue: parseFloat(daySummary[0]?.total_revenue || 0).toFixed(2),
        completed_orders: parseInt(daySummary[0]?.completed_orders || 0, 10),
        pending_orders: parseInt(daySummary[0]?.pending_orders || 0, 10),
        cancelled_orders: parseInt(daySummary[0]?.cancelled_orders || 0, 10)
      },
      item_breakdown: itemSales.map(i => ({
        item_id: i.item_id,
        name: i.item_name,
        quantity_sold: parseInt(i.quantity_sold || 0, 10),
        revenue_generated: parseFloat(i.revenue_generated || 0).toFixed(2)
      })),
      orders: ordersList
    });
  } catch (error) {
    console.error('getDailyReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate daily reconciliation report.' });
  }
};

// PATCH /api/admin/orders/:id/status
// Update order status (pending, completed, cancelled)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({
      success: true,
      message: `Order #${id} status updated to "${status}".`
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};
