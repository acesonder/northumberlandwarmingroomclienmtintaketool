const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Create new assessment
router.post('/', authorizeRoles('admin', 'staff'), (req, res) => {
  const {
    client_id,
    assessment_type,
    assessment_data,
    risk_level,
    recommendations,
    status
  } = req.body;

  if (!client_id || !assessment_type || !assessment_data) {
    return res.status(400).json({ error: 'Client ID, assessment type, and assessment data are required' });
  }

  const assessmentId = uuidv4();
  const sql = `
    INSERT INTO assessments (
      id, client_id, assessor_id, assessment_type, assessment_data,
      risk_level, recommendations, status, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const completedAt = status === 'completed' ? new Date().toISOString() : null;

  db.run(sql, [
    assessmentId, client_id, req.user.id, assessment_type,
    JSON.stringify(assessment_data), risk_level, recommendations,
    status || 'draft', completedAt
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create assessment', message: err.message });
    }

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment_id: assessmentId
    });
  });
});

// Get all assessments
router.get('/', (req, res) => {
  const { client_id, assessment_type, status } = req.query;
  let sql = `
    SELECT a.*, u.full_name as assessor_name, c.first_name, c.last_name
    FROM assessments a
    JOIN users u ON a.assessor_id = u.id
    JOIN clients c ON a.client_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (client_id) {
    sql += ' AND a.client_id = ?';
    params.push(client_id);
  }

  if (assessment_type) {
    sql += ' AND a.assessment_type = ?';
    params.push(assessment_type);
  }

  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY a.created_at DESC';

  db.all(sql, params, (err, assessments) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch assessments', message: err.message });
    }

    // Parse JSON assessment_data
    const parsedAssessments = assessments.map(a => ({
      ...a,
      assessment_data: JSON.parse(a.assessment_data)
    }));

    res.json({ assessments: parsedAssessments, count: assessments.length });
  });
});

// Get assessment by ID
router.get('/:id', (req, res) => {
  const sql = `
    SELECT a.*, u.full_name as assessor_name, c.first_name, c.last_name
    FROM assessments a
    JOIN users u ON a.assessor_id = u.id
    JOIN clients c ON a.client_id = c.id
    WHERE a.id = ?
  `;

  db.get(sql, [req.params.id], (err, assessment) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    assessment.assessment_data = JSON.parse(assessment.assessment_data);
    res.json({ assessment });
  });
});

// Update assessment
router.put('/:id', authorizeRoles('admin', 'staff'), (req, res) => {
  const {
    assessment_data,
    risk_level,
    recommendations,
    status
  } = req.body;

  const updates = [];
  const params = [];

  if (assessment_data) {
    updates.push('assessment_data = ?');
    params.push(JSON.stringify(assessment_data));
  }

  if (risk_level) {
    updates.push('risk_level = ?');
    params.push(risk_level);
  }

  if (recommendations) {
    updates.push('recommendations = ?');
    params.push(recommendations);
  }

  if (status) {
    updates.push('status = ?');
    params.push(status);
    
    if (status === 'completed') {
      updates.push('completed_at = CURRENT_TIMESTAMP');
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  const sql = `UPDATE assessments SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update assessment', message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({ message: 'Assessment updated successfully' });
  });
});

// Delete assessment
router.delete('/:id', authorizeRoles('admin'), (req, res) => {
  const sql = 'DELETE FROM assessments WHERE id = ?';

  db.run(sql, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete assessment', message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({ message: 'Assessment deleted successfully' });
  });
});

module.exports = router;
