/**
 * Network Service — Express server for multi-terminal POS
 *
 * Primary terminal: runs SQLite + Express server on the LAN
 * Secondary terminals: connect to the primary via HTTP
 */

const express = require('express');
const cors = require('cors');
const os = require('os');
const { getDb } = require('../database/index.js');

let server = null;

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

function startServer(port = 3000) {
  if (server) {
    console.log('Server already running');
    return;
  }

  const app = express();
  app.use(cors());
  app.use(express.json());

  // ─── ITEMS ENDPOINTS ────────────────────────────────
  app.get('/api/items', (req, res) => {
    const db = getDb();
    res.json(db.prepare('SELECT * FROM items WHERE active = 1 ORDER BY name').all());
  });

  app.get('/api/items/barcode/:barcode', (req, res) => {
    const db = getDb();
    const item = db.prepare('SELECT * FROM items WHERE barcode = ? AND active = 1').get(req.params.barcode);
    res.json(item || null);
  });

  app.get('/api/items/category/:categoryId', (req, res) => {
    const db = getDb();
    res.json(
      db.prepare('SELECT * FROM items WHERE category_id = ? AND active = 1 ORDER BY grid_position, name')
        .all(parseInt(req.params.categoryId))
    );
  });

  app.get('/api/items/search/:query', (req, res) => {
    const db = getDb();
    const q = `%${req.params.query}%`;
    res.json(
      db.prepare("SELECT * FROM items WHERE active = 1 AND (name LIKE ? OR barcode LIKE ?) ORDER BY name LIMIT 50")
        .all(q, q)
    );
  });

  app.post('/api/items', (req, res) => {
    const db = getDb();
    const item = req.body;
    const result = db.prepare(
      'INSERT INTO items (barcode, name, price, category_id, button_color, is_taxable, is_ebt_eligible, grid_position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(item.barcode || null, item.name, item.price, item.category_id || null, item.button_color || '#4A90D9', item.is_taxable ?? 1, item.is_ebt_eligible ?? 0, item.grid_position || null);
    res.json({ id: result.lastInsertRowid, ...item });
  });

  // ─── CATEGORIES ENDPOINTS ───────────────────────────
  app.get('/api/categories', (req, res) => {
    const db = getDb();
    res.json(db.prepare('SELECT * FROM categories ORDER BY display_order').all());
  });

  // ─── CUSTOMERS ENDPOINTS ────────────────────────────
  app.get('/api/customers/search/:query', (req, res) => {
    const db = getDb();
    const query = req.params.query;
    let results;

    if (query.startsWith('#')) {
      const phone = query.slice(1);
      results = db.prepare('SELECT * FROM customers WHERE phone LIKE ? LIMIT 20').all(`%${phone}%`);
    } else if (query.startsWith('@')) {
      const email = query.slice(1);
      results = db.prepare('SELECT * FROM customers WHERE email LIKE ? LIMIT 20').all(`%${email}%`);
    } else {
      results = db.prepare('SELECT * FROM customers WHERE name LIKE ? OR customer_number LIKE ? LIMIT 20').all(`%${query}%`, `%${query}%`);
    }

    res.json(results);
  });

  // ─── TRANSACTIONS ENDPOINTS ─────────────────────────
  app.post('/api/transactions', (req, res) => {
    const db = getDb();
    const { items, ...txn } = req.body;

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
          insertItem.run(txnId, item.item_id || null, item.item_name || item.name, item.quantity, item.unit_price, item.line_total, item.discount || 0);
        });
      }
      return txnId;
    })();

    res.json({ id: result, ...txn });
  });

  app.get('/api/transactions/daily/:date', (req, res) => {
    const db = getDb();
    const date = req.params.date;
    const summary = db.prepare(`
      SELECT COUNT(*) as transaction_count, COALESCE(SUM(subtotal), 0) as total_subtotal,
        COALESCE(SUM(tax_total), 0) as total_tax, COALESCE(SUM(grand_total), 0) as total_sales,
        COALESCE(SUM(discount_total), 0) as total_discounts, COALESCE(SUM(ebt_amount), 0) as total_ebt
      FROM transactions WHERE date(timestamp) = ?
    `).get(date);
    const byPaymentType = db.prepare(`
      SELECT payment_type, COUNT(*) as count, COALESCE(SUM(grand_total), 0) as total
      FROM transactions WHERE date(timestamp) = ? GROUP BY payment_type
    `).all(date);
    const transactions = db.prepare('SELECT * FROM transactions WHERE date(timestamp) = ? ORDER BY timestamp DESC').all(date);
    res.json({ date, summary, byPaymentType, transactions });
  });

  // ─── SETTINGS ENDPOINTS ─────────────────────────────
  app.get('/api/settings', (req, res) => {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    rows.forEach((row) => { settings[row.key] = row.value; });
    res.json(settings);
  });

  app.get('/api/settings/:key', (req, res) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key);
    res.json({ value: row ? row.value : null });
  });

  // ─── HEALTH CHECK ───────────────────────────────────
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', ip: getLocalIp(), timestamp: new Date().toISOString() });
  });

  server = app.listen(port, '0.0.0.0', () => {
    const ip = getLocalIp();
    console.log(`POS Server running at http://${ip}:${port}`);
    console.log(`Other terminals can connect to: ${ip}:${port}`);
  });

  return { ip: getLocalIp(), port };
}

function stopServer() {
  if (server) {
    server.close();
    server = null;
    console.log('POS Server stopped');
  }
}

function getServerStatus() {
  return {
    running: !!server,
    ip: getLocalIp(),
    mode: 'primary'
  };
}

module.exports = { startServer, stopServer, getServerStatus, getLocalIp };
