const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let db = null;

function getDbPath() {
  // Store DB in user data directory so it persists across updates
  const userDataPath = app ? app.getPath('userData') : __dirname;
  return path.join(userDataPath, 'jalisco-pos.db');
}

function initDatabase() {
  const dbPath = getDbPath();
  console.log('Database path:', dbPath);

  db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  // Seed default data if tables are empty
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (categoryCount.count === 0) {
    seedDatabase();
  }

  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function seedDatabase() {
  console.log('Seeding database with default data...');

  // Default settings
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  const seedSettings = db.transaction(() => {
    insertSetting.run('store_name', 'Jalisco Tienda Mexicana');
    insertSetting.run('tax_rate', '6.5');
    insertSetting.run('server_mode', 'primary');
    insertSetting.run('server_port', '3000');
    insertSetting.run('printer_type', 'epson');
    insertSetting.run('printer_interface', '');
    insertSetting.run('admin_password', '1234');
    insertSetting.run('ebt_enabled', 'true');
  });
  seedSettings();

  // Default categories (restaurant grid)
  const insertCategory = db.prepare('INSERT INTO categories (name, display_order) VALUES (?, ?)');
  const seedCategories = db.transaction(() => {
    const categories = [
      'ARROZ', 'COKTAILS', 'FRIJOLES', 'MENUDO', 'PRODUCE', 'SIDE ORDERS', 'TAMALES',
      'BEBIDAS', 'DELI', 'GORDITAS', 'PRODUCE A', 'SINCRNZDA', 'TOGO LLEVAR',
      'BURRITO', 'DESAYUNOS', 'GUACAMOLE', 'PICO DE GALLO', 'QUESADILLA', 'SOPES', 'TORTAS',
      'CALDOS', 'FLAUTAS', 'GUIZADOS', 'POZOLE', 'SALSA', 'TACOS', 'TOSTADAS'
    ];
    categories.forEach((name, i) => {
      insertCategory.run(name, i + 1);
    });
  });
  seedCategories();

  // Get the TACOS category ID for sub-items
  const tacosCategory = db.prepare("SELECT id FROM categories WHERE name = 'TACOS'").get();
  const tacosId = tacosCategory ? tacosCategory.id : null;

  // Seed TACOS sub-items with colors
  if (tacosId) {
    const insertItem = db.prepare(
      'INSERT INTO items (name, price, category_id, button_color, is_taxable, grid_position) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const seedTacos = db.transaction(() => {
      const tacoItems = [
        { name: 'TACOS Azada', price: 3.50, color: '#4CAF50', pos: 1 },
        { name: 'TACOS BBQ', price: 3.50, color: '#8BC34A', pos: 2 },
        { name: 'Tacos Chorizo', price: 3.50, color: '#2196F3', pos: 3 },
        { name: 'TACOS DE HUEVO', price: 3.00, color: '#F44336', pos: 4 },
        { name: 'CON QUESO', price: 1.00, color: '#4CAF50', pos: 5 },
        { name: 'Carne Extra', price: 2.00, color: '#B71C1C', pos: 6 },
        { name: 'Doble Tortilla', price: 0.50, color: '#4CAF50', pos: 7 },
        { name: 'Tortillas Extras Unidad', price: 0.25, color: '#9C27B0', pos: 8 },
        { name: 'CON AGUACATE', price: 1.50, color: '#B71C1C', pos: 9 },
        { name: 'TACOS Carnitas', price: 3.50, color: '#009688', pos: 10 },
        { name: 'TACOS Lengua', price: 4.00, color: '#009688', pos: 11 },
        { name: 'Tacos Cabeza', price: 3.50, color: '#9C27B0', pos: 12 },
        { name: 'Taco Chicharron', price: 3.00, color: '#757575', pos: 13 },
        { name: 'ORDEN QUESO BIRRIA', price: 5.00, color: '#FF9800', pos: 14 },
        { name: 'TACOS Tripa', price: 3.50, color: '#E91E63', pos: 15 },
        { name: 'TACOS Pollo', price: 3.00, color: '#FFEB3B', pos: 16 },
        { name: 'Flauta por unidad', price: 2.50, color: '#F44336', pos: 17 },
        { name: 'Taco de Buche', price: 3.50, color: '#757575', pos: 18 },
        { name: 'Comida Deli', price: 8.99, color: '#2196F3', pos: 19 },
        { name: 'Crema extra 2oz', price: 1.00, color: '#4CAF50', pos: 20 },
        { name: 'TACOS Camaron', price: 4.50, color: '#FFEB3B', pos: 21 },
        { name: 'TACOS Pastor', price: 3.50, color: '#FFEB3B', pos: 22 },
        { name: 'Tacos de Secina', price: 3.50, color: '#F44336', pos: 23 },
        { name: 'Tortilla de Harina', price: 0.50, color: '#757575', pos: 24 },
        { name: 'Taco Preprdo', price: 3.50, color: '#FFEB3B', pos: 25 },
        { name: 'Crema extra 4oz', price: 1.50, color: '#4CAF50', pos: 26 }
      ];
      tacoItems.forEach((item) => {
        insertItem.run(item.name, item.price, tacosId, item.color, 1, item.pos);
      });
    });
    seedTacos();
  }

  // Seed some sample grocery items with barcodes
  const insertGrocery = db.prepare(
    'INSERT INTO items (barcode, name, price, is_taxable, is_ebt_eligible) VALUES (?, ?, ?, ?, ?)'
  );
  const seedGrocery = db.transaction(() => {
    const groceryItems = [
      { barcode: '4011', name: 'Bananas (lb)', price: 0.69, taxable: 0, ebt: 1 },
      { barcode: '4065', name: 'Peppers Green (lb)', price: 1.29, taxable: 0, ebt: 1 },
      { barcode: '4093', name: 'Tomatoes Roma (lb)', price: 1.49, taxable: 0, ebt: 1 },
      { barcode: '7501000611218', name: 'Jarritos Tamarindo 370ml', price: 1.50, taxable: 1, ebt: 0 },
      { barcode: '7501000611201', name: 'Jarritos Mandarina 370ml', price: 1.50, taxable: 1, ebt: 0 },
      { barcode: '0028400064545', name: 'Takis Fuego 280g', price: 4.99, taxable: 1, ebt: 1 },
      { barcode: '7501011243088', name: 'Maseca Corn Flour 4.4lb', price: 4.49, taxable: 0, ebt: 1 },
      { barcode: '7506306314542', name: 'Abuelita Chocolate 540g', price: 5.99, taxable: 0, ebt: 1 }
    ];
    groceryItems.forEach((item) => {
      insertGrocery.run(item.barcode, item.name, item.price, item.taxable, item.ebt);
    });
  });
  seedGrocery();

  // Seed sample customers
  const insertCustomer = db.prepare(
    'INSERT INTO customers (customer_number, name, phone, email) VALUES (?, ?, ?, ?)'
  );
  const seedCustomers = db.transaction(() => {
    insertCustomer.run('C001', 'Maria Garcia', '555-0101', 'maria@email.com');
    insertCustomer.run('C002', 'Jose Rodriguez', '555-0102', 'jose@email.com');
    insertCustomer.run('C003', 'Ana Martinez', '555-0103', 'ana@email.com');
  });
  seedCustomers();

  console.log('Database seeded successfully');
}

module.exports = { initDatabase, getDb };
