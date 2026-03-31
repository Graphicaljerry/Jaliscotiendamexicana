import React from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './HeldTransactionsModal.css';

function HeldTransactionsModal({ onClose }) {
  const heldTransactions = useTransactionStore((s) => s.heldTransactions);
  const reloadHeldTransaction = useTransactionStore((s) => s.reloadHeldTransaction);
  const deleteHeldTransaction = useTransactionStore((s) => s.deleteHeldTransaction);

  const handleReload = (id) => {
    reloadHeldTransaction(id);
    onClose();
  };

  const handleDelete = (id) => {
    if (confirm('Delete this held transaction? This cannot be undone.')) {
      deleteHeldTransaction(id);
      if (heldTransactions.length <= 1) onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content held-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Held Transactions</h2>
        <p className="held-hint">
          Select a transaction to reload it. The kitchen places orders on hold — the cashier reloads them to charge the customer.
        </p>

        {heldTransactions.length === 0 ? (
          <div className="held-empty">
            <p>No held transactions.</p>
          </div>
        ) : (
          <table className="held-table">
            <thead>
              <tr>
                <th>Transaction #</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {heldTransactions.map((held) => (
                <tr key={held.id}>
                  <td className="held-txn-num">{held.id}</td>
                  <td>{held.timestamp}</td>
                  <td>{held.customer ? held.customer.name : '—'}</td>
                  <td>{held.itemCount} item{held.itemCount !== 1 ? 's' : ''}</td>
                  <td className="held-total">${held.grandTotal.toFixed(2)}</td>
                  <td className="held-actions">
                    <button className="btn-reload" onClick={() => handleReload(held.id)}>
                      Reload
                    </button>
                    <button className="btn-delete-held" onClick={() => handleDelete(held.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Item preview for first held transaction */}
        {heldTransactions.length > 0 && (
          <div className="held-preview">
            <h4>Items in #{heldTransactions[0].id}:</h4>
            <div className="held-items-list">
              {heldTransactions[0].items.map((item, i) => (
                <div key={i} className="held-item-row">
                  <span>{item.quantity}x {item.item_name || item.name}</span>
                  <span>${item.line_total.toFixed(2)}</span>
                </div>
              ))}
            </div>
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
