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

  const store = useTransactionStore();

  // Barcode scanner - adds item when barcode is scanned
  const handleBarcodeScan = useCallback(async (barcode) => {
    if (!window.api) return;
    try {
      const item = await window.api.getItemByBarcode(barcode);
      if (item) {
        const qty = store.nextQuantity;
        for (let i = 0; i < qty; i++) {
          store.addItem(item);
        }
        if (qty > 1) store.setNextQuantity(1);
      } else {
        console.warn('Item not found for barcode:', barcode);
      }
    } catch (err) {
      console.error('Barcode lookup error:', err);
    }
  }, [store]);

  useBarcodeScanner(handleBarcodeScan);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRepeatLast: () => store.repeatLastItem(),                   // F1
    onDeleteLast: () => store.removeLastItem(),                   // F2
    onReturnNext: () => store.setReturnNext(true),                // F3
    onItemDirect: () => setShowGrid(true),                        // F4
    onQuantity: () => setQuantityPrompt(true),                    // F5
    onPrice: () => setPricePrompt(true),                          // F6
    onDiscount: () => setDiscountPrompt(true),                    // F7
    onSalesChange: () => {},                                       // F8
    onCancel: () => store.clearTransaction(),                      // F9
    onFinish: () => {                                              // F10
      if (store.items.length > 0) setShowPayment(true);
    },
    onCoupon: () => {},                                            // F11
    onItemLookup: () => setShowGrid(true),                        // F12
  });

  const handleAddGridItem = useCallback((item) => {
    const qty = store.nextQuantity;
    for (let i = 0; i < qty; i++) {
      store.addItem(item);
    }
    if (qty > 1) store.setNextQuantity(1);
  }, [store]);

  return (
    <div className="transaction-screen">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="store-name">JALISCO TIENDA MEXICANA</div>
        <div className="top-bar-right">
          <button
            className="btn-grid-toggle"
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
          <button
            className="btn-admin"
            onClick={() => window.location.hash = '#/admin'}
          >
            Admin
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Left Side - Customer + Controls */}
        <div className="left-panel">
          <div className="customer-section">
            <label className="section-label">Customer</label>
            {store.customer ? (
              <div className="customer-info">
                <span className="customer-name">{store.customer.name}</span>
                <button
                  className="btn-change-customer"
                  onClick={() => setShowCustomerLookup(true)}
                >
                  Change
                </button>
                <button
                  className="btn-clear-customer"
                  onClick={() => store.setCustomer(null)}
                >
                  Clear
                </button>
              </div>
            ) : (
              <button
                className="btn-customer-lookup"
                onClick={() => setShowCustomerLookup(true)}
              >
                Look Up Customer
              </button>
            )}
          </div>

          <TransactionControls />

          <div className="begin-section">
            <button
              className="btn-begin"
              onClick={() => {
                if (store.items.length > 0) {
                  setShowPayment(true);
                }
              }}
            >
              Begin Transaction
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
            <TransactionTable />
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

      {/* Totals Bar (always visible at bottom) */}
      <TotalsBar />

      {/* Modals */}
      {showCustomerLookup && (
        <CustomerLookup onClose={() => setShowCustomerLookup(false)} />
      )}

      {showPayment && (
        <PaymentModal onClose={() => setShowPayment(false)} />
      )}

      {/* Quantity Prompt */}
      {quantityPrompt && (
        <div className="modal-overlay" onClick={() => setQuantityPrompt(false)}>
          <div className="modal-content prompt-modal" onClick={e => e.stopPropagation()}>
            <h3>Enter Quantity</h3>
            <input
              type="number"
              min="1"
              defaultValue="1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  store.setNextQuantity(parseInt(e.target.value) || 1);
                  setQuantityPrompt(false);
                } else if (e.key === 'Escape') {
                  setQuantityPrompt(false);
                }
              }}
            />
            <p className="prompt-hint">Enter quantity for next item, then press Enter</p>
          </div>
        </div>
      )}

      {/* Price Override Prompt */}
      {pricePrompt && (
        <div className="modal-overlay" onClick={() => setPricePrompt(false)}>
          <div className="modal-content prompt-modal" onClick={e => e.stopPropagation()}>
            <h3>Price Override</h3>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter new price"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const price = parseFloat(e.target.value);
                  if (!isNaN(price) && store.items.length > 0) {
                    store.updateItemPrice(store.items.length - 1, price);
                  }
                  setPricePrompt(false);
                } else if (e.key === 'Escape') {
                  setPricePrompt(false);
                }
              }}
            />
            <p className="prompt-hint">Override price of last item, then press Enter</p>
          </div>
        </div>
      )}

      {/* Discount Prompt */}
      {discountPrompt && (
        <div className="modal-overlay" onClick={() => setDiscountPrompt(false)}>
          <div className="modal-content prompt-modal" onClick={e => e.stopPropagation()}>
            <h3>Discount %</h3>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              placeholder="Enter discount %"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const pct = parseFloat(e.target.value);
                  if (!isNaN(pct) && store.items.length > 0) {
                    const lastItem = store.items[store.items.length - 1];
                    const discountAmount = lastItem.line_total * (pct / 100);
                    store.updateItemDiscount(store.items.length - 1, discountAmount);
                  }
                  setDiscountPrompt(false);
                } else if (e.key === 'Escape') {
                  setDiscountPrompt(false);
                }
              }}
            />
            <p className="prompt-hint">Enter discount percentage for last item</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionScreen;
