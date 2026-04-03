import React from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './FunctionBar.css';

function FunctionBar({ onShowGrid, onShowCustomer, onShowPayment, onQuantityPrompt, onPricePrompt, onDiscountPrompt, onHold }) {
  const store = useTransactionStore();

  const row1 = [
    { label: 'Repeat Last', key: 'F1', action: () => store.repeatLastItem() },
    { label: 'Return Next', key: 'F3', action: () => store.setReturnNext(true) },
    { label: 'Quantity', key: 'F5', action: onQuantityPrompt },
    { label: 'Discount', key: 'F7', action: onDiscountPrompt },
    { label: 'Cancel', key: 'F9', action: () => store.clearTransaction(), danger: true },
    { label: 'Coupon', key: 'F11', action: () => {} },
    { label: 'Customer Inquiry', key: '', action: onShowCustomer },
    { label: 'Write Memo', key: '', action: () => {} },
    { label: 'Put on Hold', key: '', action: onHold },
  ];

  const row2 = [
    { label: 'Delete Last', key: 'F2', action: () => store.removeLastItem() },
    { label: 'Item Direct', key: 'F4', action: onShowGrid },
    { label: 'Price', key: 'F6', action: onPricePrompt },
    { label: 'Sls. Change', key: 'F8', action: () => {} },
    { label: 'Finish', key: 'F10', action: onShowPayment, success: true },
    { label: 'Item Lookup', key: 'F12', action: onShowGrid },
    { label: 'Item Inquiry', key: '', action: () => {} },
    { label: 'Tax Exempt Next', key: '', action: () => store.setTaxExemptNext(true) },
    { label: 'Open Drawer', key: '', action: () => { if (window.api) window.api.openCashDrawer(); } },
  ];

  return (
    <div className="function-bar">
      <div className="fn-row">
        {row1.map((btn, i) => (
          <button
            key={i}
            className={`fn-btn ${btn.danger ? 'fn-danger' : ''} ${btn.success ? 'fn-success' : ''} ${btn.highlight ? 'fn-highlight' : ''}`}
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
            className={`fn-btn ${btn.danger ? 'fn-danger' : ''} ${btn.success ? 'fn-success' : ''}`}
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

export default FunctionBar;
