import React, { useState, useCallback, useRef, useEffect } from 'react';
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

  // SKU / Item lookup state
  const [skuInput, setSkuInput] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [skuError, setSkuError] = useState('');
  const skuRef = useRef(null);

  // Scale state
  const [showScale, setShowScale] = useState(false);
  const [scaleWeight, setScaleWeight] = useState('0.00');
  const [pendingScaleItem, setPendingScaleItem] = useState(null);

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
    const qty = store.nextQuantity;
    for (let i = 0; i < qty; i++) {
      store.addItem(item);
    }
    if (qty > 1) store.setNextQuantity(1);
  }, [store]);

  // SKU lookup by number code
  const handleSkuLookup = async () => {
    if (!skuInput.trim() || !window.api) return;
    setSkuError('');
    try {
      // Try barcode first
      let item = await window.api.getItemByBarcode(skuInput.trim());
      if (!item) {
        // Try as item ID
        item = await window.api.getItemById(parseInt(skuInput.trim()));
      }
      if (item) {
        store.addItem(item);
        setSkuInput('');
        if (skuRef.current) skuRef.current.focus();
      } else {
        setSkuError('Item #' + skuInput + ' not found');
        setTimeout(() => setSkuError(''), 2000);
      }
    } catch (err) {
      console.error('SKU lookup error:', err);
    }
  };

  // Item name search
  useEffect(() => {
    if (itemSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      if (window.api) {
        const results = await window.api.searchItems(itemSearch);
        setSearchResults(results.slice(0, 10));
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [itemSearch]);

  // Scale - simulate reading weight
  const handleOpenScale = () => {
    setScaleWeight((1 + Math.random() * 3).toFixed(2));
    setShowScale(true);
  };

  const handleScaleConfirm = () => {
    // Apply weight as quantity to the last added item, or prompt to scan/enter item first
    if (store.items.length > 0) {
      const lastIndex = store.items.length - 1;
      const weight = parseFloat(scaleWeight);
      store.updateItemQuantity(lastIndex, 1);
      // Update the price to be price * weight (for per-lb items)
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
        {/* Left Side - SKU Entry + Customer + Controls */}
        <div className="left-panel">
          {/* SKU / Item Code Entry */}
          <div className="sku-section">
            <label className="section-label">Item # / SKU Code</label>
            <div className="sku-input-row">
              <input
                ref={skuRef}
                type="text"
                inputMode="numeric"
                className="sku-input"
                placeholder="Enter code (e.g. 204)"
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSkuLookup();
                }}
              />
              <button className="btn-sku-add" onClick={handleSkuLookup}>+</button>
            </div>
            {skuError && <div style={{ color: 'var(--accent-red)', fontSize: 12, marginBottom: 4 }}>{skuError}</div>}

            <input
              type="text"
              className="sku-search-input"
              placeholder="Search item by name..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="sku-results">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    className="sku-result-item"
                    onClick={() => {
                      store.addItem(item);
                      setItemSearch('');
                      setSearchResults([]);
                    }}
                  >
                    <span className="sku-result-name">{item.barcode ? `[${item.barcode}] ` : ''}{item.name}</span>
                    <span className="sku-result-price">${item.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Scale Button */}
            <button className="btn-scale" onClick={handleOpenScale} style={{ width: '100%', marginTop: 6 }}>
              <span style={{ fontSize: 16 }}>&#9878;</span> Scale (Read Weight)
            </button>
          </div>

          {/* Customer */}
          <div className="customer-section">
            <label className="section-label">Customer</label>
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
            <h3>Scale Reading</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Weight from scale:</p>
            <div className="scale-display">{scaleWeight}</div>
            <div className="scale-unit">LB</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
              This will multiply the last item's price by the weight.
              Add the per-lb item first, then apply scale weight.
            </p>
            <div style={{ marginBottom: 12 }}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={scaleWeight}
                onChange={(e) => setScaleWeight(e.target.value)}
                style={{ width: '100%', fontSize: 20, textAlign: 'center', padding: 8 }}
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
