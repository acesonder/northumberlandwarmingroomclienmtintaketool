const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

// Register new user (admin only in production, open for demo)
router.post('/register', (req, res) => {
  const { username, email, password, role, full_name, organization } = req.body;

  if (!username || !email || !password || !role || !full_name) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const validRoles = ['admin', 'staff', 'service_provider'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const userId = uuidv4();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = `
    INSERT INTO users (id, username, email, password, role, full_name, organization)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [userId, username, email, hashedPassword, role, full_name, organization], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      return res.status(500).json({ error: 'Failed to register user', message: err.message });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        username,
        email,
        role,
        full_name,
        organization
      }
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';

  db.get(sql, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        organization: user.organization
      }
    });
  });
});

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  const sql = 'SELECT id, username, email, role, full_name, organization, created_at FROM users WHERE id = ?';

  db.get(sql, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  });
});

// Change password
router.post('/change-password', authenticateToken, (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  const getUserSql = 'SELECT password FROM users WHERE id = ?';

  db.get(getUserSql, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = bcrypt.compareSync(current_password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = bcrypt.hashSync(new_password, 10);
    const updateSql = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

    db.run(updateSql, [hashedPassword, req.user.id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to change password', message: err.message });
      }

      res.json({ message: 'Password changed successfully' });
    });
  });
});

module.exports = router;
