/**
 * Thermal Receipt Printer Service
 * Uses node-thermal-printer for ESC/POS receipt printing.
 * Falls back to console logging if no printer is connected.
 */

const path = require('path');

let ThermalPrinter = null;
let PrinterTypes = null;

try {
  const thermalPrinter = require('node-thermal-printer');
  ThermalPrinter = thermalPrinter.printer;
  PrinterTypes = thermalPrinter.types;
} catch (err) {
  console.warn('node-thermal-printer not available:', err.message);
}

const { getDb } = require('../database/index.js');

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'receipt-logo.png');

async function getPrinterConfig() {
  try {
    const db = getDb();
    const printerType = db.prepare("SELECT value FROM settings WHERE key = 'printer_type'").get();
    const printerInterface = db.prepare("SELECT value FROM settings WHERE key = 'printer_interface'").get();
    return {
      type: printerType ? printerType.value : 'epson',
      interface: printerInterface ? printerInterface.value : ''
    };
  } catch {
    return { type: 'epson', interface: '' };
  }
}

function getStoreInfo() {
  try {
    const db = getDb();
    const name = db.prepare("SELECT value FROM settings WHERE key = 'store_name'").get();
    const address = db.prepare("SELECT value FROM settings WHERE key = 'store_address'").get();
    const phone = db.prepare("SELECT value FROM settings WHERE key = 'store_phone'").get();
    return {
      name: name ? name.value : 'Jalisco Tienda Mexicana',
      address: address ? address.value : '',
      phone: phone ? phone.value : ''
    };
  } catch {
    return { name: 'Jalisco Tienda Mexicana', address: '', phone: '' };
  }
}

async function createPrinter() {
  if (!ThermalPrinter || !PrinterTypes) {
    return null;
  }

  const config = await getPrinterConfig();
  if (!config.interface) {
    console.log('No printer interface configured');
    return null;
  }

  const typeMap = {
    epson: PrinterTypes.EPSON,
    star: PrinterTypes.STAR,
    tanca: PrinterTypes.TANCA,
    daruma: PrinterTypes.DARUMA
  };

  const printer = new ThermalPrinter({
    type: typeMap[config.type] || PrinterTypes.EPSON,
    interface: config.interface,
    options: {
      timeout: 3000
    }
  });

  const isConnected = await printer.isPrinterConnected();
  if (!isConnected) {
    console.warn('Printer not connected at:', config.interface);
    return null;
  }

  return printer;
}

// Generate a short receipt number from transaction ID + timestamp
function receiptNumber(txnId) {
  const date = new Date();
  const dayCode = `${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  return `R${dayCode}-${txnId || '0000'}`;
}

async function printReceipt(transaction) {
  const printer = await createPrinter();
  const store = getStoreInfo();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const rcptNum = receiptNumber(transaction.id);

  // Calculate EBT eligible total from items
  const ebtTotal = (transaction.items || [])
    .filter(item => item.is_ebt_eligible)
    .reduce((sum, item) => sum + item.line_total - (item.discount || 0), 0);

  if (!printer) {
    // ─── Console fallback ─────────────────────────────
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║     JALISCO TIENDA MEXICANA          ║');
    if (store.address) console.log(`║  ${store.address.padStart(20).padEnd(36)}║`);
    if (store.phone) console.log(`║  ${store.phone.padStart(18).padEnd(36)}║`);
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  Date: ${dateStr}  Time: ${timeStr}  ║`);
    console.log(`║  Receipt: ${rcptNum.padEnd(26)}║`);
    if (transaction.id) {
      console.log(`║  Txn #${String(transaction.id).padEnd(30)}║`);
    }
    if (transaction.customer_name) {
      console.log(`║  Customer: ${transaction.customer_name.padEnd(25)}║`);
    }
    console.log(`║  Type: ${(transaction.transaction_type || 'sale').toUpperCase().padEnd(29)}║`);
    console.log('╠══════════════════════════════════════╣');
    console.log('║  QTY  ITEM                    PRICE  ║');
    console.log('║──────────────────────────────────────║');
    if (transaction.items) {
      transaction.items.forEach((item) => {
        const name = (item.item_name || item.name || '').substring(0, 20);
        const taxFlag = item.is_taxable === 0 ? ' NT' : '';
        const price = `$${item.line_total.toFixed(2)}`;
        console.log(`║  ${item.quantity}x  ${(name + taxFlag).padEnd(24)} ${price.padStart(7)}  ║`);
        if (item.discount > 0) {
          console.log(`║       DISC: -$${item.discount.toFixed(2).padEnd(22)}║`);
        }
      });
    }
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  Subtotal:              $${transaction.subtotal.toFixed(2).padStart(9)}  ║`);
    console.log(`║  Tax:                   $${transaction.tax_total.toFixed(2).padStart(9)}  ║`);
    if (transaction.discount_total > 0) {
      console.log(`║  Discount:             -$${transaction.discount_total.toFixed(2).padStart(9)}  ║`);
    }
    console.log('║──────────────────────────────────────║');
    console.log(`║  TOTAL:                 $${transaction.grand_total.toFixed(2).padStart(9)}  ║`);
    console.log('║──────────────────────────────────────║');
    console.log(`║  Paid (${(transaction.payment_type || 'cash').padEnd(8)}):    $${transaction.amount_paid.toFixed(2).padStart(9)}  ║`);
    if (transaction.change_given > 0) {
      console.log(`║  Change:                $${transaction.change_given.toFixed(2).padStart(9)}  ║`);
    }
    if (ebtTotal > 0) {
      console.log(`║  EBT Eligible:          $${ebtTotal.toFixed(2).padStart(9)}  ║`);
    }
    if (transaction.ebt_amount > 0) {
      console.log(`║  EBT Applied:           $${transaction.ebt_amount.toFixed(2).padStart(9)}  ║`);
    }
    console.log('╠══════════════════════════════════════╣');
    console.log('║                                      ║');
    console.log('║    Thank you for your purchase!       ║');
    console.log('║    Gracias por su compra!             ║');
    console.log('║                                      ║');
    console.log(`║    ${rcptNum.padStart(20).padEnd(36)}║`);
    console.log('╚══════════════════════════════════════╝');
    console.log('');
    return { success: true, message: 'Receipt logged (no printer)' };
  }

  // ─── Thermal printer output ───────────────────────
  try {
    // Logo
    try {
      const fs = require('fs');
      if (fs.existsSync(LOGO_PATH)) {
        await printer.printImage(LOGO_PATH);
        printer.newLine();
      }
    } catch (logoErr) {
      // Logo failed, print text header instead
      printer.alignCenter();
      printer.bold(true);
      printer.setTextSize(1, 1);
      printer.println(store.name);
      printer.bold(false);
      printer.setTextNormal();
    }

    // Store info
    printer.alignCenter();
    printer.setTextNormal();
    if (store.address) printer.println(store.address);
    if (store.phone) printer.println(store.phone);
    printer.newLine();

    // Date / Receipt / Transaction info
    printer.println(`${dateStr}  ${timeStr}`);
    printer.println(`Receipt: ${rcptNum}`);
    if (transaction.id) {
      printer.println(`Transaction #${transaction.id}`);
    }
    if (transaction.customer_name) {
      printer.println(`Customer: ${transaction.customer_name}`);
    }
    printer.println(`Type: ${(transaction.transaction_type || 'sale').toUpperCase()}`);
    printer.drawLine();

    // Column header
    printer.alignLeft();
    printer.bold(true);
    printer.tableCustom([
      { text: 'QTY', align: 'LEFT', width: 0.1 },
      { text: 'ITEM', align: 'LEFT', width: 0.6 },
      { text: 'PRICE', align: 'RIGHT', width: 0.3 }
    ]);
    printer.bold(false);
    printer.drawLine();

    // Items
    if (transaction.items) {
      transaction.items.forEach((item) => {
        const name = (item.item_name || item.name || '');
        const taxFlag = item.is_taxable === 0 ? ' [NT]' : '';
        printer.tableCustom([
          { text: `${item.quantity}x`, align: 'LEFT', width: 0.1 },
          { text: `${name}${taxFlag}`, align: 'LEFT', width: 0.6 },
          { text: `$${item.line_total.toFixed(2)}`, align: 'RIGHT', width: 0.3 }
        ]);
        if (item.discount > 0) {
          printer.println(`     DISC: -$${item.discount.toFixed(2)}`);
        }
      });
    }

    printer.drawLine();

    // Totals section
    printer.tableCustom([
      { text: 'Subtotal:', align: 'LEFT', width: 0.6 },
      { text: `$${transaction.subtotal.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
    ]);
    printer.tableCustom([
      { text: 'Tax:', align: 'LEFT', width: 0.6 },
      { text: `$${transaction.tax_total.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
    ]);

    if (transaction.discount_total > 0) {
      printer.tableCustom([
        { text: 'Discount:', align: 'LEFT', width: 0.6 },
        { text: `-$${transaction.discount_total.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
      ]);
    }

    printer.drawLine();

    // Grand total — bold and larger
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.tableCustom([
      { text: 'TOTAL:', align: 'LEFT', width: 0.5 },
      { text: `$${transaction.grand_total.toFixed(2)}`, align: 'RIGHT', width: 0.5 }
    ]);
    printer.bold(false);
    printer.setTextNormal();

    printer.drawLine();

    // Payment details
    const payType = (transaction.payment_type || 'cash').toUpperCase();
    printer.tableCustom([
      { text: `Paid (${payType}):`, align: 'LEFT', width: 0.6 },
      { text: `$${transaction.amount_paid.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
    ]);

    if (transaction.change_given > 0) {
      printer.bold(true);
      printer.tableCustom([
        { text: 'CHANGE DUE:', align: 'LEFT', width: 0.6 },
        { text: `$${transaction.change_given.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
      ]);
      printer.bold(false);
    }

    // EBT section
    if (ebtTotal > 0) {
      printer.newLine();
      printer.tableCustom([
        { text: 'EBT Eligible:', align: 'LEFT', width: 0.6 },
        { text: `$${ebtTotal.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
      ]);
    }
    if (transaction.ebt_amount > 0) {
      printer.tableCustom([
        { text: 'EBT Applied:', align: 'LEFT', width: 0.6 },
        { text: `$${transaction.ebt_amount.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
      ]);
    }

    printer.drawLine();

    // Footer
    printer.alignCenter();
    printer.newLine();
    printer.bold(true);
    printer.println('Thank you for your purchase!');
    printer.println('Gracias por su compra!');
    printer.bold(false);
    printer.newLine();

    // Receipt reference
    printer.setTextSize(0, 0);
    printer.println(rcptNum);
    printer.newLine();
    printer.newLine();

    printer.cut();
    await printer.execute();
    return { success: true, message: 'Receipt printed' };
  } catch (err) {
    console.error('Print error:', err);
    return { success: false, message: err.message };
  }
}

async function openCashDrawer() {
  const printer = await createPrinter();
  if (!printer) {
    console.log('Cash drawer open (no printer connected)');
    return { success: true, message: 'Drawer command sent (no printer)' };
  }

  try {
    printer.openCashDrawer();
    await printer.execute();
    return { success: true, message: 'Cash drawer opened' };
  } catch (err) {
    console.error('Cash drawer error:', err);
    return { success: false, message: err.message };
  }
}

async function testPrinter() {
  const printer = await createPrinter();
  if (!printer) {
    return { success: false, message: 'No printer connected. Check printer settings.' };
  }

  const store = getStoreInfo();

  try {
    // Try printing logo
    try {
      const fs = require('fs');
      if (fs.existsSync(LOGO_PATH)) {
        await printer.printImage(LOGO_PATH);
        printer.newLine();
      }
    } catch {
      // Skip logo on test if it fails
    }

    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println('=== PRINTER TEST ===');
    printer.bold(false);
    printer.setTextNormal();
    printer.println(store.name);
    if (store.address) printer.println(store.address);
    if (store.phone) printer.println(store.phone);
    printer.newLine();
    printer.println(new Date().toLocaleString());
    printer.println('Printer is working!');
    printer.newLine();
    printer.cut();
    await printer.execute();
    return { success: true, message: 'Test page printed successfully!' };
  } catch (err) {
    return { success: false, message: 'Print test failed: ' + err.message };
  }
}

module.exports = { printReceipt, openCashDrawer, testPrinter };
