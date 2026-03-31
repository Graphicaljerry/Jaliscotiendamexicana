import React, { useState, useRef, useEffect, useCallback } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './TransactionTable.css';

function TransactionTable({ onInlineItemAdd, onOpenScale }) {
  const items = useTransactionStore((s) => s.items);
  const addItem = useTransactionStore((s) => s.addItem);
  const removeItem = useTransactionStore((s) => s.removeItem);
  const updateItemQuantity = useTransactionStore((s) => s.updateItemQuantity);
  const updateItemPrice = useTransactionStore((s) => s.updateItemPrice);
  const [itemCode, setItemCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Which row is being edited (price/qty)
  const [editingRow, setEditingRow] = useState(null);

  const inputRef = useRef(null);
  const priceRef = useRef(null);
  const tableEndRef = useRef(null);

  // Focus code input when not editing
  useEffect(() => {
    if (editingRow === null && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [editingRow, items.length]);

  // Focus price field when editing row changes
  useEffect(() => {
    if (editingRow !== null && priceRef.current) {
      setTimeout(() => {
        priceRef.current?.focus();
        priceRef.current?.select();
      }, 50);
    }
    if (tableEndRef.current) tableEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [editingRow]);

  // After adding an item, start editing the new row
  const startEditingLastRow = useCallback((isScaleItem) => {
    setTimeout(() => {
      const currentItems = useTransactionStore.getState().items;
      const newIndex = currentItems.length - 1;
      if (isScaleItem) {
        // For scale items, open scale modal right away
        onOpenScale();
        // Don't enter edit mode - scale modal handles it
        setEditingRow(null);
      } else {
        setEditingRow(newIndex);
      }
    }, 30);
  }, [onOpenScale]);

  const handleCodeSubmit = async () => {
    const code = itemCode.trim();
    if (!code) return;

    // Code "1" = Grocery (no tax), Code "2" = Grocery Taxed
    if (code === '1' || code === '2') {
      const taxable = code === '2';
      addItem({
        id: Date.now(),
        name: taxable ? 'Grocery Taxed' : 'Grocery',
        price: 0,
        is_taxable: taxable ? 1 : 0,
        is_ebt_eligible: 0,
        barcode: code,
      });
      setItemCode('');
      startEditingLastRow(false);
      return;
    }

    // Regular item lookup
    setCodeError('');
    let item = null;
    if (window.api) {
      item = await window.api.getItemByBarcode(code);
      if (!item && !isNaN(parseInt(code))) {
        item = await window.api.getItemById(parseInt(code));
      }
      if (!item) {
        const results = await window.api.searchItems(code);
        if (results && results.length > 0) {
          item = results.find(r => r.barcode === code) || null;
        }
      }
    }

    if (item) {
      addItem(item);
      setItemCode('');
      startEditingLastRow(item.sell_by === 'S');
    } else {
      setCodeError('Not found');
      setTimeout(() => setCodeError(''), 1500);
    }
  };

  // Confirm editing row → go back to code input
  const confirmRow = () => {
    if (editingRow !== null && items[editingRow]) {
      const item = items[editingRow];
      // Remove custom entries that still have $0 price
      if (item.unit_price === 0 && (item.barcode === '1' || item.barcode === '2')) {
        removeItem(editingRow);
      }
    }
    setEditingRow(null);
  };

  const handleEditPrice = (index, value) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) updateItemPrice(index, price);
  };

  const handleQtyChange = (index, value) => {
    const qty = parseInt(value);
    if (!isNaN(qty)) updateItemQuantity(index, qty);
  };

  // Search
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
    addItem(item);
    setSearchQuery('');
    setSearchResults([]);
    startEditingLastRow(item.sell_by === 'S');
  };

  return (
    <div className="transaction-table-wrapper">
      <div className="table-top-bar">
        <div className="code-legend">
          <span className="legend-item"><strong>1</strong> = Grocery</span>
          <span className="legend-item"><strong>2</strong> = Grocery Taxed</span>
        </div>
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
        <button className="btn-scale-inline" onClick={onOpenScale}>Scale</button>
      </div>

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
            {items.map((item, index) => {
              const isEditing = editingRow === index;
              return (
                <tr key={index} className={isEditing ? 'editing-row' : ''}>
                  <td className="col-itemnum mono">{item.barcode || item.item_id || '—'}</td>
                  <td className="col-desc">
                    {item.item_name || item.name}
                    {item.is_taxable === 0 && <span className="tax-badge no-tax">NT</span>}
                  </td>
                  <td className="col-price">
                    {isEditing ? (
                      <input
                        ref={priceRef}
                        type="number"
                        step="0.01"
                        min="0"
                        className="qty-input edit-price-input"
                        defaultValue={item.unit_price > 0 ? item.unit_price : ''}
                        placeholder="0.00"
                        onChange={(e) => handleEditPrice(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRow();
                          if (e.key === 'Escape') confirmRow();
                        }}
                      />
                    ) : (
                      <span>${item.unit_price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="col-qty">
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        className="qty-input"
                        defaultValue={item.quantity}
                        onChange={(e) => handleQtyChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRow();
                          if (e.key === 'Escape') confirmRow();
                        }}
                      />
                    ) : (
                      <input
                        type="number"
                        className="qty-input"
                        value={item.quantity}
                        min="0"
                        onChange={(e) => handleQtyChange(index, e.target.value)}
                        onFocus={(e) => e.target.select()}
                      />
                    )}
                  </td>
                  <td className="col-total">${item.line_total.toFixed(2)}</td>
                  <td className="col-disc">
                    {item.discount > 0 ? <span className="text-red">-${item.discount.toFixed(2)}</span> : '—'}
                  </td>
                  <td className="col-edit">
                    <button className="btn-remove-item" onClick={() => {
                      if (isEditing) setEditingRow(null);
                      removeItem(index);
                    }}>✕</button>
                  </td>
                </tr>
              );
            })}

            {/* Code entry row - only shown when not editing */}
            {editingRow === null && (
              <tr className="entry-row" ref={tableEndRef}>
                <td className="col-itemnum entry-cell">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    className="inline-code-input"
                    placeholder="Code..."
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCodeSubmit(); }}
                  />
                  {codeError && <span className="inline-error">{codeError}</span>}
                </td>
                <td className="col-desc entry-cell" colSpan="6">
                  <span className="entry-hint">
                    {items.length === 0
                      ? 'Type item code, scan barcode, or press 1 (Grocery) / 2 (Grocery Taxed)'
                      : 'Scan or type next item...'}
                  </span>
                </td>
              </tr>
            )}

            {editingRow !== null && <tr ref={tableEndRef}><td colSpan="7"></td></tr>}

            {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
                <td className="col-itemnum"></td><td className="col-desc"></td>
                <td className="col-price"></td><td className="col-qty"></td>
                <td className="col-total"></td><td className="col-disc"></td>
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
