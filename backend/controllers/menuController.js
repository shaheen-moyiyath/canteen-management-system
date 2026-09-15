const { db } = require('../config/db');

// GET /api/menu
// Fetches only available items for students/public
exports.getAvailableMenu = async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT item_id, name, description, price, is_available, created_at FROM menu_items WHERE is_available = 1 ORDER BY item_id ASC'
    );

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('getAvailableMenu error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve canteen menu items.'
    });
  }
};
