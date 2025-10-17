const db = require('./init');
const { v4: uuidv4 } = require('uuid');

// Initial harm reduction products
const products = [
  {
    name: 'Sterile Needles (10 pack)',
    description: 'Sterile single-use needles for safer injection practices',
    category: 'needles',
    icon: '💉',
    usage_guide: '1. Wash hands before use\n2. Use each needle only once\n3. Dispose in sharps container\n4. Never share needles',
    safety_info: 'Single use only. Proper disposal prevents needle stick injuries and disease transmission.',
    quantity_in_stock: 500,
    reorder_level: 100
  },
  {
    name: 'Alcohol Swabs (100 pack)',
    description: 'Sterile alcohol prep pads for skin disinfection',
    category: 'safe_injection',
    icon: '🧼',
    usage_guide: '1. Clean injection site thoroughly\n2. Allow to air dry completely\n3. Use fresh swab each time\n4. Dispose after single use',
    safety_info: 'Reduces risk of infection. Do not reuse swabs.',
    quantity_in_stock: 300,
    reorder_level: 50
  },
  {
    name: 'Condoms (12 pack)',
    description: 'Latex condoms for safer sex practices',
    category: 'safer_sex',
    icon: '🛡️',
    usage_guide: '1. Check expiry date\n2. Open carefully\n3. Use with water-based lubricant\n4. Use once and dispose',
    safety_info: 'Prevents STI transmission and pregnancy. Store in cool, dry place.',
    quantity_in_stock: 800,
    reorder_level: 150
  },
  {
    name: 'Naloxone Nasal Spray',
    description: 'Opioid overdose reversal medication',
    category: 'overdose_prevention',
    icon: '🚑',
    usage_guide: '1. Call 911 immediately\n2. Tilt head back\n3. Insert into nostril\n4. Press plunger firmly\n5. May repeat after 2-3 minutes if needed',
    safety_info: 'For emergency use only. Temporary effect - seek medical attention immediately.',
    quantity_in_stock: 100,
    reorder_level: 20
  },
  {
    name: 'Sharps Container',
    description: 'Puncture-resistant container for safe needle disposal',
    category: 'safe_injection',
    icon: '🗑️',
    usage_guide: '1. Do not overfill\n2. Keep out of reach of children\n3. Do not try to remove items\n4. Return when 3/4 full for proper disposal',
    safety_info: 'Prevents needle stick injuries. Essential for safe needle disposal.',
    quantity_in_stock: 50,
    reorder_level: 10
  },
  {
    name: 'Water-Based Lubricant',
    description: 'Safe lubricant for condom use',
    category: 'safer_sex',
    icon: '💧',
    usage_guide: '1. Apply as needed\n2. Safe with latex condoms\n3. Reapply if needed\n4. Check expiry date',
    safety_info: 'Water-based formula safe for latex. Do not use oil-based products with condoms.',
    quantity_in_stock: 200,
    reorder_level: 40
  },
  {
    name: 'Bandages & Gauze Kit',
    description: 'Sterile wound care supplies',
    category: 'wound_care',
    icon: '🩹',
    usage_guide: '1. Clean wound with soap and water\n2. Apply antibiotic ointment if available\n3. Cover with sterile bandage\n4. Change daily or when wet/dirty',
    safety_info: 'Keep wound clean and dry. Seek medical attention for deep or infected wounds.',
    quantity_in_stock: 150,
    reorder_level: 30
  },
  {
    name: 'Tourniquets',
    description: 'Medical tourniquets for safer injection',
    category: 'safe_injection',
    icon: '🎗️',
    usage_guide: '1. Apply 3-4 inches above injection site\n2. Do not leave on for more than 2 minutes\n3. Release immediately after finding vein\n4. Do not share',
    safety_info: 'Never share tourniquets. Extended use can cause injury.',
    quantity_in_stock: 200,
    reorder_level: 40
  },
  {
    name: 'Sterile Cookers',
    description: 'Single-use sterile cookers for drug preparation',
    category: 'safe_injection',
    icon: '🥄',
    usage_guide: '1. Use only once\n2. Use sterile water\n3. Dispose after single use\n4. Never share',
    safety_info: 'Single use only. Reduces risk of infection and disease transmission.',
    quantity_in_stock: 400,
    reorder_level: 80
  },
  {
    name: 'Fentanyl Test Strips (10 pack)',
    description: 'Test strips to detect fentanyl in drug supply',
    category: 'overdose_prevention',
    icon: '🧪',
    usage_guide: '1. Dissolve small amount of substance in water\n2. Dip strip for 15 seconds\n3. Wait 5 minutes\n4. Two lines = negative, One line = positive for fentanyl',
    safety_info: 'Helps detect fentanyl contamination. Does not guarantee safety - use with caution.',
    quantity_in_stock: 250,
    reorder_level: 50
  }
];

function seedHarmReductionProducts() {
  console.log('Seeding harm reduction products...');
  
  const stmt = db.prepare(`
    INSERT INTO harm_reduction_products 
    (id, name, description, category, icon, usage_guide, safety_info, quantity_in_stock, reorder_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  products.forEach(product => {
    const id = uuidv4();
    stmt.run([
      id,
      product.name,
      product.description,
      product.category,
      product.icon,
      product.usage_guide,
      product.safety_info,
      product.quantity_in_stock,
      product.reorder_level
    ]);
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('Error seeding products:', err);
    } else {
      console.log(`Successfully seeded ${products.length} harm reduction products`);
    }
  });
}

// Seed default staff availability (Wednesday and Friday 5-9pm)
function seedStaffAvailability() {
  console.log('Seeding default staff availability...');
  
  // First, get admin users
  db.all('SELECT id FROM users WHERE role IN ("admin", "staff")', [], (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      return;
    }

    if (users.length === 0) {
      console.log('No staff users found. Skipping availability seeding.');
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO staff_availability 
      (id, staff_id, day_of_week, start_time, end_time, location, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Add Wednesday and Friday slots for first staff member
    const staffId = users[0].id;
    const slots = [
      {
        day_of_week: 'wednesday',
        start_time: '17:00',
        end_time: '21:00',
        location: 'Cobourg, Ontario, Canada',
        notes: 'Evening pickup/delivery slot'
      },
      {
        day_of_week: 'friday',
        start_time: '17:00',
        end_time: '21:00',
        location: 'Cobourg, Ontario, Canada',
        notes: 'Evening pickup/delivery slot'
      }
    ];

    slots.forEach(slot => {
      const id = uuidv4();
      stmt.run([
        id,
        staffId,
        slot.day_of_week,
        slot.start_time,
        slot.end_time,
        slot.location,
        slot.notes
      ]);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error seeding availability:', err);
      } else {
        console.log('Successfully seeded staff availability');
      }
    });
  });
}

// Run seed functions
setTimeout(() => {
  // Check if products already exist
  db.get('SELECT COUNT(*) as count FROM harm_reduction_products', [], (err, result) => {
    if (err) {
      console.error('Error checking products:', err);
      return;
    }

    if (result.count === 0) {
      seedHarmReductionProducts();
      seedStaffAvailability();
    } else {
      console.log('Harm reduction products already exist. Skipping seed.');
    }
  });
}, 1000);

module.exports = { seedHarmReductionProducts, seedStaffAvailability };
