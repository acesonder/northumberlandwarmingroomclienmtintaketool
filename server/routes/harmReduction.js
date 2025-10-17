const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all products
router.get('/products', authenticateToken, (req, res) => {
  const { category, active_only } = req.query;
  let query = 'SELECT * FROM harm_reduction_products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (active_only === 'true') {
    query += ' AND is_active = 1';
  }

  query += ' ORDER BY category, name';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single product
router.get('/products/:id', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM harm_reduction_products WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(row);
    }
  );
});

// Create product (admin/staff only)
router.post('/products', authenticateToken, authorizeRoles(['admin', 'staff']), (req, res) => {
  const {
    name,
    description,
    category,
    icon,
    image_url,
    usage_guide,
    safety_info,
    quantity_in_stock,
    reorder_level
  } = req.body;

  const id = uuidv4();

  db.run(
    `INSERT INTO harm_reduction_products 
    (id, name, description, category, icon, image_url, usage_guide, safety_info, quantity_in_stock, reorder_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, description, category, icon, image_url, usage_guide, safety_info, quantity_in_stock || 0, reorder_level || 10],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id, message: 'Product created successfully' });
    }
  );
});

// Update product (admin/staff only)
router.put('/products/:id', authenticateToken, authorizeRoles(['admin', 'staff']), (req, res) => {
  const {
    name,
    description,
    category,
    icon,
    image_url,
    usage_guide,
    safety_info,
    quantity_in_stock,
    reorder_level,
    is_active
  } = req.body;

  db.run(
    `UPDATE harm_reduction_products 
    SET name = ?, description = ?, category = ?, icon = ?, image_url = ?, 
        usage_guide = ?, safety_info = ?, quantity_in_stock = ?, reorder_level = ?, 
        is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [name, description, category, icon, image_url, usage_guide, safety_info, 
     quantity_in_stock, reorder_level, is_active, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product updated successfully' });
    }
  );
});

// Update inventory (admin/staff only)
router.post('/products/:id/inventory', authenticateToken, authorizeRoles(['admin', 'staff']), (req, res) => {
  const { change_type, quantity_change, notes } = req.body;
  const productId = req.params.id;
  const userId = req.user.id;

  // Get current quantity
  db.get('SELECT quantity_in_stock FROM harm_reduction_products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const previousQuantity = product.quantity_in_stock;
    const newQuantity = previousQuantity + quantity_change;

    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient inventory' });
    }

    const logId = uuidv4();

    // Update inventory
    db.run('UPDATE harm_reduction_products SET quantity_in_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQuantity, productId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Log the change
        db.run(
          `INSERT INTO harm_reduction_inventory_log 
          (id, product_id, change_type, quantity_change, previous_quantity, new_quantity, notes, updated_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [logId, productId, change_type, quantity_change, previousQuantity, newQuantity, notes, userId],
          function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ 
              message: 'Inventory updated successfully', 
              previous_quantity: previousQuantity,
              new_quantity: newQuantity 
            });
          }
        );
      }
    );
  });
});

// Get inventory log
router.get('/products/:id/inventory-log', authenticateToken, authorizeRoles(['admin', 'staff']), (req, res) => {
  db.all(
    `SELECT l.*, u.full_name as updated_by_name
     FROM harm_reduction_inventory_log l
     LEFT JOIN users u ON l.updated_by = u.id
     WHERE l.product_id = ?
     ORDER BY l.created_at DESC`,
    [req.params.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Create order
router.post('/orders', authenticateToken, (req, res) => {
  const {
    client_id,
    order_type,
    fulfillment_date,
    fulfillment_time_slot,
    delivery_address,
    delivery_notes,
    items
  } = req.body;

  const orderId = uuidv4();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  db.run(
    `INSERT INTO harm_reduction_orders 
    (id, client_id, order_type, fulfillment_date, fulfillment_time_slot, delivery_address, delivery_notes, total_items)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [orderId, client_id, order_type, fulfillment_date, fulfillment_time_slot, delivery_address, delivery_notes, totalItems],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Insert order items
      const stmt = db.prepare(
        'INSERT INTO harm_reduction_order_items (id, order_id, product_id, quantity, notes) VALUES (?, ?, ?, ?, ?)'
      );

      items.forEach(item => {
        stmt.run([uuidv4(), orderId, item.product_id, item.quantity, item.notes || '']);
      });

      stmt.finalize((err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: orderId, message: 'Order created successfully' });
      });
    }
  );
});

// Get all orders
router.get('/orders', authenticateToken, (req, res) => {
  const { status, order_type, client_id } = req.query;
  let query = `
    SELECT o.*, c.first_name, c.last_name, u.full_name as assigned_to_name
    FROM harm_reduction_orders o
    LEFT JOIN clients c ON o.client_id = c.id
    LEFT JOIN users u ON o.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  if (order_type) {
    query += ' AND o.order_type = ?';
    params.push(order_type);
  }

  if (client_id) {
    query += ' AND o.client_id = ?';
    params.push(client_id);
  }

  query += ' ORDER BY o.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single order with items
router.get('/orders/:id', authenticateToken, (req, res) => {
  db.get(
    `SELECT o.*, c.first_name, c.last_name, c.phone, c.email, u.full_name as assigned_to_name
     FROM harm_reduction_orders o
     LEFT JOIN clients c ON o.client_id = c.id
     LEFT JOIN users u ON o.assigned_to = u.id
     WHERE o.id = ?`,
    [req.params.id],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Get order items
      db.all(
        `SELECT oi.*, p.name, p.icon, p.image_url
         FROM harm_reduction_order_items oi
         LEFT JOIN harm_reduction_products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [req.params.id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ ...order, items });
        }
      );
    }
  );
});

// Update order status (admin/staff only)
router.patch('/orders/:id/status', authenticateToken, authorizeRoles(['admin', 'staff']), (req, res) => {
  const { status, assigned_to, cancelled_reason } = req.body;
  const updates = ['status = ?'];
  const params = [status];

  if (assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    params.push(assigned_to);
  }

  if (status === 'completed') {
    updates.push('completed_at = CURRENT_TIMESTAMP');
  }

  if (status === 'cancelled' && cancelled_reason) {
    updates.push('cancelled_reason = ?');
    params.push(cancelled_reason);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  db.run(
    `UPDATE harm_reduction_orders SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ message: 'Order updated successfully' });
    }
  );
});

// Fulfill order items (admin/staff only)
router.patch('/orders/:orderId/items/:itemId/fulfill', authenticateToken, authorizeRoles(['admin', 'staff']), (req, res) => {
  const { fulfilled_quantity } = req.body;

  db.get('SELECT * FROM harm_reduction_order_items WHERE id = ?', [req.params.itemId], (err, item) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!item) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    // Check inventory
    db.get('SELECT quantity_in_stock FROM harm_reduction_products WHERE id = ?', [item.product_id], (err, product) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (product.quantity_in_stock < fulfilled_quantity) {
        return res.status(400).json({ error: 'Insufficient inventory' });
      }

      // Update fulfilled quantity
      db.run(
        'UPDATE harm_reduction_order_items SET fulfilled_quantity = ? WHERE id = ?',
        [fulfilled_quantity, req.params.itemId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Reduce inventory
          db.run(
            'UPDATE harm_reduction_products SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?',
            [fulfilled_quantity, item.product_id],
            function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              // Log inventory change
              const logId = uuidv4();
              db.run(
                `INSERT INTO harm_reduction_inventory_log 
                (id, product_id, change_type, quantity_change, previous_quantity, new_quantity, notes, updated_by)
                VALUES (?, ?, 'order', ?, ?, ?, ?, ?)`,
                [logId, item.product_id, -fulfilled_quantity, product.quantity_in_stock, 
                 product.quantity_in_stock - fulfilled_quantity, `Order ${req.params.orderId}`, req.user.id],
                function (err) {
                  if (err) {
                    console.error('Error logging inventory change:', err);
                  }
                  res.json({ message: 'Order item fulfilled successfully' });
                }
              );
            }
          );
        }
      );
    });
  });
});

// Get staff availability
router.get('/availability', authenticateToken, (req, res) => {
  const { day_of_week, active_only } = req.query;
  let query = `
    SELECT a.*, u.full_name, u.username
    FROM staff_availability a
    LEFT JOIN users u ON a.staff_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (day_of_week) {
    query += ' AND a.day_of_week = ?';
    params.push(day_of_week);
  }

  if (active_only === 'true') {
    query += ' AND a.is_active = 1';
  }

  query += ' ORDER BY CASE a.day_of_week WHEN "monday" THEN 1 WHEN "tuesday" THEN 2 WHEN "wednesday" THEN 3 WHEN "thursday" THEN 4 WHEN "friday" THEN 5 WHEN "saturday" THEN 6 WHEN "sunday" THEN 7 END, a.start_time';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create staff availability (admin/staff only)
router.post('/availability', authenticateToken, authorizeRoles(['admin', 'staff']), (req, res) => {
  const { staff_id, day_of_week, start_time, end_time, location, notes } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO staff_availability 
    (id, staff_id, day_of_week, start_time, end_time, location, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, staff_id, day_of_week, start_time, end_time, location || 'Cobourg, Ontario, Canada', notes],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id, message: 'Availability created successfully' });
    }
  );
});

// Update staff availability (admin/staff only)
router.put('/availability/:id', authenticateToken, authorizeRoles(['admin', 'staff']), (req, res) => {
  const { day_of_week, start_time, end_time, location, notes, is_active } = req.body;

  db.run(
    `UPDATE staff_availability 
    SET day_of_week = ?, start_time = ?, end_time = ?, location = ?, notes = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [day_of_week, start_time, end_time, location, notes, is_active, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Availability not found' });
      }
      res.json({ message: 'Availability updated successfully' });
    }
  );
});

// Delete staff availability (admin/staff only)
router.delete('/availability/:id', authenticateToken, authorizeRoles(['admin', 'staff']), (req, res) => {
  db.run('DELETE FROM staff_availability WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Availability not found' });
    }
    res.json({ message: 'Availability deleted successfully' });
  });
});

module.exports = router;
