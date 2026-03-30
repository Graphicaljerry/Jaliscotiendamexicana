/**
 * Thermal Receipt Printer Service
 * Uses node-thermal-printer for ESC/POS receipt printing.
 * Falls back to console logging if no printer is connected.
 */

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

function getStoreName() {
  try {
    const db = getDb();
    const row = db.prepare("SELECT value FROM settings WHERE key = 'store_name'").get();
    return row ? row.value : 'Jalisco Tienda Mexicana';
  } catch {
    return 'Jalisco Tienda Mexicana';
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

async function printReceipt(transaction) {
  const printer = await createPrinter();
  const storeName = getStoreName();
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();

  if (!printer) {
    // Log receipt to console as fallback
    console.log('═══════════════════════════════════');
    console.log(`  ${storeName}`);
    console.log(`  ${dateStr} ${timeStr}`);
    console.log('───────────────────────────────────');
    if (transaction.items) {
      transaction.items.forEach((item) => {
        const name = item.item_name || item.name;
        console.log(`  ${item.quantity}x ${name}  $${item.line_total.toFixed(2)}`);
        if (item.discount > 0) {
          console.log(`     Disc: -$${item.discount.toFixed(2)}`);
        }
      });
    }
    console.log('───────────────────────────────────');
    console.log(`  Subtotal:  $${transaction.subtotal.toFixed(2)}`);
    console.log(`  Tax:       $${transaction.tax_total.toFixed(2)}`);
    console.log(`  TOTAL:     $${transaction.grand_total.toFixed(2)}`);
    console.log(`  Paid:      $${transaction.amount_paid.toFixed(2)}`);
    console.log(`  Change:    $${transaction.change_given.toFixed(2)}`);
    console.log('───────────────────────────────────');
    console.log('  Thank you for your purchase!');
    console.log('═══════════════════════════════════');
    return { success: true, message: 'Receipt logged (no printer)' };
  }

  try {
    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println(storeName);
    printer.bold(false);
    printer.setTextNormal();
    printer.println(`${dateStr} ${timeStr}`);
    if (transaction.id) {
      printer.println(`Transaction #${transaction.id}`);
    }
    printer.drawLine();

    // Items
    printer.alignLeft();
    if (transaction.items) {
      transaction.items.forEach((item) => {
        const name = item.item_name || item.name;
        printer.tableCustom([
          { text: `${item.quantity}x ${name}`, align: 'LEFT', width: 0.7 },
          { text: `$${item.line_total.toFixed(2)}`, align: 'RIGHT', width: 0.3 }
        ]);
        if (item.discount > 0) {
          printer.println(`  Disc: -$${item.discount.toFixed(2)}`);
        }
      });
    }

    printer.drawLine();

    // Totals
    printer.tableCustom([
      { text: 'Subtotal:', align: 'LEFT', width: 0.6 },
      { text: `$${transaction.subtotal.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
    ]);
    printer.tableCustom([
      { text: 'Tax:', align: 'LEFT', width: 0.6 },
      { text: `$${transaction.tax_total.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
    ]);

    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.tableCustom([
      { text: 'TOTAL:', align: 'LEFT', width: 0.6 },
      { text: `$${transaction.grand_total.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
    ]);
    printer.bold(false);
    printer.setTextNormal();

    printer.tableCustom([
      { text: `Paid (${transaction.payment_type}):`, align: 'LEFT', width: 0.6 },
      { text: `$${transaction.amount_paid.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
    ]);

    if (transaction.change_given > 0) {
      printer.tableCustom([
        { text: 'Change:', align: 'LEFT', width: 0.6 },
        { text: `$${transaction.change_given.toFixed(2)}`, align: 'RIGHT', width: 0.4 }
      ]);
    }

    printer.drawLine();
    printer.alignCenter();
    printer.println('Thank you for your purchase!');
    printer.println('Gracias por su compra!');
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

  try {
    printer.alignCenter();
    printer.bold(true);
    printer.println('=== PRINTER TEST ===');
    printer.bold(false);
    printer.println(getStoreName());
    printer.println(new Date().toLocaleString());
    printer.println('Printer is working!');
    printer.cut();
    await printer.execute();
    return { success: true, message: 'Test page printed successfully!' };
  } catch (err) {
    return { success: false, message: 'Print test failed: ' + err.message };
  }
}

module.exports = { printReceipt, openCashDrawer, testPrinter };
