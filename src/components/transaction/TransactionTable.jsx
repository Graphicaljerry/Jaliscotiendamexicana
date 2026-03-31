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
  const tableEndRef = useRef(null);

  // Auto-focus the inline input and scroll to bottom
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    if (tableEndRef.current) tableEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [items.length]);

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

  const handleQtyChange = (index, value) => {
    const qty = parseInt(value);
    if (!isNaN(qty)) updateItemQuantity(index, qty);
  };

  return (
    <div className="transaction-table-wrapper">
      {/* Compact top bar: search + scale */}
      <div className="table-top-bar">
        <div className="search-wrap">
          <input
            type="text"
            className="compact-search"
            placeholder="Search item by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="search-dropdown">
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
        <button className="btn-scale-inline" onClick={onOpenScale}>Scale Weight</button>
      </div>

      {/* Transaction items table with inline entry row */}
      <div className="table-scroll">
        <table className="transaction-table">
          <thead>
            <tr>
              <th className="col-itemnum">Item Number</th>
              <th className="col-desc">Description</th>
              <th className="col-price">Price</th>
              <th className="col-qty">Quantity</th>
              <th className="col-total">Total</th>
              <th className="col-disc">Disc.</th>
              <th className="col-edit"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="col-itemnum mono">{item.barcode || item.item_id || '—'}</td>
                <td className="col-desc">{item.item_name || item.name}</td>
                <td className="col-price">${item.unit_price.toFixed(2)}</td>
                <td className="col-qty">
                  <input
                    type="number"
                    className="qty-input"
                    value={item.quantity}
                    min="0"
                    onChange={(e) => handleQtyChange(index, e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                </td>
                <td className="col-total">${item.line_total.toFixed(2)}</td>
                <td className="col-disc">
                  {item.discount > 0 ? <span className="text-red">-${item.discount.toFixed(2)}</span> : '—'}
                </td>
                <td className="col-edit">
                  <button className="btn-remove-item" onClick={() => removeItem(index)}>✕</button>
                </td>
              </tr>
            ))}

            {/* ─── INLINE ENTRY ROW (the "next empty row") ─── */}
            <tr className="entry-row" ref={tableEndRef}>
              <td className="col-itemnum entry-cell">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  className="inline-code-input"
                  placeholder="Enter code..."
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCodeSubmit(); }}
                />
                {codeError && <span className="inline-error">{codeError}</span>}
              </td>
              <td className="col-desc entry-cell" colSpan="6">
                <span className="entry-hint">
                  {items.length === 0
                    ? 'Type an item number, scan a barcode, or use the Item Grid'
                    : 'Scan or type next item...'}
                </span>
              </td>
            </tr>

            {/* Empty placeholder rows to fill space */}
            {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
                <td className="col-itemnum"></td>
                <td className="col-desc"></td>
                <td className="col-price"></td>
                <td className="col-qty"></td>
                <td className="col-total"></td>
                <td className="col-disc"></td>
                <td className="col-edit"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionTable;
