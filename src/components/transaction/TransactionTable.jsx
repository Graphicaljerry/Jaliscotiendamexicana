import React, { useState, useRef, useEffect } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './TransactionTable.css';

function TransactionTable({ onInlineItemAdd, onOpenScale }) {
  const items = useTransactionStore((s) => s.items);
  const addItem = useTransactionStore((s) => s.addItem);
  const removeItem = useTransactionStore((s) => s.removeItem);
  const updateItemQuantity = useTransactionStore((s) => s.updateItemQuantity);
  const [itemCode, setItemCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Custom price entry state
  const [customEntry, setCustomEntry] = useState(null); // null or { taxable: boolean }
  const [customDesc, setCustomDesc] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customQty, setCustomQty] = useState('1');

  const inputRef = useRef(null);
  const customDescRef = useRef(null);
  const tableEndRef = useRef(null);

  useEffect(() => {
    if (!customEntry && inputRef.current) inputRef.current.focus();
    if (tableEndRef.current) tableEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [items.length, customEntry]);

  useEffect(() => {
    if (customEntry && customDescRef.current) customDescRef.current.focus();
  }, [customEntry]);

  const handleCodeSubmit = async () => {
    const code = itemCode.trim();
    if (!code) return;

    // Code "1" = custom non-taxable entry
    if (code === '1') {
      setCustomEntry({ taxable: false });
      setCustomDesc('');
      setCustomPrice('');
      setCustomQty('1');
      setItemCode('');
      return;
    }

    // Code "2" = custom taxable entry
    if (code === '2') {
      setCustomEntry({ taxable: true });
      setCustomDesc('');
      setCustomPrice('');
      setCustomQty('1');
      setItemCode('');
      return;
    }

    setCodeError('');
    const found = await onInlineItemAdd(code);
    if (found) {
      setItemCode('');
    } else {
      setCodeError('Not found');
      setTimeout(() => setCodeError(''), 1500);
    }
  };

  const handleCustomSubmit = () => {
    const price = parseFloat(customPrice);
    const qty = parseInt(customQty) || 1;
    if (isNaN(price) || price <= 0) return;

    const desc = customDesc.trim() || (customEntry.taxable ? 'Taxable Item' : 'Non-Tax Item');

    addItem({
      id: Date.now(),
      name: desc,
      price: price,
      is_taxable: customEntry.taxable ? 1 : 0,
      is_ebt_eligible: 0,
      barcode: customEntry.taxable ? '2' : '1',
    });

    // If qty > 1, update the last item's quantity
    if (qty > 1) {
      // Small delay so the item is added first
      setTimeout(() => {
        const currentItems = useTransactionStore.getState().items;
        updateItemQuantity(currentItems.length - 1, qty);
      }, 10);
    }

    setCustomEntry(null);
    setCustomDesc('');
    setCustomPrice('');
    setCustomQty('1');
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
        <div className="code-legend">
          <span className="legend-item"><strong>1</strong> = Custom (No Tax)</span>
          <span className="legend-item"><strong>2</strong> = Custom (Taxed)</span>
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

      {/* Transaction items table */}
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
                <td className="col-desc">
                  {item.item_name || item.name}
                  {item.is_taxable === 0 && <span className="tax-badge no-tax">NT</span>}
                </td>
                <td className="col-price">${item.unit_price.toFixed(2)}</td>
                <td className="col-qty">
                  <input type="number" className="qty-input" value={item.quantity} min="0"
                    onChange={(e) => handleQtyChange(index, e.target.value)}
                    onFocus={(e) => e.target.select()} />
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

            {/* ─── CUSTOM PRICE ENTRY ROW ──────────────── */}
            {customEntry && (
              <tr className="custom-entry-row">
                <td className="col-itemnum">
                  <span className="custom-code-badge">{customEntry.taxable ? '2' : '1'}</span>
                </td>
                <td className="col-desc">
                  <input
                    ref={customDescRef}
                    type="text"
                    className="custom-input"
                    placeholder="Description (optional)"
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setCustomEntry(null); }}
                  />
                </td>
                <td className="col-price">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="custom-input custom-price-input"
                    placeholder="Price"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCustomSubmit();
                      if (e.key === 'Escape') setCustomEntry(null);
                    }}
                  />
                </td>
                <td className="col-qty">
                  <input
                    type="number"
                    min="1"
                    className="custom-input custom-qty-input"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCustomSubmit();
                      if (e.key === 'Escape') setCustomEntry(null);
                    }}
                  />
                </td>
                <td className="col-total">
                  <span className="custom-preview">
                    {customPrice ? `$${(parseFloat(customPrice || 0) * parseInt(customQty || 1)).toFixed(2)}` : '—'}
                  </span>
                </td>
                <td className="col-disc">
                  <span className={`tax-badge ${customEntry.taxable ? 'taxed' : 'no-tax'}`}>
                    {customEntry.taxable ? 'TAX' : 'NO TAX'}
                  </span>
                </td>
                <td className="col-edit">
                  <button className="btn-custom-ok" onClick={handleCustomSubmit}>OK</button>
                </td>
              </tr>
            )}

            {/* ─── INLINE ENTRY ROW ────────────────────── */}
            {!customEntry && (
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
                      ? 'Type item code, scan barcode, or press 1 (no tax) / 2 (taxed) for custom price'
                      : 'Scan or type next item... (1 = custom no tax, 2 = custom taxed)'}
                  </span>
                </td>
              </tr>
            )}

            {/* Empty placeholder rows */}
            {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, i) => (
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
