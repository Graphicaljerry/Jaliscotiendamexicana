import React from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './TotalsBar.css';

function TotalsBar() {
  const items = useTransactionStore((s) => s.items);
  const amountPaid = useTransactionStore((s) => s.amountPaid);
  const setAmountPaid = useTransactionStore((s) => s.setAmountPaid);
  const getSubtotal = useTransactionStore((s) => s.getSubtotal);
  const getTaxTotal = useTransactionStore((s) => s.getTaxTotal);
  const getGrandTotal = useTransactionStore((s) => s.getGrandTotal);
  const getChange = useTransactionStore((s) => s.getChange);
  const getEbtEligibleTotal = useTransactionStore((s) => s.getEbtEligibleTotal);
  const taxRate = useTransactionStore((s) => s.taxRate);

  const subtotal = getSubtotal();
  const taxTotal = getTaxTotal();
  const grandTotal = getGrandTotal();
  const change = getChange();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const ebtEligible = getEbtEligibleTotal();

  return (
    <div className="totals-bar">
      <div className="totals-left">
        <div className="total-field paid-field">
          <label>Paid</label>
          <div className="paid-input-wrap">
            <span className="dollar-sign">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amountPaid || ''}
              onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="paid-input"
            />
          </div>
        </div>

        <div className="total-field change-field">
          <label>Change</label>
          <span className={`total-value ${change > 0 ? 'change-due' : ''}`}>
            ${change.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="totals-center">
        <div className="total-field">
          <label>Items</label>
          <span className="total-value">{itemCount}</span>
        </div>

        <div className="total-field">
          <label>Sub Total</label>
          <span className="total-value">${subtotal.toFixed(2)}</span>
        </div>

        <div className="total-field">
          <label>Tax ({taxRate}%)</label>
          <span className="total-value">${taxTotal.toFixed(2)}</span>
        </div>

        {ebtEligible > 0 && (
          <div className="total-field ebt-field">
            <label>EBT Eligible</label>
            <span className="total-value ebt-value">${ebtEligible.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="totals-right">
        <div className="total-field grand-total-field">
          <label>GRAND TOTAL</label>
          <span className="grand-total-value">${grandTotal.toFixed(2)}</span>
        </div>
        <div className="tax-label">LOCAL TAXES</div>
      </div>
    </div>
  );
}

export default TotalsBar;
