const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Create new client
router.post('/', authorizeRoles('admin', 'staff'), (req, res) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    phone,
    email,
    emergency_contact_name,
    emergency_contact_phone,
    consent_to_share,
    notes
  } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }

  const clientId = uuidv4();
  const sql = `
    INSERT INTO clients (
      id, first_name, last_name, date_of_birth, phone, email,
      emergency_contact_name, emergency_contact_phone, consent_to_share,
      notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    clientId, first_name, last_name, date_of_birth, phone, email,
    emergency_contact_name, emergency_contact_phone, consent_to_share ? 1 : 0,
    notes, req.user.id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create client', message: err.message });
    }

    res.status(201).json({
      message: 'Client created successfully',
      client_id: clientId
    });
  });
});

// Get all clients
router.get('/', (req, res) => {
  const { status, search } = req.query;
  let sql = 'SELECT * FROM clients WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, clients) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch clients', message: err.message });
    }

    res.json({ clients, count: clients.length });
  });
});

// Get client by ID
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM clients WHERE id = ?';

  db.get(sql, [req.params.id], (err, client) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client });
  });
});

// Update client
router.put('/:id', authorizeRoles('admin', 'staff'), (req, res) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    phone,
    email,
    emergency_contact_name,
    emergency_contact_phone,
    consent_to_share,
    status,
    notes
  } = req.body;

  const sql = `
    UPDATE clients SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      date_of_birth = COALESCE(?, date_of_birth),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      emergency_contact_name = COALESCE(?, emergency_contact_name),
      emergency_contact_phone = COALESCE(?, emergency_contact_phone),
      consent_to_share = COALESCE(?, consent_to_share),
      status = COALESCE(?, status),
      notes = COALESCE(?, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [
    first_name, last_name, date_of_birth, phone, email,
    emergency_contact_name, emergency_contact_phone,
    consent_to_share !== undefined ? (consent_to_share ? 1 : 0) : null,
    status, notes, req.params.id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update client', message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client updated successfully' });
  });
});

// Delete client (soft delete by setting status to archived)
router.delete('/:id', authorizeRoles('admin'), (req, res) => {
  const sql = 'UPDATE clients SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

  db.run(sql, ['archived', req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete client', message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client archived successfully' });
  });
});

module.exports = router;
