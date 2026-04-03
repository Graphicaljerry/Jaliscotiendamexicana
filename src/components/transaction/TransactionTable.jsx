import React, { useState, useRef, useEffect, useCallback } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './TransactionTable.css';

function TransactionTable({ onInlineItemAdd, onOpenScale, sidebarOpen, onToggleSidebar }) {
  const items = useTransactionStore((s) => s.items);
  const addItem = useTransactionStore((s) => s.addItem);
  const removeItem = useTransactionStore((s) => s.removeItem);
  const updateItemQuantity = useTransactionStore((s) => s.updateItemQuantity);
  const updateItemPrice = useTransactionStore((s) => s.updateItemPrice);
  const [itemCode, setItemCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  // Editing state
  const [editingRow, setEditingRow] = useState(null);
  const [editField, setEditField] = useState(null);

  const codeRef = useRef(null);
  const priceRef = useRef(null);
  const qtyRef = useRef(null);
  const tableEndRef = useRef(null);

  // Focus the hidden code input ONLY when not editing and search is not focused
  // Re-runs on any item/edit/search state change
  useEffect(() => {
    if (editingRow === null && !searchFocused) {
      const timer = setTimeout(() => {
        const modalOpen = document.querySelector('.modal-overlay');
        if (!modalOpen && codeRef.current) codeRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editingRow, items.length, searchFocused]);

  // Also refocus when component mounts or items are cleared (cancel)
  useEffect(() => {
    if (items.length === 0 && codeRef.current) {
      setTimeout(() => codeRef.current?.focus(), 150);
    }
  }, [items.length]);

  // Focus price or qty when editing
  useEffect(() => {
    if (editingRow === null) return;
    if (editField === 'price' && priceRef.current) {
      setTimeout(() => { priceRef.current?.focus(); priceRef.current?.select(); }, 50);
    } else if (editField === 'qty' && qtyRef.current) {
      setTimeout(() => { qtyRef.current?.focus(); qtyRef.current?.select(); }, 50);
    }
    if (tableEndRef.current) tableEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [editingRow, editField]);

  // After adding, decide where to focus
  const startEditingLastRow = useCallback((item) => {
    setTimeout(() => {
      const currentItems = useTransactionStore.getState().items;
      const newIndex = currentItems.length - 1;

      // Only open scale if item explicitly has sell_by === 'S'
      if (item.sell_by === 'S') {
        onOpenScale();
        setEditingRow(null);
        setEditField(null);
      } else if (item.price > 0) {
        setEditingRow(newIndex);
        setEditField('qty');
      } else {
        setEditingRow(newIndex);
        setEditField('price');
      }
    }, 30);
  }, [onOpenScale]);

  const handleCodeSubmit = async () => {
    const code = itemCode.trim();
    if (!code) return;

    // Quick codes for manual entry
    const QUICK_CODES = {
      '000': { name: 'Convenience Fee', is_taxable: 1, is_ebt_eligible: 0 },
      '1':   { name: 'Grocery', is_taxable: 0, is_ebt_eligible: 1 },
      '2':   { name: 'Grocery Tax', is_taxable: 1, is_ebt_eligible: 0 },
      '3':   { name: 'Meat/Carne/Cheese', is_taxable: 1, is_ebt_eligible: 1 },
      '5':   { name: 'Restaurant/Food', is_taxable: 1, is_ebt_eligible: 0 },
      '11':  { name: 'Boss Revolution', is_taxable: 1, is_ebt_eligible: 0 },
    };

    if (QUICK_CODES[code]) {
      const qc = QUICK_CODES[code];
      addItem({
        id: Date.now(),
        name: qc.name,
        price: 0,
        is_taxable: qc.is_taxable,
        is_ebt_eligible: qc.is_ebt_eligible,
        barcode: code,
      });
      setItemCode('');
      startEditingLastRow({ price: 0, sell_by: 'Q' });
      return;
    }

    setCodeError('');
    let item = null;
    if (window.api) {
      // Exact barcode match only
      item = await window.api.getItemByBarcode(code);
    }

    if (item) {
      addItem(item);
      setItemCode('');
      startEditingLastRow(item);
    } else {
      setCodeError('Not found');
      setTimeout(() => setCodeError(''), 1500);
    }
  };

  const confirmRow = () => {
    if (editingRow !== null && items[editingRow]) {
      const item = items[editingRow];
      if (item.unit_price === 0 && (item.barcode === '1' || item.barcode === '2')) {
        removeItem(editingRow);
      }
    }
    setEditingRow(null);
    setEditField(null);
  };

  const handlePriceEnter = () => {
    setEditField('qty');
  };

  const handleEditPrice = (index, value) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) updateItemPrice(index, price);
  };

  const handleQtyChange = (index, value) => {
    const qty = parseFloat(value);
    if (!isNaN(qty)) updateItemQuantity(index, qty);
  };

  // Search — debounced, limited results for performance
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      if (window.api) {
        const results = await window.api.searchItems(searchQuery);
        setSearchResults(results.slice(0, 10));
      }
    }, 400); // 400ms debounce for 17K items
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSelect = (item) => {
    addItem(item);
    setSearchQuery('');
    setSearchResults([]);
    setSearchFocused(false);
    startEditingLastRow(item);
  };

  return (
    <div className="transaction-table-wrapper">
      <div className="table-top-bar">
        <button className="btn-sidebar-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
            {sidebarOpen ? <polyline points="15 9 12 12 15 15" /> : <polyline points="12 9 15 12 12 15" />}
          </svg>
        </button>
        <div className="code-legend">
          <span className="legend-item"><strong>000</strong> Conv. Fee</span>
          <span className="legend-item"><strong>1</strong> Grocery</span>
          <span className="legend-item"><strong>2</strong> Grocery Tax</span>
          <span className="legend-item"><strong>3</strong> Meat/Cheese</span>
          <span className="legend-item"><strong>5</strong> Restaurant</span>
          <span className="legend-item"><strong>11</strong> Boss Rev.</span>
        </div>
        <div className="search-wrap">
          <input
            type="text"
            className="compact-search"
            placeholder="Search item by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              // Delay to allow click on dropdown
              setTimeout(() => setSearchFocused(false), 200);
            }}
          />
          {searchResults.length > 0 && searchFocused && (
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
                    {isEditing && editField === 'price' ? (
                      <input ref={priceRef} type="number" step="0.01" min="0"
                        className="qty-input edit-price-input"
                        defaultValue={item.unit_price > 0 ? item.unit_price : ''}
                        placeholder="0.00"
                        onChange={(e) => handleEditPrice(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handlePriceEnter();
                          if (e.key === 'Escape') confirmRow();
                          if (e.key === 'Tab') { e.preventDefault(); handlePriceEnter(); }
                        }}
                      />
                    ) : (
                      <span>${item.unit_price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="col-qty">
                    {isEditing && (editField === 'qty' || editField === 'price') ? (
                      <input ref={editField === 'qty' ? qtyRef : undefined}
                        type="number" step="0.01" min="0.01" className="qty-input"
                        defaultValue={item.quantity}
                        onChange={(e) => handleQtyChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRow();
                          if (e.key === 'Escape') confirmRow();
                        }}
                      />
                    ) : (
                      <input type="number" className="qty-input" value={item.quantity}
                        min="0" step="0.01"
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
                      if (isEditing) { setEditingRow(null); setEditField(null); }
                      removeItem(index);
                    }}>✕</button>
                  </td>
                </tr>
              );
            })}

            {/* Typing indicator row */}
            {editingRow === null && (
              <tr className="entry-row" ref={tableEndRef}>
                <td className="col-itemnum entry-cell">
                  <span className="typing-indicator">
                    {itemCode || <span className="typing-cursor">|</span>}
                  </span>
                  {codeError && <span className="inline-error">{codeError}</span>}
                </td>
                <td className="col-desc entry-cell" colSpan="6">
                  <span className="entry-hint">
                    {items.length === 0 ? 'Type item code or quick code (1, 2, 3, 5, 11, 000)...' : 'Type next item code...'}
                  </span>
                </td>
              </tr>
            )}

            {editingRow !== null && <tr ref={tableEndRef}><td colSpan="7" className="spacer-cell"></td></tr>}

            {/* Fill remaining space with empty rows */}
            {Array.from({ length: 20 }).map((_, i) => (
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

      {/* Hidden input for item codes — does NOT steal focus from search */}
      <input
        ref={codeRef}
        type="text"
        inputMode="numeric"
        className="hidden-code-input"
        value={itemCode}
        onChange={(e) => setItemCode(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCodeSubmit(); }}
        onBlur={() => {
          if (editingRow === null && !searchFocused) {
            setTimeout(() => {
              const modalOpen = document.querySelector('.modal-overlay');
              const searchActive = document.querySelector('.compact-search:focus');
              if (!modalOpen && !searchActive) codeRef.current?.focus();
            }, 200);
          }
        }}
      />
    </div>
  );
}

export default TransactionTable;
