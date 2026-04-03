# Jalisco Tienda Mexicana POS

## Project Overview

Point of Sale system for **Jalisco Tienda Mexicana**, a Mexican grocery store and restaurant. The app runs as both an Electron desktop app (production) and a browser preview (GitHub Pages demo). It handles grocery/restaurant transactions with barcode scanning, item grid selection, customer lookup, payment processing, held transactions, and receipt printing.

**Live preview:** https://graphicaljerry.github.io/Jaliscotiendamexicana/
**Figma designs:** https://www.figma.com/design/rRcPCDbbV4Vv37GRzVdUu8/Jalisco-Tienda-Mexicana

## Tech Stack

- **Framework:** React 18 + Vite 6
- **Desktop:** Electron 33 (with electron-builder for packaging)
- **State:** Zustand 4 (single store: `transactionStore.js`)
- **Routing:** React Router v6 (HashRouter — `#/` for POS, `#/admin` for admin)
- **Styling:** Plain CSS with CSS variables (NO Tailwind, NO CSS modules)
- **Database:** better-sqlite3 (Electron only; browser uses mock API)
- **Printer:** node-thermal-printer (Electron only)
- **Inventory:** 17,698 items loaded from `src/data/inventory.json` (TGS export, ~1.5MB)

## Architecture

### File Structure
```
src/
  App.jsx                    # HashRouter with / and /admin routes
  main.jsx                   # Entry point, installs mock API for browser
  api-mock.js                # Browser mock: categories, items, customers, barcode lookup
  data/inventory.json        # 17,698 store items (barcode, name, price, tax, ebt)
  stores/transactionStore.js # Zustand store — ALL transaction state and computed values
  hooks/
    useBarcodeScanner.js     # USB barcode scanner detection (rapid keystroke pattern)
    useKeyboardShortcuts.js  # F1-F12 + Escape key mappings
  components/
    layout/
      TopBar.jsx/css         # Dark #121212 header bar (logo, txn#, Item Grid, Admin)
      TotalsBar.jsx/css      # Bottom totals (Paid, Change, Items, Sub Total, Tax, EBT, Grand Total)
      Logo.jsx               # Color SVG logo (jalisco-logo-color.svg)
    transaction/
      TransactionScreen.jsx/css  # Main POS screen — orchestrates everything
      TransactionTable.jsx/css   # Item list table with inline editing, search, barcode input
      TransactionControls.jsx/css # Sidebar controls (Transaction Type, Tax, Discount, Output)
      FunctionBar.jsx/css        # Active transaction function keys (F1-F12 row)
      IdleFunctionBar.jsx        # Idle state keys (Sale, Return, Reload Held, etc.)
    grid/
      ItemGrid.jsx/css       # Category grid → item sub-grid for restaurant menu
    customer/
      CustomerLookup.jsx/css # Customer search modal (name, phone, email)
    payment/
      PaymentModal.jsx/css   # Payment entry (cash/credit/debit/EBT, numpad, split payments)
      HeldTransactionsModal.jsx/css # Reload or delete held transactions
    admin/
      AdminScreen.jsx/css    # Admin panel (settings, categories, items management)
```

### State Management (transactionStore.js)

Single Zustand store manages:
- `items[]` — current transaction line items
- `customer` — selected customer (or null)
- `transactionType` — sale | return | layaway | order | quote
- `taxType` — taxable | tax_exempt | alt_tax
- `discountMode` — none | by_line | all
- `outputType` — paper_tape | invoice
- `isActive` — whether a transaction is in progress
- `transactionNumber` — auto-incrementing (starts at 300001)
- `heldTransactions[]` — transactions put on hold
- Computed: `getSubtotal()`, `getTaxTotal()`, `getGrandTotal()`, `getEbtEligibleTotal()`, `getChange()`

### Two Function Bar States

1. **Idle** (`IdleFunctionBar`): Sale, Return, Lay-A-Way, Order, Quote, Alternate Tax Rate, Discount, Cash Check, Cash Drawer, Customer Inquiry, Open Drawer, Tax Type, Print Form, Payment, Pay Out, Reload Held Transaction, Item Inquiry, Exit
2. **Active** (`FunctionBar`): Repeat Last, Return Next, Quantity, Discount, Cancel, Coupon, Customer Inquiry, Write Memo, Put on Hold, Delete Last, Item Direct, Price, Sls. Change, Finish, Item Lookup, Item Inquiry, Tax Exempt Next, Open Drawer

### Keyboard Shortcuts
- **F1-F12** mapped to function bar actions (context-dependent on idle vs active)
- **Escape** cancels active transaction, returns to idle
- **Enter** in code input submits barcode/quick code
- Payment modal: F1=Cash, F2=Debit, F3=Credit, F4=EBT

### Quick Codes (typed into item code input)
- `000` — Convenience Fee (taxable, price entered manually)
- `1` — Grocery (non-taxable, EBT eligible, price entered manually)
- `2` — Grocery Tax (taxable, price entered manually)
- `3` — Meat/Carne/Cheese (taxable, EBT eligible, price entered manually)
- `5` — Restaurant/Food (taxable, price entered manually)
- `11` — Boss Revolution (taxable, price entered manually)

### Item Search Priority
Search results are ordered: exact barcode match first, then barcode-starts-with, then partial name/barcode matches. Within each tier, results sort by highest price first.

## Design System (from Figma)

### Layout
- **Content wrapper:** 94.8vw width, centered (no px max-width)
- **Header:** Full-width, `#121212` background, 62px height
- **Sidebar:** 223px overlay panel, slides from left, `#fbfbfb` background
- **Table:** Split into fixed header + scrollable body (scrollbar below header only)
- **Totals bar:** Rounded 14px container
- **Function keys:** Rounded 14px container, two rows of 9 keys each, 85px key height
- **Bottom padding:** 35px below function keys

### Colors
- Header: `#121212`
- Active sidebar buttons: `#47ab77` (green)
- Inactive sidebar buttons: `#ffffff` bg, `#d1d9e6` border, `#4a5568` text
- Control group backgrounds: `#ecedf1`
- Item Grid button: `#47ab77`
- Scale button: `#ea8b0c`
- Admin button: `rgba(255,255,255,0.15)` with `rgba(255,255,255,0.3)` border
- Cancel key: white with `#e26666` border
- Finish key: `#47ab77` fill, `#c9f0dc` key text, `#f3f3f7` label text
- Table header: `#121212`
- Row borders: `rgba(103, 133, 140, 0.3)`
- NT badge: `#e8ecf1` bg, `#1e40af` text
- Grand Total: `#282828` (38px bold)
- EBT Eligible: `#0d9488` (teal)
- Labels/muted text: `#8896a6`
- Primary text: `#1a1a2e`

### Background Gradients
Three CSS `radial-gradient` on `#root`:
1. Cool blue-gray top-left: `#b8c0c4`
2. Warm golden top-right: `#d4bc9a`
3. Steel blue-gray bottom: `#9aacb3`
Base color: `#e8e8e8`

Content areas use semi-transparent backgrounds (70-85% opacity) with `backdrop-filter: blur(12px)` so gradients bleed through.

### Typography
- Font: Inter (with system fallbacks)
- Table data: 14px
- Function key labels: 12px semibold
- Function key shortcuts: 9px bold, `#8896a6`
- Section labels: 10px bold uppercase, 0.5px tracking, `#8896a6`
- Control buttons: 10px semibold

### Sidebar Shadow (Figma exact)
```css
box-shadow: 112px 0 31px rgba(0,0,0,0), 71px 0 29px rgba(0,0,0,0.01),
            40px 0 24px rgba(0,0,0,0.03), 18px 0 18px rgba(0,0,0,0.06),
            4px 0 10px rgba(0,0,0,0.06);
```

## Important Rules

### CSS-Only UI Changes
When redesigning the UI, prefer CSS-only changes. Do NOT modify JSX unless the structure itself needs to change (like adding/removing DOM elements). All functionality is in the JSX/hooks/store — the CSS handles the visual design.

### No Tailwind
This project uses plain CSS with CSS variables. Do NOT install Tailwind or convert to Tailwind classes.

### Mock API vs Electron API
- `window.api` is set by Electron's preload script in production
- `api-mock.js` installs a mock `window.api` for browser preview
- Always check `if (window.api)` before calling API methods
- Mock data includes categories with items, 3 sample customers, and 17K inventory items

### Barcode Scanner
USB barcode scanners send keystrokes rapidly (<50ms between chars) followed by Enter. The `useBarcodeScanner` hook detects this pattern and triggers item lookup. It only activates when focus is NOT on an input/textarea.

### Transaction Flow
1. User is in idle state (IdleFunctionBar shown)
2. Items added via: barcode scan, quick code, search, or item grid
3. Transaction auto-begins on first item (assigns transaction number)
4. Active FunctionBar replaces idle bar
5. User can: edit qty/price inline, remove items, apply discounts, hold transaction
6. ESC or F9 cancels → back to idle
7. F10 or "Finish" opens PaymentModal
8. Payment completed → receipt prints → transaction clears → back to idle

### Logo
The color logo SVG is at `public/jalisco-logo-color.svg` — red sombrero (#EE5F5D), green band (#46BC96), white JALISCO text. Built from Figma asset parts. The old white-only PNG is still in public/ but unused.

## Build & Run

```bash
npm run dev          # Vite dev server (browser preview with mock API)
npm run build        # Production build (dist/)
npm run dev:electron # Full Electron app with real database
```

## Deployment

GitHub Pages deployment serves the Vite build from `dist/` as a static site. The mock API (`api-mock.js`) provides all data for the browser preview. Cache-bust with `?v=N` query param.
