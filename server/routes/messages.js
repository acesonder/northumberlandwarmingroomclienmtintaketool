const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Send message
router.post('/', (req, res) => {
  const { recipient_id, case_id, client_id, subject, message, priority } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  if (!recipient_id && !case_id) {
    return res.status(400).json({ error: 'Either recipient_id or case_id must be provided' });
  }

  const messageId = uuidv4();
  const sql = `
    INSERT INTO messages (
      id, sender_id, recipient_id, case_id, client_id,
      subject, message, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    messageId, req.user.id, recipient_id, case_id, client_id,
    subject, message, priority || 'normal'
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to send message', message: err.message });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      message_id: messageId
    });
  });
});

// Get messages (inbox)
router.get('/inbox', (req, res) => {
  const { is_read } = req.query;
  let sql = `
    SELECT m.*, u.full_name as sender_name, u.username as sender_username
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.recipient_id = ?
  `;
  const params = [req.user.id];

  if (is_read !== undefined) {
    sql += ' AND m.is_read = ?';
    params.push(is_read === 'true' ? 1 : 0);
  }

  sql += ' ORDER BY m.sent_at DESC';

  db.all(sql, params, (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch messages', message: err.message });
    }

    res.json({ messages, count: messages.length });
  });
});

// Get sent messages
router.get('/sent', (req, res) => {
  const sql = `
    SELECT m.*, u.full_name as recipient_name, u.username as recipient_username
    FROM messages m
    LEFT JOIN users u ON m.recipient_id = u.id
    WHERE m.sender_id = ?
    ORDER BY m.sent_at DESC
  `;

  db.all(sql, [req.user.id], (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch sent messages', message: err.message });
    }

    res.json({ messages, count: messages.length });
  });
});

// Get messages for a case
router.get('/case/:case_id', (req, res) => {
  const sql = `
    SELECT m.*, u.full_name as sender_name, u.username as sender_username
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.case_id = ?
    ORDER BY m.sent_at DESC
  `;

  db.all(sql, [req.params.case_id], (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch case messages', message: err.message });
    }

    res.json({ messages, count: messages.length });
  });
});

// Get message by ID
router.get('/:id', (req, res) => {
  const sql = `
    SELECT m.*, u.full_name as sender_name, u.username as sender_username
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.id = ? AND (m.sender_id = ? OR m.recipient_id = ?)
  `;

  db.get(sql, [req.params.id, req.user.id, req.user.id], (err, message) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }

    if (!message) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Mark as read if recipient is viewing
    if (message.recipient_id === req.user.id && !message.is_read) {
      const updateSql = 'UPDATE messages SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ?';
      db.run(updateSql, [req.params.id]);
      message.is_read = 1;
    }

    res.json({ message });
  });
});

// Mark message as read
router.patch('/:id/read', (req, res) => {
  const sql = `
    UPDATE messages
    SET is_read = 1, read_at = CURRENT_TIMESTAMP
    WHERE id = ? AND recipient_id = ?
  `;

  db.run(sql, [req.params.id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to mark message as read', message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message marked as read' });
  });
});

// Get unread count
router.get('/inbox/unread/count', (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = 0';

  db.get(sql, [req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get unread count', message: err.message });
    }

    res.json({ unread_count: result.count });
  });
});

module.exports = router;
