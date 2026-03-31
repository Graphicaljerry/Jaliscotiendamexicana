import React, { useState, useRef, useEffect } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './TransactionTable.css';

function TransactionTable({ onInlineItemAdd, onOpenScale }) {
  const items = useTransactionStore((s) => s.items);
  const removeItem = useTransactionStore((s) => s.removeItem);
  const updateItemQuantity = useTransactionStore((s) => s.updateItemQuantity);
  const [itemCode, setItemCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef(null);

  // Auto-focus the item code input
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [items.length]);

  // Handle typing a code and pressing Enter
  const handleCodeSubmit = async () => {
    if (!itemCode.trim()) return;
    setCodeError('');
    const found = await onInlineItemAdd(itemCode.trim());
    if (found) {
      setItemCode('');
    } else {
      setCodeError('Not found');
      setTimeout(() => setCodeError(''), 1500);
    }
  };

  // Search by name
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      if (window.api) {
        const results = await window.api.searchItems(searchQuery);
        setSearchResults(results.slice(0, 8));
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSelect = (item) => {
    onInlineItemAdd(item.barcode || String(item.id));
    setSearchQuery('');
    setSearchResults([]);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="transaction-table-wrapper">
      {/* Inline entry row - type item number here */}
      <div className="inline-entry-bar">
        <div className="entry-field">
          <label>Item Number</label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            className="item-code-input"
            placeholder="Enter code..."
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCodeSubmit();
            }}
          />
          {codeError && <span className="code-error">{codeError}</span>}
        </div>
        <div className="entry-field entry-field-search">
          <label>Search by Name</label>
          <input
            type="text"
            className="item-search-input"
            placeholder="Type item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="inline-search-dropdown">
              {searchResults.map((item) => (
                <button key={item.id} className="search-result-btn" onClick={() => handleSearchSelect(item)}>
                  <span className="sr-code">{item.barcode || item.id}</span>
                  <span className="sr-name">{item.name}</span>
                  <span className="sr-price">${item.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn-scale-inline" onClick={onOpenScale}>
          Scale Weight
        </button>
      </div>

      {/* Transaction items table */}
      <table className="transaction-table">
        <thead>
          <tr>
            <th className="col-itemnum">Item Number</th>
            <th className="col-desc">Description</th>
            <th className="col-price">Price</th>
            <th className="col-qty">Quantity</th>
            <th className="col-total">Total</th>
            <th className="col-disc">Disc.</th>
            <th className="col-edit">Edit</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-message">
                Type an item number above, scan a barcode, or use the Item Grid to add items
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={index}>
                <td className="col-itemnum">{item.barcode || item.item_id || '—'}</td>
                <td className="col-desc">{item.item_name || item.name}</td>
                <td className="col-price">${item.unit_price.toFixed(2)}</td>
                <td className="col-qty">
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => updateItemQuantity(index, item.quantity - 1)}>-</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateItemQuantity(index, item.quantity + 1)}>+</button>
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
                  <button className="btn-remove-item" onClick={() => removeItem(index)} title="Remove item">✕</button>
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
