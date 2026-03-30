const { ipcMain } = require('electron');
const { getDb } = require('../database/index.js');

function registerHandlers() {
  // ─── ITEMS ────────────────────────────────────────────
  ipcMain.handle('db:items:getAll', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM items WHERE active = 1 ORDER BY name').all();
  });

  ipcMain.handle('db:items:getByBarcode', (event, barcode) => {
    const db = getDb();
    return db.prepare('SELECT * FROM items WHERE barcode = ? AND active = 1').get(barcode);
  });

  ipcMain.handle('db:items:getById', (event, id) => {
    const db = getDb();
    return db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  });

  ipcMain.handle('db:items:getByCategory', (event, categoryId) => {
    const db = getDb();
    return db.prepare(
      'SELECT * FROM items WHERE category_id = ? AND active = 1 ORDER BY grid_position, name'
    ).all(categoryId);
  });

  ipcMain.handle('db:items:search', (event, query) => {
    const db = getDb();
    return db.prepare(
      "SELECT * FROM items WHERE active = 1 AND (name LIKE ? OR barcode LIKE ?) ORDER BY name LIMIT 50"
    ).all(`%${query}%`, `%${query}%`);
  });

  ipcMain.handle('db:items:create', (event, item) => {
    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO items (barcode, name, price, category_id, button_color, is_taxable, is_ebt_eligible, grid_position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      item.barcode || null, item.name, item.price,
      item.category_id || null, item.button_color || '#4A90D9',
      item.is_taxable ?? 1, item.is_ebt_eligible ?? 0,
      item.grid_position || null
    );
    return { id: result.lastInsertRowid, ...item };
  });

  ipcMain.handle('db:items:update', (event, id, item) => {
    const db = getDb();
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(item)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);
    db.prepare(`UPDATE items SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  });

  ipcMain.handle('db:items:delete', (event, id) => {
    const db = getDb();
    db.prepare('UPDATE items SET active = 0 WHERE id = ?').run(id);
    return { success: true };
  });

  // ─── CATEGORIES ───────────────────────────────────────
  ipcMain.handle('db:categories:getAll', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM categories ORDER BY display_order').all();
  });

  ipcMain.handle('db:categories:create', (event, category) => {
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO categories (name, display_order) VALUES (?, ?)'
    ).run(category.name, category.display_order || 0);
    return { id: result.lastInsertRowid, ...category };
  });

  ipcMain.handle('db:categories:update', (event, id, category) => {
    const db = getDb();
    db.prepare('UPDATE categories SET name = ?, display_order = ? WHERE id = ?')
      .run(category.name, category.display_order || 0, id);
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  });

  ipcMain.handle('db:categories:delete', (event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return { success: true };
  });

  // ─── CUSTOMERS ────────────────────────────────────────
  ipcMain.handle('db:customers:search', (event, query) => {
    const db = getDb();
    if (query.startsWith('#')) {
      // Search by phone
      const phone = query.slice(1);
      return db.prepare('SELECT * FROM customers WHERE phone LIKE ? LIMIT 20').all(`%${phone}%`);
    } else if (query.startsWith('@')) {
      // Search by email
      const email = query.slice(1);
      return db.prepare('SELECT * FROM customers WHERE email LIKE ? LIMIT 20').all(`%${email}%`);
    } else {
      // Search by name or customer number
      return db.prepare(
        'SELECT * FROM customers WHERE name LIKE ? OR customer_number LIKE ? LIMIT 20'
      ).all(`%${query}%`, `%${query}%`);
    }
  });

  ipcMain.handle('db:customers:getById', (event, id) => {
    const db = getDb();
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  });

  ipcMain.handle('db:customers:create', (event, customer) => {
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO customers (customer_number, name, phone, email) VALUES (?, ?, ?, ?)'
    ).run(customer.customer_number, customer.name, customer.phone || null, customer.email || null);
    return { id: result.lastInsertRowid, ...customer };
  });

  ipcMain.handle('db:customers:update', (event, id, customer) => {
    const db = getDb();
    db.prepare('UPDATE customers SET name = ?, phone = ?, email = ? WHERE id = ?')
      .run(customer.name, customer.phone || null, customer.email || null, id);
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  });

  // ─── TRANSACTIONS ─────────────────────────────────────
  ipcMain.handle('db:transactions:create', (event, data) => {
    const db = getDb();
    const { items, ...txn } = data;

    const insertTxn = db.prepare(`
      INSERT INTO transactions (customer_id, subtotal, tax_total, discount_total, grand_total,
        payment_type, amount_paid, change_given, transaction_type, ebt_amount, terminal_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO transaction_items (transaction_id, item_id, item_name, quantity, unit_price, line_total, discount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = db.transaction(() => {
      const txnResult = insertTxn.run(
        txn.customer_id || null, txn.subtotal, txn.tax_total,
        txn.discount_total || 0, txn.grand_total,
        txn.payment_type || 'cash', txn.amount_paid || 0,
        txn.change_given || 0, txn.transaction_type || 'sale',
        txn.ebt_amount || 0, txn.terminal_id || null
      );

      const txnId = txnResult.lastInsertRowid;

      if (items && items.length > 0) {
        items.forEach((item) => {
          insertItem.run(
            txnId, item.item_id || null, item.item_name || item.name,
            item.quantity, item.unit_price, item.line_total,
            item.discount || 0
          );
        });
      }

      return txnId;
    })();

    return { id: result, ...txn };
  });

  ipcMain.handle('db:transactions:getAll', (event, filters) => {
    const db = getDb();
    let sql = 'SELECT * FROM transactions';
    const params = [];

    if (filters) {
      const conditions = [];
      if (filters.date) {
        conditions.push("date(timestamp) = ?");
        params.push(filters.date);
      }
      if (filters.type) {
        conditions.push("transaction_type = ?");
        params.push(filters.type);
      }
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
    }

    sql += ' ORDER BY timestamp DESC LIMIT 500';
    return db.prepare(sql).all(...params);
  });

  ipcMain.handle('db:transactions:getById', (event, id) => {
    const db = getDb();
    const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (txn) {
      txn.items = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(id);
    }
    return txn;
  });

  ipcMain.handle('db:transactions:dailySales', (event, date) => {
    const db = getDb();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const summary = db.prepare(`
      SELECT
        COUNT(*) as transaction_count,
        COALESCE(SUM(subtotal), 0) as total_subtotal,
        COALESCE(SUM(tax_total), 0) as total_tax,
        COALESCE(SUM(grand_total), 0) as total_sales,
        COALESCE(SUM(discount_total), 0) as total_discounts,
        COALESCE(SUM(ebt_amount), 0) as total_ebt
      FROM transactions
      WHERE date(timestamp) = ?
    `).get(targetDate);

    const byPaymentType = db.prepare(`
      SELECT payment_type, COUNT(*) as count, COALESCE(SUM(grand_total), 0) as total
      FROM transactions
      WHERE date(timestamp) = ?
      GROUP BY payment_type
    `).all(targetDate);

    const transactions = db.prepare(`
      SELECT * FROM transactions
      WHERE date(timestamp) = ?
      ORDER BY timestamp DESC
    `).all(targetDate);

    return { date: targetDate, summary, byPaymentType, transactions };
  });

  // ─── SETTINGS ─────────────────────────────────────────
  ipcMain.handle('db:settings:get', (event, key) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : null;
  });

  ipcMain.handle('db:settings:set', (event, key, value) => {
    const db = getDb();
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    return { success: true };
  });

  ipcMain.handle('db:settings:getAll', () => {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });
    return settings;
  });

  // ─── PRINTER ──────────────────────────────────────────
  const printer = require('../services/printer.js');

  ipcMain.handle('printer:receipt', async (event, transaction) => {
    return await printer.printReceipt(transaction);
  });

  ipcMain.handle('printer:openDrawer', async () => {
    return await printer.openCashDrawer();
  });

  ipcMain.handle('printer:test', async () => {
    return await printer.testPrinter();
  });

  // ─── NETWORK ──────────────────────────────────────────
  const network = require('../services/network.js');

  ipcMain.handle('network:status', () => {
    return network.getServerStatus();
  });

  ipcMain.handle('network:setMode', (event, mode) => {
    if (mode === 'primary') {
      const db = getDb();
      const portRow = db.prepare("SELECT value FROM settings WHERE key = 'server_port'").get();
      const port = portRow ? parseInt(portRow.value) : 3000;
      network.startServer(port);
    } else {
      network.stopServer();
    }
    return { success: true };
  });
}

module.exports = { registerHandlers };
