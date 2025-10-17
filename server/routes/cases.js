const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Create new case
router.post('/', authorizeRoles('admin', 'staff'), (req, res) => {
  const { client_id, title, description, priority } = req.body;

  if (!client_id || !title) {
    return res.status(400).json({ error: 'Client ID and title are required' });
  }

  const caseId = uuidv4();
  const sql = `
    INSERT INTO cases (id, client_id, case_manager_id, title, description, priority)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [caseId, client_id, req.user.id, title, description, priority || 'medium'], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create case', message: err.message });
    }

    res.status(201).json({
      message: 'Case created successfully',
      case_id: caseId
    });
  });
});

// Get all cases
router.get('/', (req, res) => {
  const { client_id, status, priority, case_manager_id } = req.query;
  let sql = `
    SELECT c.*, u.full_name as case_manager_name, cl.first_name, cl.last_name
    FROM cases c
    JOIN users u ON c.case_manager_id = u.id
    JOIN clients cl ON c.client_id = cl.id
    WHERE 1=1
  `;
  const params = [];

  if (client_id) {
    sql += ' AND c.client_id = ?';
    params.push(client_id);
  }

  if (status) {
    sql += ' AND c.status = ?';
    params.push(status);
  }

  if (priority) {
    sql += ' AND c.priority = ?';
    params.push(priority);
  }

  if (case_manager_id) {
    sql += ' AND c.case_manager_id = ?';
    params.push(case_manager_id);
  }

  sql += ' ORDER BY c.opened_at DESC';

  db.all(sql, params, (err, cases) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch cases', message: err.message });
    }

    res.json({ cases, count: cases.length });
  });
});

// Get case by ID with notes
router.get('/:id', (req, res) => {
  const caseSql = `
    SELECT c.*, u.full_name as case_manager_name, cl.first_name, cl.last_name, cl.phone, cl.email
    FROM cases c
    JOIN users u ON c.case_manager_id = u.id
    JOIN clients cl ON c.client_id = cl.id
    WHERE c.id = ?
  `;

  const notesSql = `
    SELECT cn.*, u.full_name as author_name
    FROM case_notes cn
    JOIN users u ON cn.author_id = u.id
    WHERE cn.case_id = ?
    ORDER BY cn.created_at DESC
  `;

  db.get(caseSql, [req.params.id], (err, caseData) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    db.all(notesSql, [req.params.id], (err, notes) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch notes', message: err.message });
      }

      res.json({ case: caseData, notes });
    });
  });
});

// Update case
router.put('/:id', authorizeRoles('admin', 'staff'), (req, res) => {
  const { title, description, priority, status, case_manager_id } = req.body;

  const updates = [];
  const params = [];

  if (title) {
    updates.push('title = ?');
    params.push(title);
  }

  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }

  if (priority) {
    updates.push('priority = ?');
    params.push(priority);
  }

  if (status) {
    updates.push('status = ?');
    params.push(status);
    
    if (status === 'closed') {
      updates.push('closed_at = CURRENT_TIMESTAMP');
    }
  }

  if (case_manager_id) {
    updates.push('case_manager_id = ?');
    params.push(case_manager_id);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  const sql = `UPDATE cases SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update case', message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ message: 'Case updated successfully' });
  });
});

// Add note to case
router.post('/:id/notes', authorizeRoles('admin', 'staff'), (req, res) => {
  const { note, is_private } = req.body;

  if (!note) {
    return res.status(400).json({ error: 'Note content is required' });
  }

  const noteId = uuidv4();
  const sql = `
    INSERT INTO case_notes (id, case_id, author_id, note, is_private)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [noteId, req.params.id, req.user.id, note, is_private ? 1 : 0], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to add note', message: err.message });
    }

    res.status(201).json({
      message: 'Note added successfully',
      note_id: noteId
    });
  });
});

// Delete case
router.delete('/:id', authorizeRoles('admin'), (req, res) => {
  const sql = 'DELETE FROM cases WHERE id = ?';

  db.run(sql, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete case', message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ message: 'Case deleted successfully' });
  });
});

module.exports = router;
