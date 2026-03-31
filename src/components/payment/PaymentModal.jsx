import React, { useState, useRef, useEffect } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './PaymentModal.css';

function PaymentModal({ onClose }) {
  const store = useTransactionStore();
  const [payInput, setPayInput] = useState('');
  const [payments, setPayments] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef(null);

  const grandTotal = store.getGrandTotal();
  const ebtEligible = store.getEbtEligibleTotal();

  // Calculate totals from payments list
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const due = Math.max(0, grandTotal - totalPaid);
  const change = Math.max(0, totalPaid - grandTotal);

  // Current pay amount (what's in the input or the remaining due)
  const currentPay = payInput !== '' ? parseFloat(payInput) || 0 : due;

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Numpad handler
  const handleNumpad = (val) => {
    if (val === 'clear') {
      setPayInput('');
    } else if (val === '.') {
      if (!payInput.includes('.')) setPayInput(payInput + '.');
    } else {
      setPayInput(payInput + val);
    }
  };

  // Add a payment line — and if it covers the total, auto-finish
  const addPayment = (type) => {
    const amount = payInput !== '' ? parseFloat(payInput) || 0 : due;
    if (amount <= 0) return;
    const newPayments = [...payments, { type, amount, last4: type === 'credit' || type === 'debit' ? '****' : '' }];
    setPayments(newPayments);
    setPayInput('');

    // Auto-finish if fully paid
    const newTotalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
    if (newTotalPaid >= grandTotal) {
      // Small delay so user sees the payment line appear
      setTimeout(() => doFinish(newPayments), 300);
    }
  };

  // Remove a payment line
  const removePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  // Core finish logic — accepts optional payments array override
  const doFinish = async (paymentsList) => {
    const pList = paymentsList || payments;
    const paidTotal = pList.reduce((sum, p) => sum + p.amount, 0);
    const changeDue = Math.max(0, paidTotal - grandTotal);

    if (processing || paidTotal < grandTotal) return;
    setProcessing(true);

    try {
      const primaryType = pList.length > 0 ? pList[0].type : 'cash';
      const txnData = {
        customer_id: store.customer ? store.customer.id : null,
        subtotal: store.getSubtotal(),
        tax_total: store.getTaxTotal(),
        discount_total: store.getDiscountTotal(),
        grand_total: grandTotal,
        payment_type: pList.length > 1 ? 'split' : primaryType,
        amount_paid: paidTotal,
        change_given: changeDue,
        transaction_type: store.transactionType,
        ebt_amount: pList.filter(p => p.type === 'ebt').reduce((s, p) => s + p.amount, 0),
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
        const result = await window.api.createTransaction(txnData);
        await window.api.printReceipt({ ...txnData, id: result.id });
        if (primaryType === 'cash') await window.api.openCashDrawer();
      }

      setCompleted(true);
      // Update change for display
      setPayments(pList);
      setTimeout(() => {
        store.clearTransaction();
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Transaction error:', err);
      alert('Error processing transaction: ' + err.message);
    }
    setProcessing(false);
  };

  const handleFinish = () => doFinish();

  // F-key shortcuts inside payment modal:
  // F1 = Cash, F2 = Debit, F3 = Credit, F4 = EBT SNAP
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Enter' && totalPaid >= grandTotal) { handleFinish(); return; }
    if (e.key === 'F1') { e.preventDefault(); addPayment('cash'); return; }
    if (e.key === 'F2') { e.preventDefault(); addPayment('debit'); return; }
    if (e.key === 'F3') { e.preventDefault(); addPayment('credit'); return; }
    if (e.key === 'F4') { e.preventDefault(); addPayment('ebt'); return; }
  };

  // Listen for F-keys globally while modal is open
  // Uses a ref so the handler always sees latest state
  const addPaymentRef = useRef(addPayment);
  addPaymentRef.current = addPayment;

  useEffect(() => {
    function handleGlobalKey(e) {
      if (e.key === 'F1') { e.preventDefault(); e.stopImmediatePropagation(); addPaymentRef.current('cash'); }
      if (e.key === 'F2') { e.preventDefault(); e.stopImmediatePropagation(); addPaymentRef.current('debit'); }
      if (e.key === 'F3') { e.preventDefault(); e.stopImmediatePropagation(); addPaymentRef.current('credit'); }
      if (e.key === 'F4') { e.preventDefault(); e.stopImmediatePropagation(); addPaymentRef.current('ebt'); }
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); }
    }
    // Register on capture phase with highest priority
    document.addEventListener('keydown', handleGlobalKey, true);
    return () => document.removeEventListener('keydown', handleGlobalKey, true);
  }, []);

  if (completed) {
    return (
      <div className="modal-overlay">
        <div className="modal-content payment-modal payment-complete">
          <div className="complete-icon">&#10003;</div>
          <h2>Transaction Complete</h2>
          {change > 0 && (
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
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <h2>Transaction Payment Entry Form</h2>

        <div className="payment-layout">
          {/* LEFT SIDE: Pay/Paid/Due/Change + Numpad + Payment Types */}
          <div className="payment-left">
            {/* Amounts Display */}
            <div className="pay-amounts">
              <div className="pay-row">
                <label>Pay</label>
                <div className="pay-value-box pay-highlight">
                  <span className="dollar">$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    value={payInput}
                    onChange={(e) => setPayInput(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder={due.toFixed(2)}
                    className="pay-input"
                  />
                </div>
              </div>
              <div className="pay-row">
                <label>Paid</label>
                <div className="pay-value">${totalPaid.toFixed(2)}</div>
              </div>
              <div className="pay-row">
                <label>Due</label>
                <div className="pay-value pay-due">${due.toFixed(2)}</div>
              </div>
              <div className="pay-row">
                <label>Change</label>
                <div className="pay-value pay-change">${change.toFixed(2)}</div>
              </div>
            </div>

            {/* Payment Type Buttons */}
            <div className="pay-type-buttons">
              <button className="pay-type-btn cash-btn" onClick={() => addPayment('cash')}>
                Cash<span className="pay-key">F1</span>
              </button>
              <button className="pay-type-btn credit-btn" onClick={() => addPayment('credit')}>
                Credit Card<span className="pay-key">F3</span>
              </button>
              <button className="pay-type-btn debit-btn" onClick={() => addPayment('debit')}>
                Debit Card<span className="pay-key">F2</span>
              </button>
              <button className="pay-type-btn ebt-btn" onClick={() => addPayment('ebt')}>
                EBT SNAP<span className="pay-key">F4</span>
              </button>
            </div>

            <p className="pay-hint">
              To accept the amount as shown above press the appropriate payment key now - OR - enter different payment amount.
            </p>

            {/* Numpad */}
            <div className="numpad">
              {['7','8','9'].map(n => <button key={n} className="num-btn" onClick={() => handleNumpad(n)}>{n}</button>)}
              <button className="num-btn quick-btn" onClick={() => setPayInput('1')}>$1</button>
              <button className="num-btn quick-btn" onClick={() => setPayInput('20')}>$20</button>

              {['4','5','6'].map(n => <button key={n} className="num-btn" onClick={() => handleNumpad(n)}>{n}</button>)}
              <button className="num-btn quick-btn" onClick={() => setPayInput('5')}>$5</button>
              <button className="num-btn quick-btn" onClick={() => setPayInput('50')}>$50</button>

              {['1','2','3'].map(n => <button key={n} className="num-btn" onClick={() => handleNumpad(n)}>{n}</button>)}
              <button className="num-btn quick-btn" onClick={() => setPayInput('10')}>$10</button>
              <button className="num-btn quick-btn" onClick={() => setPayInput('100')}>$100</button>

              <button className="num-btn" onClick={() => handleNumpad('0')}>0</button>
              <button className="num-btn" onClick={() => handleNumpad('.')}>.</button>
              <button className="num-btn clear-btn" onClick={() => handleNumpad('clear')}>Clear</button>
              <button className="num-btn exact-btn" onClick={() => setPayInput(due.toFixed(2))}>Exact</button>
              <button className="num-btn reset-btn" onClick={() => { setPayments([]); setPayInput(''); }}>Reset Form</button>
            </div>
          </div>

          {/* RIGHT SIDE: Summary of Payments + Actions */}
          <div className="payment-right">
            <h3>Summary of Payments:</h3>
            <table className="payments-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Paid</th>
                  <th>Type</th>
                  <th>Account</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan="5" className="no-payments">No payments entered</td></tr>
                ) : (
                  payments.map((p, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>${p.amount.toFixed(2)}</td>
                      <td>{p.type.toUpperCase()}</td>
                      <td>{p.last4 || '—'}</td>
                      <td>
                        <button className="del-payment-btn" onClick={() => removePayment(i)}>X</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <p className="delete-hint">To delete a payment line click the X next to the line you wish to delete.</p>

            {/* SNAP Eligible */}
            {ebtEligible > 0 && (
              <div className="snap-eligible">
                <label>SNAP Eligible</label>
                <span className="snap-value">${ebtEligible.toFixed(2)}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="payment-bottom-actions">
              <button className="action-btn hold-btn" onClick={onClose}>Put on Hold</button>
              <button className="action-btn cancel-btn" onClick={onClose}>Cancel</button>
              <button
                className="action-btn done-btn"
                onClick={handleFinish}
                disabled={processing || totalPaid < grandTotal}
              >
                {processing ? 'Processing...' : 'Done / End Key'}
              </button>
            </div>

            <div className="payment-bottom-row">
              <button className="action-btn layaway-btn" onClick={onClose}>Put on Lay-a-way</button>
              <div className="store-credit-fields">
                <div className="sc-field">
                  <label>Max Store Charge</label>
                  <input type="text" readOnly value="" />
                </div>
                <div className="sc-field">
                  <label>Available Store Credit</label>
                  <input type="text" readOnly value="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
