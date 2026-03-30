import React, { useState, useRef, useEffect } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './PaymentModal.css';

function PaymentModal({ onClose }) {
  const store = useTransactionStore();
  const [paymentType, setPaymentType] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef(null);

  const grandTotal = store.getGrandTotal();
  const ebtEligible = store.getEbtEligibleTotal();
  const change = amountPaid ? Math.max(0, parseFloat(amountPaid) - grandTotal) : 0;

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [paymentType]);

  const handleFinish = async () => {
    if (processing) return;
    setProcessing(true);

    const paid = parseFloat(amountPaid) || 0;
    if (paymentType === 'cash' && paid < grandTotal) {
      alert('Amount paid is less than the total.');
      setProcessing(false);
      return;
    }

    try {
      // Build transaction data
      const txnData = {
        customer_id: store.customer ? store.customer.id : null,
        subtotal: store.getSubtotal(),
        tax_total: store.getTaxTotal(),
        discount_total: store.getDiscountTotal(),
        grand_total: grandTotal,
        payment_type: paymentType,
        amount_paid: paid,
        change_given: paymentType === 'cash' ? change : 0,
        transaction_type: store.transactionType,
        ebt_amount: paymentType === 'ebt' ? ebtEligible : 0,
        items: store.items.map((item) => ({
          item_id: item.item_id,
          item_name: item.item_name || item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          discount: item.discount || 0
        }))
      };

      if (window.api) {
        // Save transaction
        const result = await window.api.createTransaction(txnData);

        // Print receipt
        await window.api.printReceipt({ ...txnData, id: result.id });

        // Open cash drawer for cash payments
        if (paymentType === 'cash') {
          await window.api.openCashDrawer();
        }
      }

      setCompleted(true);

      // Clear transaction after a brief delay
      setTimeout(() => {
        store.clearTransaction();
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Transaction error:', err);
      alert('Error processing transaction: ' + err.message);
    }

    setProcessing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFinish();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (completed) {
    return (
      <div className="modal-overlay">
        <div className="modal-content payment-modal payment-complete">
          <div className="complete-icon">&#10003;</div>
          <h2>Transaction Complete</h2>
          {paymentType === 'cash' && change > 0 && (
            <div className="change-display">
              <span className="change-label">Change Due:</span>
              <span className="change-amount">${change.toFixed(2)}</span>
            </div>
          )}
          <p>Receipt printing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Payment</h2>

        {/* Payment Type Selection */}
        <div className="payment-types">
          {[
            { key: 'cash', label: 'Cash', icon: '$' },
            { key: 'card', label: 'Card', icon: '&#9645;' },
            { key: 'ebt', label: 'EBT', icon: '&#9733;' },
            { key: 'check', label: 'Cash Check', icon: '&#9744;' },
            { key: 'split', label: 'Split', icon: '&#247;' }
          ].map((pt) => (
            <button
              key={pt.key}
              className={`payment-type-btn ${paymentType === pt.key ? 'active' : ''}`}
              onClick={() => setPaymentType(pt.key)}
            >
              <span className="pt-icon" dangerouslySetInnerHTML={{ __html: pt.icon }} />
              <span className="pt-label">{pt.label}</span>
            </button>
          ))}
        </div>

        {/* Transaction Summary */}
        <div className="payment-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${store.getSubtotal().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${store.getTaxTotal().toFixed(2)}</span>
          </div>
          {store.getDiscountTotal() > 0 && (
            <div className="summary-row discount-row">
              <span>Discount</span>
              <span>-${store.getDiscountTotal().toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total-row">
            <span>TOTAL</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>

          {paymentType === 'ebt' && (
            <div className="summary-row ebt-row">
              <span>EBT Eligible</span>
              <span>${ebtEligible.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Amount Input */}
        {paymentType === 'cash' && (
          <div className="payment-input-section">
            <label>Amount Paid</label>
            <div className="payment-input-wrap">
              <span className="dollar-sign">$</span>
              <input
                ref={inputRef}
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={grandTotal.toFixed(2)}
                className="payment-amount-input"
              />
            </div>
            {amountPaid && parseFloat(amountPaid) >= grandTotal && (
              <div className="change-preview">
                Change: <span className="text-red font-bold">${change.toFixed(2)}</span>
              </div>
            )}

            {/* Quick cash buttons */}
            <div className="quick-cash">
              {[1, 5, 10, 20, 50, 100].map((amt) => (
                <button
                  key={amt}
                  className="quick-cash-btn"
                  onClick={() => setAmountPaid(String(amt))}
                >
                  ${amt}
                </button>
              ))}
              <button
                className="quick-cash-btn exact"
                onClick={() => setAmountPaid(grandTotal.toFixed(2))}
              >
                Exact
              </button>
            </div>
          </div>
        )}

        {paymentType === 'card' && (
          <div className="card-prompt">
            <div className="card-icon">&#9645;</div>
            <p>Swipe or Insert Card</p>
            <p className="text-muted font-sm">Waiting for card reader...</p>
          </div>
        )}

        {paymentType === 'ebt' && (
          <div className="ebt-section">
            <div className="ebt-info">
              <div className="ebt-info-row">
                <span>FoodStamp Eligible Amount:</span>
                <span className="font-bold">${ebtEligible.toFixed(2)}</span>
              </div>
              <div className="ebt-info-row">
                <span>Non-Eligible (Pay Cash/Card):</span>
                <span className="font-bold">${(grandTotal - ebtEligible).toFixed(2)}</span>
              </div>
            </div>
            <div className="card-prompt">
              <p>Swipe EBT Card</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="payment-actions">
          <button className="btn-cancel-payment" onClick={onClose}>
            Cancel (Esc)
          </button>
          <button
            className="btn-confirm-payment"
            onClick={handleFinish}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
