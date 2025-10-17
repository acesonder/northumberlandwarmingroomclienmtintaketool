const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'intake.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  // Users table - for authentication (staff, admin, service providers)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'service_provider')),
      full_name TEXT NOT NULL,
      organization TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clients table - individuals seeking assistance
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE,
      phone TEXT,
      email TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      consent_to_share BOOLEAN DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'archived')),
      notes TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Assessments table - smart assessment forms
  db.run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      assessor_id TEXT NOT NULL,
      assessment_type TEXT NOT NULL CHECK(assessment_type IN ('intake', 'housing', 'health', 'employment', 'follow_up')),
      assessment_data TEXT NOT NULL,
      risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high', 'critical')),
      recommendations TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'completed', 'reviewed')),
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (assessor_id) REFERENCES users(id)
    )
  `);

  // Cases table - case management
  db.run(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      case_manager_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'pending', 'closed')),
      opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (case_manager_id) REFERENCES users(id)
    )
  `);

  // Services table - available services
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('housing', 'food', 'health', 'employment', 'counseling', 'legal', 'other')),
      description TEXT,
      provider_organization TEXT NOT NULL,
      contact_person TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      address TEXT,
      availability TEXT,
      eligibility_criteria TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Service connections - linking clients to services
  db.run(`
    CREATE TABLE IF NOT EXISTS service_connections (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      case_id TEXT,
      referred_by TEXT NOT NULL,
      referral_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'completed', 'declined', 'cancelled')),
      notes TEXT,
      follow_up_date DATETIME,
      outcome TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (case_id) REFERENCES cases(id),
      FOREIGN KEY (referred_by) REFERENCES users(id)
    )
  `);

  // Messages table - communication between stakeholders
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT,
      case_id TEXT,
      client_id TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high')),
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id),
      FOREIGN KEY (case_id) REFERENCES cases(id),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )
  `);

  // Case notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS case_notes (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      note TEXT NOT NULL,
      is_private BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `);

  // Harm reduction products table
  db.run(`
    CREATE TABLE IF NOT EXISTS harm_reduction_products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL CHECK(category IN ('needles', 'safe_injection', 'safer_sex', 'overdose_prevention', 'wound_care', 'other')),
      icon TEXT,
      image_url TEXT,
      usage_guide TEXT,
      safety_info TEXT,
      quantity_in_stock INTEGER DEFAULT 0,
      reorder_level INTEGER DEFAULT 10,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Harm reduction inventory log table
  db.run(`
    CREATE TABLE IF NOT EXISTS harm_reduction_inventory_log (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      change_type TEXT NOT NULL CHECK(change_type IN ('restock', 'adjustment', 'order', 'damage', 'expired')),
      quantity_change INTEGER NOT NULL,
      previous_quantity INTEGER NOT NULL,
      new_quantity INTEGER NOT NULL,
      notes TEXT,
      updated_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES harm_reduction_products(id),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    )
  `);

  // Harm reduction orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS harm_reduction_orders (
      id TEXT PRIMARY KEY,
      client_id TEXT,
      order_type TEXT NOT NULL CHECK(order_type IN ('pickup', 'delivery')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'ready', 'in_transit', 'completed', 'cancelled')),
      fulfillment_date DATETIME,
      fulfillment_time_slot TEXT,
      delivery_address TEXT,
      delivery_notes TEXT,
      assigned_to TEXT,
      total_items INTEGER DEFAULT 0,
      completed_at DATETIME,
      cancelled_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  // Harm reduction order items table
  db.run(`
    CREATE TABLE IF NOT EXISTS harm_reduction_order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      fulfilled_quantity INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES harm_reduction_orders(id),
      FOREIGN KEY (product_id) REFERENCES harm_reduction_products(id)
    )
  `);

  // Staff availability schedule table
  db.run(`
    CREATE TABLE IF NOT EXISTS staff_availability (
      id TEXT PRIMARY KEY,
      staff_id TEXT NOT NULL,
      day_of_week TEXT NOT NULL CHECK(day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      location TEXT DEFAULT 'Cobourg, Ontario, Canada',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (staff_id) REFERENCES users(id)
    )
  `);

  console.log('Database tables initialized successfully');
}

module.exports = db;
