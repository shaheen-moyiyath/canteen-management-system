const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'canteen_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000
};

let dbMode = 'mysql'; // 'mysql' or 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

// SQLite compatibility wrapper
class SQLitePool {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      // Normalize MySQL specific dialect differences if any
      let normalizedSql = sql.trim();
      const isSelect = /^(SELECT|PRAGMA|SHOW|DESCRIBE)/i.test(normalizedSql);

      if (isSelect) {
        this.db.all(normalizedSql, params, (err, rows) => {
          if (err) return reject(err);
          resolve([rows || []]);
        });
      } else {
        this.db.run(normalizedSql, params, function (err) {
          if (err) return reject(err);
          resolve([
            {
              insertId: this.lastID,
              affectedRows: this.changes,
            },
          ]);
        });
      }
    });
  }

  async execute(sql, params = []) {
    return this.query(sql, params);
  }

  async getConnection() {
    const self = this;
    return {
      async query(sql, params = []) {
        return self.query(sql, params);
      },
      async execute(sql, params = []) {
        return self.query(sql, params);
      },
      async beginTransaction() {
        return self.query('BEGIN TRANSACTION');
      },
      async commit() {
        return self.query('COMMIT');
      },
      async rollback() {
        return self.query('ROLLBACK');
      },
      release() {}
    };
  }
}

const db = {
  getMode: () => dbMode,

  async query(sql, params = []) {
    if (dbMode === 'mysql' && mysqlPool) {
      return mysqlPool.query(sql, params);
    }
    return sqliteDb.query(sql, params);
  },

  async execute(sql, params = []) {
    if (dbMode === 'mysql' && mysqlPool) {
      return mysqlPool.execute(sql, params);
    }
    return sqliteDb.execute(sql, params);
  },

  async getConnection() {
    if (dbMode === 'mysql' && mysqlPool) {
      return mysqlPool.getConnection();
    }
    return sqliteDb.getConnection();
  }
};

async function initDB() {
  // First try MySQL connection
  try {
    const tempPool = mysql.createPool({
      ...DB_CONFIG,
      database: undefined // connect without DB first to ensure canteen_db exists
    });

    const conn = await tempPool.getConnection();
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`;`);
    conn.release();
    await tempPool.end();

    mysqlPool = mysql.createPool(DB_CONFIG);
    const testConn = await mysqlPool.getConnection();
    testConn.release();

    dbMode = 'mysql';
    console.log(`[Database] Connected successfully to MySQL (${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database})`);

    // Run schema migrations for MySQL
    await runMySQLMigrations(mysqlPool);
    await seedDefaultData(db);
    return;
  } catch (err) {
    console.warn(`[Database] MySQL connection failed (${err.code || err.message}).`);
    console.warn(`[Database] Enabling automatic SQLite fallback mode so application is immediately functional.`);

    dbMode = 'sqlite';
    const sqlitePath = path.join(__dirname, '..', 'database', 'canteen.sqlite');
    sqliteDb = new SQLitePool(sqlitePath);

    await runSQLiteMigrations(sqliteDb);
    await seedDefaultData(db);
    console.log(`[Database] SQLite fallback active at ${sqlitePath}`);
  }
}

async function runMySQLMigrations(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      college_id VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      item_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description VARCHAR(255),
      price DECIMAL(10, 2) NOT NULL,
      is_available TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      order_date DATE NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      item_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function runSQLiteMigrations(sqliteWrapper) {
  await sqliteWrapper.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      college_id TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sqliteWrapper.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      is_available INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sqliteWrapper.query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);

  await sqliteWrapper.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE RESTRICT
    );
  `);
}

async function seedDefaultData(dbClient) {
  try {
    const [users] = await dbClient.query('SELECT COUNT(*) as count FROM users');
    const userCount = users[0].count || users[0]['COUNT(*)'] || 0;

    if (parseInt(userCount, 10) === 0) {
      console.log('[Database] Seeding initial users and menu items...');
      const adminHash = '$2a$10$tWAkMbXYRk9/VcOV7SB3qOq.1efAmfGcLqtx0AsNK5927.4oJGhGW'; // admin123
      const studentHash = '$2a$10$qRXXVaS0qvGahk5b5QouTejefdBLbdDTG186q0tME4.s072ZrhUk.'; // student123

      await dbClient.query(`
        INSERT INTO users (name, college_id, password, role) VALUES
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?)
      `, [
        'Canteen Administrator', 'ADMIN01', adminHash, 'admin',
        'Muhammed Shaheen M', 'AZAYSCS032', studentHash, 'student',
        'Sainul Ashiqu N', 'AZAYSCS043', studentHash, 'student',
        'Rayan Ramzan Kollappatta', 'AZAYSCS038', studentHash, 'student',
        'Muhammed Nihal NK', 'AZAYSCS029', studentHash, 'student',
        'Sinan Khan K', 'AZAYSCS049', studentHash, 'student'
      ]);
    }

    const [items] = await dbClient.query('SELECT COUNT(*) as count FROM menu_items');
    const itemCount = items[0].count || items[0]['COUNT(*)'] || 0;

    if (parseInt(itemCount, 10) === 0) {
      const sampleItems = [
        ['Veg Thali Meals', 'Authentic South Indian lunch served with rice, sambar, rasam, avial, thoran, pickle & papad', 70.00, 1],
        ['Malabar Chicken Biryani', 'Fragrant kaima rice dum biryani cooked with tender spiced chicken, egg, raita & pickle', 130.00, 1],
        ['Ghee Rice & Chicken Curry', 'Aromatic roasted ghee rice served with rich spicy Malabar chicken gravy', 120.00, 1],
        ['Fish Curry Meals', 'Traditional Kerala red fish curry meal served with hot steamed rice and sides', 95.00, 1],
        ['Egg Fried Rice & Chilli Sauce', 'Wok-tossed rice with fresh farm eggs, vegetables and spring onion', 90.00, 1],
        ['Kerala Parotta (2 pcs) with Beef Curry', 'Layered flaky Malabar parottas served with tender slow-cooked spicy beef roast', 110.00, 1],
        ['Fresh Lime Juice', 'Refreshing chilled sweet and salted fresh mint lime juice', 25.00, 1],
        ['Hot Masala Tea & Parippuvada', 'Strong cardamom tea served with traditional crispy lentil fritter', 20.00, 1]
      ];

      for (const item of sampleItems) {
        await dbClient.query(
          'INSERT INTO menu_items (name, description, price, is_available) VALUES (?, ?, ?, ?)',
          item
        );
      }
    }
  } catch (seedErr) {
    console.error('[Database] Seeding error:', seedErr);
  }
}

module.exports = {
  db,
  initDB
};
