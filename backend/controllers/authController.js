const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { college_id, password, role } = req.body;

    if (!college_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'College ID and password are required.'
      });
    }

    const [users] = await db.query(
      'SELECT user_id, name, college_id, password, role FROM users WHERE college_id = ?',
      [college_id.trim()]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid College ID or password.'
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid College ID or password.'
      });
    }

    // Optional client-side role validation
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized. User account role is "${user.role}", not "${role}".`
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        college_id: user.college_id,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        college_id: user.college_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, name, college_id, role, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

// POST /api/auth/register (Helper for quick registration)
exports.register = async (req, res) => {
  try {
    const { name, college_id, password, role = 'student' } = req.body;

    if (!name || !college_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, College ID, and password are required.'
      });
    }

    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE college_id = ?',
      [college_id.trim()]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this College ID is already registered.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'student';

    const [result] = await db.query(
      'INSERT INTO users (name, college_id, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), college_id.trim(), hashedPassword, assignedRole]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user_id: result.insertId
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user.'
    });
  }
};
