const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Create new service
router.post('/', authorizeRoles('admin', 'service_provider'), (req, res) => {
  const {
    name, category, description, provider_organization,
    contact_person, contact_phone, contact_email,
    address, availability, eligibility_criteria
  } = req.body;

  if (!name || !category || !provider_organization) {
    return res.status(400).json({ error: 'Name, category, and provider organization are required' });
  }

  const serviceId = uuidv4();
  const sql = `
    INSERT INTO services (
      id, name, category, description, provider_organization,
      contact_person, contact_phone, contact_email, address,
      availability, eligibility_criteria
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    serviceId, name, category, description, provider_organization,
    contact_person, contact_phone, contact_email, address,
    availability, eligibility_criteria
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create service', message: err.message });
    }

    res.status(201).json({
      message: 'Service created successfully',
      service_id: serviceId
    });
  });
});

// Get all services
router.get('/', (req, res) => {
  const { category, is_active } = req.query;
  let sql = 'SELECT * FROM services WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (is_active !== undefined) {
    sql += ' AND is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }

  sql += ' ORDER BY name ASC';

  db.all(sql, params, (err, services) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch services', message: err.message });
    }

    res.json({ services, count: services.length });
  });
});

// Get service by ID
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM services WHERE id = ?';

  db.get(sql, [req.params.id], (err, service) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ service });
  });
});

// Update service
router.put('/:id', authorizeRoles('admin', 'service_provider'), (req, res) => {
  const {
    name, category, description, provider_organization,
    contact_person, contact_phone, contact_email,
    address, availability, eligibility_criteria, is_active
  } = req.body;

  const updates = [];
  const params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }

  if (category) {
    updates.push('category = ?');
    params.push(category);
  }

  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }

  if (provider_organization) {
    updates.push('provider_organization = ?');
    params.push(provider_organization);
  }

  if (contact_person !== undefined) {
    updates.push('contact_person = ?');
    params.push(contact_person);
  }

  if (contact_phone !== undefined) {
    updates.push('contact_phone = ?');
    params.push(contact_phone);
  }

  if (contact_email !== undefined) {
    updates.push('contact_email = ?');
    params.push(contact_email);
  }

  if (address !== undefined) {
    updates.push('address = ?');
    params.push(address);
  }

  if (availability !== undefined) {
    updates.push('availability = ?');
    params.push(availability);
  }

  if (eligibility_criteria !== undefined) {
    updates.push('eligibility_criteria = ?');
    params.push(eligibility_criteria);
  }

  if (is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(is_active ? 1 : 0);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  const sql = `UPDATE services SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update service', message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service updated successfully' });
  });
});

// Create service connection (referral)
router.post('/connections', authorizeRoles('admin', 'staff'), (req, res) => {
  const { client_id, service_id, case_id, notes, follow_up_date } = req.body;

  if (!client_id || !service_id) {
    return res.status(400).json({ error: 'Client ID and service ID are required' });
  }

  const connectionId = uuidv4();
  const sql = `
    INSERT INTO service_connections (
      id, client_id, service_id, case_id, referred_by, notes, follow_up_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [connectionId, client_id, service_id, case_id, req.user.id, notes, follow_up_date], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create service connection', message: err.message });
    }

    res.status(201).json({
      message: 'Service connection created successfully',
      connection_id: connectionId
    });
  });
});

// Get service connections
router.get('/connections/list', (req, res) => {
  const { client_id, service_id, status } = req.query;
  let sql = `
    SELECT sc.*, s.name as service_name, s.category, s.provider_organization,
           c.first_name, c.last_name, u.full_name as referred_by_name
    FROM service_connections sc
    JOIN services s ON sc.service_id = s.id
    JOIN clients c ON sc.client_id = c.id
    JOIN users u ON sc.referred_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (client_id) {
    sql += ' AND sc.client_id = ?';
    params.push(client_id);
  }

  if (service_id) {
    sql += ' AND sc.service_id = ?';
    params.push(service_id);
  }

  if (status) {
    sql += ' AND sc.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY sc.referral_date DESC';

  db.all(sql, params, (err, connections) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch connections', message: err.message });
    }

    res.json({ connections, count: connections.length });
  });
});

// Update service connection
router.put('/connections/:id', authorizeRoles('admin', 'staff', 'service_provider'), (req, res) => {
  const { status, notes, outcome, follow_up_date } = req.body;

  const updates = [];
  const params = [];

  if (status) {
    updates.push('status = ?');
    params.push(status);
  }

  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }

  if (outcome !== undefined) {
    updates.push('outcome = ?');
    params.push(outcome);
  }

  if (follow_up_date !== undefined) {
    updates.push('follow_up_date = ?');
    params.push(follow_up_date);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  const sql = `UPDATE service_connections SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update connection', message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    res.json({ message: 'Service connection updated successfully' });
  });
});

module.exports = router;
