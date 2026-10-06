const { db, initDB } = require('./config/db');

async function viewDatabase() {
  try {
    await initDB();
    console.log('\n=================== 📊 CANTEEN DATABASE VIEWER ===================');
    console.log(`Database Mode: ${db.getMode().toUpperCase()}\n`);

    // 1. Users
    console.log('--- 👤 USERS TABLE ---');
    const [users] = await db.query('SELECT user_id, name, college_id, role, created_at FROM users');
    if (users && users.length > 0) {
      console.table(users);
    } else {
      console.log('No users found.');
    }

    // 2. Menu Items
    console.log('\n--- 🍽️ MENU ITEMS TABLE ---');
    const [items] = await db.query('SELECT item_id, name, price, is_available FROM menu_items');
    if (items && items.length > 0) {
      console.table(items);
    } else {
      console.log('No menu items found.');
    }

    // 3. Orders
    console.log('\n--- 📦 ORDERS TABLE ---');
    const [orders] = await db.query(`
      SELECT o.order_id, u.name as student_name, u.college_id, o.order_date, o.total_amount, o.status, o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      ORDER BY o.order_id DESC
      LIMIT 15
    `);
    if (orders && orders.length > 0) {
      console.table(orders);
    } else {
      console.log('No orders placed yet.');
    }

    console.log('\n===================================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error reading database:', error.message);
    process.exit(1);
  }
}

viewDatabase();
