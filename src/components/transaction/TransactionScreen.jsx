import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionTable from './TransactionTable';
import TransactionControls from './TransactionControls';
import FunctionBar from './FunctionBar';
import IdleFunctionBar from './IdleFunctionBar';
import TotalsBar from '../layout/TotalsBar';
import TopBar from '../layout/TopBar';
import ItemGrid from '../grid/ItemGrid';
import CustomerLookup from '../customer/CustomerLookup';
import PaymentModal from '../payment/PaymentModal';
import HeldTransactionsModal from '../payment/HeldTransactionsModal';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useTransactionStore from '../../stores/transactionStore';
import './TransactionScreen.css';

function TransactionScreen() {
  const navigate = useNavigate();
  const [showGrid, setShowGrid] = useState(false);
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [quantityPrompt, setQuantityPrompt] = useState(false);
  const [pricePrompt, setPricePrompt] = useState(false);
  const [discountPrompt, setDiscountPrompt] = useState(false);
  const [showScale, setShowScale] = useState(false);
  const [scaleWeight, setScaleWeight] = useState('0.00');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Keyboard shortcuts — only active when NO payment modal is open
  useKeyboardShortcuts({
    onRepeatLast: () => { if (isActive) store.repeatLastItem(); },
    onDeleteLast: () => { if (isActive) store.removeLastItem(); },
    onReturnNext: () => store.setReturnNext(true),
    onItemDirect: () => setShowGrid(true),
    onQuantity: () => setQuantityPrompt(true),
    onPrice: () => setPricePrompt(true),
    onDiscount: () => setDiscountPrompt(true),
    onSalesChange: () => {},
    onCancel: () => {
      if (isActive) store.clearTransaction();
    },
    onFinish: () => {
      if (store.items.length > 0) setShowPayment(true);
    },
    onCoupon: () => {},
    onItemLookup: () => setShowGrid(true),
  });

  const handleAddGridItem = useCallback((item) => {
    store.addItem(item);
  }, [store]);

  const handleInlineItemAdd = useCallback(async (code) => {
    if (!window.api) return false;
    // Exact barcode match only — type exactly what's in the system
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
    // Re-focus the code input after modal closes
    setTimeout(() => {
      const codeInput = document.querySelector('.hidden-code-input');
      if (codeInput) codeInput.focus();
    }, 200);
  };

  // Hold current transaction
  const handleHold = () => {
    if (store.items.length === 0) return;
    const heldId = store.holdTransaction();
    alert(`Transaction #${heldId} placed on hold.`);
  };

  return (
    <div className="transaction-screen">
      <TopBar rightContent={<>
        <button className="btn-grid-toggle" onClick={() => setShowGrid(!showGrid)}>
          {showGrid ? 'Hide Grid' : 'Item Grid'}
        </button>
        <button className="btn-admin" onClick={() => navigate('/admin')}>Admin</button>
      </>}>
        {isActive ? (
          <span className="txn-number">Transaction# <strong>{store.transactionNumber || '—'}</strong></span>
        ) : (
          <span className="txn-label">Sale Transaction Entry</span>
        )}
      </TopBar>

      {/* Sidebar Overlay — covers everything below header */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} onClick={() => setSidebarOpen(false)}>
        <div className="left-panel left-panel-overlay" onClick={(e) => e.stopPropagation()}>
          <button className="btn-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <svg width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
              <polyline points="15 9 12 12 15 15" />
            </svg>
          </button>
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

          {/* Held transactions count */}
          {store.heldTransactions.length > 0 && (
            <div className="held-count-badge" onClick={() => setShowHeldModal(true)}>
              {store.heldTransactions.length} Held Transaction{store.heldTransactions.length > 1 ? 's' : ''}
            </div>
          )}

          <div className="begin-section">
            {isActive ? (
              <button className="btn-begin" onClick={() => {
                if (store.items.length > 0) setShowPayment(true);
              }}>
                Finish / Payment
              </button>
            ) : (
              <button className="btn-begin btn-begin-new" onClick={() => store.beginTransaction()}>
                Begin Transaction
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pos-content-wrap">
      <div className="main-content">
        {/* Full-width Center */}
        <div className="center-panel">
          {showGrid ? (
            <ItemGrid onSelectItem={handleAddGridItem} onHideGrid={() => setShowGrid(false)} />
          ) : (
            <TransactionTable
              onInlineItemAdd={handleInlineItemAdd}
              onOpenScale={() => {
                setScaleWeight((1 + Math.random() * 3).toFixed(2));
                setShowScale(true);
              }}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
          )}
        </div>
      </div>

      {/* Totals Bar */}
      <TotalsBar />

      {/* Function Bar — switches between active and idle */}
      {isActive ? (
        <FunctionBar
          onShowGrid={() => setShowGrid(true)}
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
          onShowGrid={() => setShowGrid(true)}
          onBeginTransaction={() => store.beginTransaction()}
        />
      )}

      </div>{/* end pos-content-wrap */}

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
