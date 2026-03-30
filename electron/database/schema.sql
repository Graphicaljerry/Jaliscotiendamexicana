-- Categories for item grid
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Items (grocery + restaurant)
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id),
  button_color TEXT DEFAULT '#4A90D9',
  is_taxable INTEGER DEFAULT 1,
  is_ebt_eligible INTEGER DEFAULT 0,
  grid_position INTEGER,
  active INTEGER DEFAULT 1
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_number TEXT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT DEFAULT (datetime('now','localtime')),
  customer_id INTEGER REFERENCES customers(id),
  subtotal REAL DEFAULT 0,
  tax_total REAL DEFAULT 0,
  discount_total REAL DEFAULT 0,
  grand_total REAL DEFAULT 0,
  payment_type TEXT DEFAULT 'cash',
  amount_paid REAL DEFAULT 0,
  change_given REAL DEFAULT 0,
  transaction_type TEXT DEFAULT 'sale',
  ebt_amount REAL DEFAULT 0,
  terminal_id TEXT,
  synced INTEGER DEFAULT 1
);

-- Transaction line items
CREATE TABLE IF NOT EXISTS transaction_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER REFERENCES transactions(id),
  item_id INTEGER REFERENCES items(id),
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price REAL NOT NULL,
  line_total REAL NOT NULL,
  discount REAL DEFAULT 0
);

-- Key-value settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
