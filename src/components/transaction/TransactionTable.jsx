import React from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './TransactionTable.css';

function TransactionTable() {
  const items = useTransactionStore((s) => s.items);
  const removeItem = useTransactionStore((s) => s.removeItem);
  const updateItemQuantity = useTransactionStore((s) => s.updateItemQuantity);

  return (
    <div className="transaction-table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th className="col-num">#</th>
            <th className="col-desc">Description</th>
            <th className="col-price">Price</th>
            <th className="col-qty">Qty</th>
            <th className="col-total">Total</th>
            <th className="col-disc">Disc.</th>
            <th className="col-edit">Edit</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-message">
                Scan an item, use the grid, or press F4 to add items
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={index}>
                <td className="col-num">{index + 1}</td>
                <td className="col-desc">{item.item_name || item.name}</td>
                <td className="col-price">${item.unit_price.toFixed(2)}</td>
                <td className="col-qty">
                  <div className="qty-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateItemQuantity(index, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateItemQuantity(index, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="col-total">${item.line_total.toFixed(2)}</td>
                <td className="col-disc">
                  {item.discount > 0 ? (
                    <span className="text-red">-${item.discount.toFixed(2)}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="col-edit">
                  <button
                    className="btn-remove-item"
                    onClick={() => removeItem(index)}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
