import React, { useState } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './HeldTransactionsModal.css';

function HeldTransactionsModal({ onClose }) {
  const heldTransactions = useTransactionStore((s) => s.heldTransactions);
  const reloadHeldTransaction = useTransactionStore((s) => s.reloadHeldTransaction);
  const deleteHeldTransaction = useTransactionStore((s) => s.deleteHeldTransaction);
  const [selectedId, setSelectedId] = useState(heldTransactions.length > 0 ? heldTransactions[0].id : null);

  const selectedHeld = heldTransactions.find(h => h.id === selectedId);

  const handleReload = (id) => {
    reloadHeldTransaction(id);
    onClose();
  };

  const handleDelete = (id) => {
    if (confirm('Delete this held transaction? This cannot be undone.')) {
      deleteHeldTransaction(id);
      const remaining = heldTransactions.filter(h => h.id !== id);
      if (remaining.length === 0) onClose();
      else setSelectedId(remaining[0].id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content held-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Held Transactions</h2>
        <p className="held-hint">
          Click a transaction to see its items. Click Reload to pull it up for payment.
        </p>

        {heldTransactions.length === 0 ? (
          <div className="held-empty"><p>No held transactions.</p></div>
        ) : (
          <div className="held-layout">
            <div className="held-list-side">
              <table className="held-table">
                <thead>
                  <tr>
                    <th>Txn #</th>
                    <th>Time</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {heldTransactions.map((held) => (
                    <tr
                      key={held.id}
                      className={`held-row ${selectedId === held.id ? 'held-row-selected' : ''}`}
                      onClick={() => setSelectedId(held.id)}
                    >
                      <td className="held-txn-num">{held.id}</td>
                      <td className="held-time">{held.timestamp}</td>
                      <td>{held.itemCount}</td>
                      <td className="held-total">${held.grandTotal.toFixed(2)}</td>
                      <td className="held-actions">
                        <button className="btn-reload" onClick={(e) => { e.stopPropagation(); handleReload(held.id); }}>Reload</button>
                        <button className="btn-delete-held" onClick={(e) => { e.stopPropagation(); handleDelete(held.id); }}>X</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedHeld && (
              <div className="held-preview">
                <h4>Items in #{selectedHeld.id}</h4>
                {selectedHeld.customer && <p className="held-customer">Customer: {selectedHeld.customer.name}</p>}
                <div className="held-items-list">
                  {selectedHeld.items.map((item, i) => (
                    <div key={i} className="held-item-row">
                      <span className="held-item-qty">{item.quantity}x</span>
                      <span className="held-item-name">{item.item_name || item.name}</span>
                      <span className="held-item-price">${item.line_total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="held-preview-total">
                  <span>Total:</span>
                  <strong>${selectedHeld.grandTotal.toFixed(2)}</strong>
                </div>
                <button className="btn-reload-big" onClick={() => handleReload(selectedHeld.id)}>
                  Reload This Transaction
                </button>
              </div>
            )}
          </div>
        )}

        <div className="held-modal-footer">
          <button className="btn-close-held" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default HeldTransactionsModal;
