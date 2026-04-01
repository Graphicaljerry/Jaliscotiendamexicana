import React, { useState, useCallback } from 'react';
import TransactionTable from './TransactionTable';
import FunctionBar from './FunctionBar';
import IdleFunctionBar from './IdleFunctionBar';
import ItemGrid from '../grid/ItemGrid';
import BillingSidebar from '../billing/BillingSidebar';
import CustomerLookup from '../customer/CustomerLookup';
import PaymentModal from '../payment/PaymentModal';
import HeldTransactionsModal from '../payment/HeldTransactionsModal';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useTransactionStore from '../../stores/transactionStore';
import './TransactionScreen.css';

function TransactionScreen() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'invoice'
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [quantityPrompt, setQuantityPrompt] = useState(false);
  const [pricePrompt, setPricePrompt] = useState(false);
  const [discountPrompt, setDiscountPrompt] = useState(false);
  const [showScale, setShowScale] = useState(false);
  const [scaleWeight, setScaleWeight] = useState('0.00');

  const store = useTransactionStore();
  const isActive = store.isActive || store.items.length > 0;

  // Barcode scanner
  const handleBarcodeScan = useCallback(async (barcode) => {
    if (!window.api) return;
    try {
      const item = await window.api.getItemByBarcode(barcode);
      if (item) {
        store.addItem(item);
        if (item.sell_by === 'S') {
          setScaleWeight((1 + Math.random() * 3).toFixed(2));
          setShowScale(true);
        }
      }
    } catch (err) {
      console.error('Barcode lookup error:', err);
    }
  }, [store]);

  useBarcodeScanner(handleBarcodeScan);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRepeatLast: () => { if (isActive) store.repeatLastItem(); },
    onDeleteLast: () => { if (isActive) store.removeLastItem(); },
    onReturnNext: () => store.setReturnNext(true),
    onItemDirect: () => setViewMode('grid'),
    onQuantity: () => setQuantityPrompt(true),
    onPrice: () => setPricePrompt(true),
    onDiscount: () => setDiscountPrompt(true),
    onSalesChange: () => {},
    onCancel: () => { if (isActive) store.clearTransaction(); },
    onFinish: () => { if (store.items.length > 0) setShowPayment(true); },
    onCoupon: () => {},
    onItemLookup: () => setViewMode('grid'),
  });

  const handleAddGridItem = useCallback((item) => {
    store.addItem(item);
  }, [store]);

  const handleInlineItemAdd = useCallback(async (code) => {
    if (!window.api) return false;
    let item = await window.api.getItemByBarcode(code);
    if (item) {
      store.addItem(item);
      if (item.sell_by === 'S') {
        setScaleWeight((1 + Math.random() * 3).toFixed(2));
        setShowScale(true);
      }
      return true;
    }
    return false;
  }, [store]);

  const handleScaleConfirm = () => {
    if (store.items.length > 0) {
      const lastIndex = store.items.length - 1;
      const weight = parseFloat(scaleWeight);
      if (weight > 0) {
        store.updateItemQuantity(lastIndex, weight);
      }
    }
    setShowScale(false);
    setTimeout(() => {
      const codeInput = document.querySelector('.hidden-code-input');
      if (codeInput) codeInput.focus();
    }, 200);
  };

  const handleHold = () => {
    if (store.items.length === 0) return;
    const heldId = store.holdTransaction();
    alert(`Transaction #${heldId} placed on hold.`);
  };

  return (
    <div className="transaction-screen">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="store-name">JALISCO TIENDA MEXICANA</div>
        <div className="top-bar-center">
          {isActive && (
            <span className="txn-number">Transaction# <strong>{store.transactionNumber || '—'}</strong></span>
          )}
        </div>
        <div className="top-bar-right">
          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Product Grid"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'invoice' ? 'active' : ''}`}
              onClick={() => setViewMode('invoice')}
              title="Invoice View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18"/>
              </svg>
            </button>
          </div>

          {isActive && (
            <button className="btn-scale-top" onClick={() => {
              setScaleWeight((1 + Math.random() * 3).toFixed(2));
              setShowScale(true);
            }}>
              Scale
            </button>
          )}

          {store.heldTransactions.length > 0 && (
            <button className="btn-held-top" onClick={() => setShowHeldModal(true)}>
              Held ({store.heldTransactions.length})
            </button>
          )}

          <button className="btn-admin" onClick={() => window.location.hash = '#/admin'}>
            Admin
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left/Center: Product Grid or Invoice Table */}
        <div className="center-panel">
          {viewMode === 'grid' ? (
            <ItemGrid onSelectItem={handleAddGridItem} />
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

        {/* Right: Billing Sidebar */}
        <BillingSidebar
          onShowPayment={() => { if (store.items.length > 0) setShowPayment(true); }}
          onShowCustomer={() => setShowCustomerLookup(true)}
        />
      </div>

      {/* Function Bar */}
      {isActive ? (
        <FunctionBar
          onShowGrid={() => setViewMode('grid')}
          onShowCustomer={() => setShowCustomerLookup(true)}
          onShowPayment={() => { if (store.items.length > 0) setShowPayment(true); }}
          onQuantityPrompt={() => setQuantityPrompt(true)}
          onPricePrompt={() => setPricePrompt(true)}
          onDiscountPrompt={() => setDiscountPrompt(true)}
          onHold={handleHold}
        />
      ) : (
        <IdleFunctionBar
          onReloadHeld={() => setShowHeldModal(true)}
          onShowCustomer={() => setShowCustomerLookup(true)}
          onShowGrid={() => setViewMode('grid')}
          onBeginTransaction={() => store.beginTransaction()}
        />
      )}

      {/* Modals */}
      {showCustomerLookup && <CustomerLookup onClose={() => setShowCustomerLookup(false)} />}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
      {showHeldModal && <HeldTransactionsModal onClose={() => setShowHeldModal(false)} />}

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
                id="scale-weight-input"
                type="number"
                step="0.01"
                min="0"
                value={scaleWeight}
                onChange={(e) => setScaleWeight(e.target.value)}
                ref={(el) => { if (el) setTimeout(() => el.focus(), 150); }}
                style={{ width: '100%', fontSize: 20, textAlign: 'center', padding: 8 }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') { e.preventDefault(); handleScaleConfirm(); }
                  if (e.key === 'Escape') { e.preventDefault(); setShowScale(false); }
                }}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="scale-actions">
              <button className="btn-scale-cancel" onClick={() => setShowScale(false)}>Cancel</button>
              <button className="btn-scale-confirm" onClick={handleScaleConfirm}>Apply Weight</button>
            </div>
          </div>
        </div>
      )}

      {/* Quantity / Price / Discount Prompts */}
      {quantityPrompt && (
        <div className="modal-overlay" onClick={() => setQuantityPrompt(false)}>
          <div className="modal-content prompt-modal" onClick={e => e.stopPropagation()}>
            <h3>Enter Quantity</h3>
            <input type="number" min="1" defaultValue="1" autoFocus onKeyDown={(e) => {
              if (e.key === 'Enter') { store.setNextQuantity(parseInt(e.target.value) || 1); setQuantityPrompt(false); }
              else if (e.key === 'Escape') setQuantityPrompt(false);
            }} />
            <p className="prompt-hint">Enter quantity then press Enter</p>
          </div>
        </div>
      )}
      {pricePrompt && (
        <div className="modal-overlay" onClick={() => setPricePrompt(false)}>
          <div className="modal-content prompt-modal" onClick={e => e.stopPropagation()}>
            <h3>Price Override</h3>
            <input type="number" step="0.01" min="0" placeholder="New price" autoFocus onKeyDown={(e) => {
              if (e.key === 'Enter') { const p = parseFloat(e.target.value); if (!isNaN(p) && store.items.length > 0) store.updateItemPrice(store.items.length - 1, p); setPricePrompt(false); }
              else if (e.key === 'Escape') setPricePrompt(false);
            }} />
          </div>
        </div>
      )}
      {discountPrompt && (
        <div className="modal-overlay" onClick={() => setDiscountPrompt(false)}>
          <div className="modal-content prompt-modal" onClick={e => e.stopPropagation()}>
            <h3>Discount %</h3>
            <input type="number" step="1" min="0" max="100" placeholder="Discount %" autoFocus onKeyDown={(e) => {
              if (e.key === 'Enter') { const pct = parseFloat(e.target.value); if (!isNaN(pct) && store.items.length > 0) { const li = store.items[store.items.length - 1]; store.updateItemDiscount(store.items.length - 1, li.line_total * (pct / 100)); } setDiscountPrompt(false); }
              else if (e.key === 'Escape') setDiscountPrompt(false);
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionScreen;
