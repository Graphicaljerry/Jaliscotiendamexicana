import React, { useState, useCallback } from 'react';
import TransactionTable from './TransactionTable';
import TransactionControls from './TransactionControls';
import FunctionBar from './FunctionBar';
import TotalsBar from '../layout/TotalsBar';
import ItemGrid from '../grid/ItemGrid';
import CustomerLookup from '../customer/CustomerLookup';
import PaymentModal from '../payment/PaymentModal';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useTransactionStore from '../../stores/transactionStore';
import './TransactionScreen.css';

function TransactionScreen() {
  const [showGrid, setShowGrid] = useState(false);
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [quantityPrompt, setQuantityPrompt] = useState(false);
  const [pricePrompt, setPricePrompt] = useState(false);
  const [discountPrompt, setDiscountPrompt] = useState(false);
  const [showScale, setShowScale] = useState(false);
  const [scaleWeight, setScaleWeight] = useState('0.00');

  const store = useTransactionStore();

  // Barcode scanner - adds item when barcode is scanned
  const handleBarcodeScan = useCallback(async (barcode) => {
    if (!window.api) return;
    try {
      const item = await window.api.getItemByBarcode(barcode);
      if (item) {
        // If item is sold by scale, open scale prompt
        if (item.sell_by === 'S') {
          setScaleWeight((1 + Math.random() * 3).toFixed(2));
          store.addItem(item);
          setShowScale(true);
        } else {
          store.addItem(item);
        }
      }
    } catch (err) {
      console.error('Barcode lookup error:', err);
    }
  }, [store]);

  useBarcodeScanner(handleBarcodeScan);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRepeatLast: () => store.repeatLastItem(),
    onDeleteLast: () => store.removeLastItem(),
    onReturnNext: () => store.setReturnNext(true),
    onItemDirect: () => setShowGrid(true),
    onQuantity: () => setQuantityPrompt(true),
    onPrice: () => setPricePrompt(true),
    onDiscount: () => setDiscountPrompt(true),
    onSalesChange: () => {},
    onCancel: () => store.clearTransaction(),
    onFinish: () => {
      if (store.items.length > 0) setShowPayment(true);
    },
    onCoupon: () => {},
    onItemLookup: () => setShowGrid(true),
  });

  const handleAddGridItem = useCallback((item) => {
    store.addItem(item);
  }, [store]);

  // Called from TransactionTable when user types a code inline
  const handleInlineItemAdd = useCallback(async (code) => {
    if (!window.api) return false;
    let item = await window.api.getItemByBarcode(code);
    if (!item) {
      item = await window.api.getItemById(parseInt(code));
    }
    if (item) {
      store.addItem(item);
      // If sold by scale, open scale modal
      if (item.sell_by === 'S') {
        setScaleWeight((1 + Math.random() * 3).toFixed(2));
        setShowScale(true);
      }
      return true;
    }
    return false;
  }, [store]);

  // Scale confirm - apply weight to last item
  const handleScaleConfirm = () => {
    if (store.items.length > 0) {
      const lastIndex = store.items.length - 1;
      const weight = parseFloat(scaleWeight);
      const lastItem = store.items[lastIndex];
      store.updateItemPrice(lastIndex, lastItem.unit_price * weight);
    }
    setShowScale(false);
  };

  return (
    <div className="transaction-screen">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="store-name">JALISCO TIENDA MEXICANA</div>
        <div className="top-bar-center">
          <span className="txn-label">Sale Transaction Entry</span>
        </div>
        <div className="top-bar-right">
          <button className="btn-scale-top" onClick={() => {
            setScaleWeight((1 + Math.random() * 3).toFixed(2));
            setShowScale(true);
          }}>
            Scale Weight (Shift+F1)
          </button>
          <button className="btn-grid-toggle" onClick={() => setShowGrid(!showGrid)}>
            {showGrid ? 'Hide Grid' : 'Item Grid'}
          </button>
          <button className="btn-admin" onClick={() => window.location.hash = '#/admin'}>
            Admin
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Left Side - Customer + Controls */}
        <div className="left-panel">
          <div className="customer-section">
            <label className="section-label">Customer Lookup</label>
            {store.customer ? (
              <div className="customer-info">
                <span className="customer-name">{store.customer.name}</span>
                <button className="btn-change-customer" onClick={() => setShowCustomerLookup(true)}>Change</button>
                <button className="btn-clear-customer" onClick={() => store.setCustomer(null)}>Clear</button>
              </div>
            ) : (
              <button className="btn-customer-lookup" onClick={() => setShowCustomerLookup(true)}>
                Look Up Customer
              </button>
            )}
          </div>

          <TransactionControls />

          <div className="begin-section">
            <button
              className="btn-begin"
              onClick={() => {
                if (store.items.length > 0) setShowPayment(true);
              }}
            >
              Finish / Payment
            </button>
          </div>
        </div>

        {/* Center - Transaction Table or Item Grid */}
        <div className="center-panel">
          {showGrid ? (
            <ItemGrid
              onSelectItem={handleAddGridItem}
              onHideGrid={() => setShowGrid(false)}
            />
          ) : (
            <TransactionTable
              onInlineItemAdd={handleInlineItemAdd}
              onOpenScale={() => {
                setScaleWeight((1 + Math.random() * 3).toFixed(2));
                setShowScale(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Function Bar */}
      <FunctionBar
        onShowGrid={() => setShowGrid(true)}
        onShowCustomer={() => setShowCustomerLookup(true)}
        onShowPayment={() => {
          if (store.items.length > 0) setShowPayment(true);
        }}
        onQuantityPrompt={() => setQuantityPrompt(true)}
        onPricePrompt={() => setPricePrompt(true)}
        onDiscountPrompt={() => setDiscountPrompt(true)}
      />

      {/* Totals Bar */}
      <TotalsBar />

      {/* Modals */}
      {showCustomerLookup && (
        <CustomerLookup onClose={() => setShowCustomerLookup(false)} />
      )}

      {showPayment && (
        <PaymentModal onClose={() => setShowPayment(false)} />
      )}

      {/* Scale Modal */}
      {showScale && (
        <div className="modal-overlay" onClick={() => setShowScale(false)}>
          <div className="modal-content scale-modal" onClick={e => e.stopPropagation()}>
            <h3>Scale Weight</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Reading from scale:</p>
            <div className="scale-display">{scaleWeight}</div>
            <div className="scale-unit">LB</div>
            <div style={{ marginBottom: 12 }}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={scaleWeight}
                onChange={(e) => setScaleWeight(e.target.value)}
                style={{ width: '100%', fontSize: 20, textAlign: 'center', padding: 8 }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleScaleConfirm();
                  if (e.key === 'Escape') setShowScale(false);
                }}
              />
            </div>
            <div className="scale-actions">
              <button className="btn-scale-cancel" onClick={() => setShowScale(false)}>Cancel</button>
              <button className="btn-scale-confirm" onClick={handleScaleConfirm}>Apply Weight</button>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Prompt */}
      {quantityPrompt && (
        <div className="modal-overlay" onClick={() => setQuantityPrompt(false)}>
          <div className="modal-content prompt-modal" onClick={e => e.stopPropagation()}>
            <h3>Enter Quantity</h3>
            <input type="number" min="1" defaultValue="1" autoFocus onKeyDown={(e) => {
              if (e.key === 'Enter') { store.setNextQuantity(parseInt(e.target.value) || 1); setQuantityPrompt(false); }
              else if (e.key === 'Escape') setQuantityPrompt(false);
            }} />
            <p className="prompt-hint">Enter quantity for next item, then press Enter</p>
          </div>
        </div>
      )}

      {/* Price Override */}
      {pricePrompt && (
        <div className="modal-overlay" onClick={() => setPricePrompt(false)}>
          <div className="modal-content prompt-modal" onClick={e => e.stopPropagation()}>
            <h3>Price Override</h3>
            <input type="number" step="0.01" min="0" placeholder="Enter new price" autoFocus onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const price = parseFloat(e.target.value);
                if (!isNaN(price) && store.items.length > 0) store.updateItemPrice(store.items.length - 1, price);
                setPricePrompt(false);
              } else if (e.key === 'Escape') setPricePrompt(false);
            }} />
            <p className="prompt-hint">Override price of last item, then press Enter</p>
          </div>
        </div>
      )}

      {/* Discount */}
      {discountPrompt && (
        <div className="modal-overlay" onClick={() => setDiscountPrompt(false)}>
          <div className="modal-content prompt-modal" onClick={e => e.stopPropagation()}>
            <h3>Discount %</h3>
            <input type="number" step="1" min="0" max="100" placeholder="Enter discount %" autoFocus onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const pct = parseFloat(e.target.value);
                if (!isNaN(pct) && store.items.length > 0) {
                  const lastItem = store.items[store.items.length - 1];
                  store.updateItemDiscount(store.items.length - 1, lastItem.line_total * (pct / 100));
                }
                setDiscountPrompt(false);
              } else if (e.key === 'Escape') setDiscountPrompt(false);
            }} />
            <p className="prompt-hint">Enter discount percentage for last item</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionScreen;
