import React from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './FunctionBar.css';

function IdleFunctionBar({ onReloadHeld, onShowCustomer, onShowGrid, onBeginTransaction }) {
  const store = useTransactionStore();
  const heldCount = store.heldTransactions.length;

  const row1 = [
    { label: 'Sale', key: 'F1', action: onBeginTransaction },
    { label: 'Lay-A-Way', key: 'F3', action: () => { store.setTransactionType('layaway'); onBeginTransaction(); } },
    { label: 'Quote', key: 'F5', action: () => { store.setTransactionType('quote'); onBeginTransaction(); } },
    { label: 'Alternate Tax Rate', key: 'F7', action: () => {} },
    { label: 'Discount', key: 'F9', action: () => {} },
    { label: 'Cash Check', key: 'F11', action: () => {} },
    { label: 'Cash Drawer', key: '', action: () => { if (window.api) window.api.openCashDrawer(); } },
    { label: 'Customer Inquiry', key: '', action: onShowCustomer },
    { label: 'Open Drawer', key: '', action: () => { if (window.api) window.api.openCashDrawer(); } },
  ];

  const row2 = [
    { label: 'Return', key: 'F2', action: () => { store.setTransactionType('return'); onBeginTransaction(); } },
    { label: 'Order', key: 'F4', action: () => { store.setTransactionType('order'); onBeginTransaction(); } },
    { label: 'Tax Type', key: 'F6', action: () => {} },
    { label: 'Print Form', key: 'F8', action: () => {} },
    { label: 'Payment', key: 'F10', action: () => {} },
    { label: 'Pay Out', key: 'F12', action: () => {} },
    {
      label: `Reload Held Transaction${heldCount > 0 ? ` (${heldCount})` : ''}`,
      key: '', action: onReloadHeld,
      highlight: heldCount > 0
    },
    { label: 'Item Inquiry', key: '', action: onShowGrid },
    { label: 'Exit', key: '', action: () => {} },
  ];

  return (
    <div className="function-bar">
      <div className="fn-row">
        {row1.map((btn, i) => (
          <button
            key={i}
            className={`fn-btn ${btn.highlight ? 'fn-highlight' : ''}`}
            onClick={btn.action}
          >
            {btn.key && <span className="fn-key">{btn.key}</span>}
            <span className="fn-label">{btn.label}</span>
          </button>
        ))}
      </div>
      <div className="fn-row">
        {row2.map((btn, i) => (
          <button
            key={i}
            className={`fn-btn ${btn.highlight ? 'fn-highlight' : ''}`}
            onClick={btn.action}
          >
            {btn.key && <span className="fn-key">{btn.key}</span>}
            <span className="fn-label">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default IdleFunctionBar;
