const { db } = require('../config/db');

// POST /api/orders
// Submit order with selected items and calculated total amount
exports.createOrder = async (req, res) => {
  const userId = req.user.user_id;
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'An order must contain at least one item.'
    });
  }

  // Validate quantities
  for (const item of items) {
    if (!item.item_id || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item_id or quantity specified.'
      });
    }
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Fetch and verify current item prices and availability from DB
    const itemIds = items.map(i => i.item_id);
    const placeholders = itemIds.map(() => '?').join(',');

    const [dbItems] = await conn.query(
      `SELECT item_id, name, price, is_available FROM menu_items WHERE item_id IN (${placeholders})`,
      itemIds
    );

    const itemMap = new Map();
    dbItems.forEach(item => itemMap.set(item.item_id, item));

    let totalAmount = 0;
    const verifiedOrderItems = [];

    for (const orderItem of items) {
      const foundItem = itemMap.get(orderItem.item_id);

      if (!foundItem) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({
          success: false,
          message: `Menu item with ID ${orderItem.item_id} does not exist.`
        });
      }

      if (!foundItem.is_available) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          success: false,
          message: `Item "${foundItem.name}" is currently unavailable.`
        });
      }

      const unitPrice = parseFloat(foundItem.price);
      const lineTotal = unitPrice * parseInt(orderItem.quantity, 10);
      totalAmount += lineTotal;

      verifiedOrderItems.push({
        item_id: foundItem.item_id,
        name: foundItem.name,
        quantity: parseInt(orderItem.quantity, 10),
        unit_price: unitPrice
      });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // Insert into orders table
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, order_date, total_amount, status) VALUES (?, ?, ?, ?)',
      [userId, todayDate, totalAmount.toFixed(2), 'pending']
    );

    const orderId = orderResult.insertId;

    // Insert into order_items table
    for (const item of verifiedOrderItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, item_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.item_id, item.quantity, item.unit_price]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        order_id: orderId,
        user_id: userId,
        order_date: todayDate,
        total_amount: totalAmount.toFixed(2),
        status: 'pending',
        items: verifiedOrderItems
      }
    });
  } catch (error) {
    try {
      await conn.rollback();
      conn.release();
    } catch (e) {}

    console.error('createOrder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order. Transaction rolled back.'
    });
  }
};

// GET /api/orders/history
// Fetch past orders for logged-in student
exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Query student orders
    const [orders] = await db.query(
      `SELECT order_id, order_date, total_amount, status, created_at 
       FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    if (orders.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const orderIds = orders.map(o => o.order_id);
    const placeholders = orderIds.map(() => '?').join(',');

    // Query order items
    const [items] = await db.query(
      `SELECT oi.order_item_id, oi.order_id, oi.item_id, oi.quantity, oi.unit_price, m.name as item_name
       FROM order_items oi
       JOIN menu_items m ON oi.item_id = m.item_id
       WHERE oi.order_id IN (${placeholders})`,
      orderIds
    );

    // Group items by order_id
    const itemsByOrder = {};
    items.forEach(item => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push(item);
    });

    const populatedOrders = orders.map(order => ({
      ...order,
      items: itemsByOrder[order.order_id] || []
    }));

    res.json({
      success: true,
      data: populatedOrders
    });
  } catch (error) {
    console.error('getOrderHistory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order history.'
    });
  }
};
