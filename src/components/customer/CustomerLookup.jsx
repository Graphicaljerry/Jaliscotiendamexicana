import React, { useState, useEffect, useRef } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './CustomerLookup.css';

function CustomerLookup({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const setCustomer = useTransactionStore((s) => s.setCustomer);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (window.api) {
          const res = await window.api.searchCustomers(query);
          setResults(res);
        }
      } catch (err) {
        console.error('Customer search error:', err);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (customer) => {
    setCustomer(customer);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' || e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content customer-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Customer Lookup</h2>
        <p className="customer-hint">
          Enter customer number, part of name, <strong>#</strong> followed by telephone number,
          or <strong>@</strong> followed by email address.
          Press <strong>Tab</strong> or <strong>Esc</strong> to skip.
        </p>

        <input
          ref={inputRef}
          type="text"
          className="customer-search-input"
          placeholder="Search customers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="customer-results">
          {loading ? (
            <div className="customer-loading">Searching...</div>
          ) : results.length === 0 && query.length > 0 ? (
            <div className="customer-empty">No customers found</div>
          ) : (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {results.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => handleSelect(customer)}
                    className="customer-row"
                  >
                    <td>{customer.customer_number}</td>
                    <td>{customer.name}</td>
                    <td>{customer.phone || '—'}</td>
                    <td>{customer.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="customer-modal-footer">
          <button className="btn-skip" onClick={onClose}>
            Skip (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerLookup;
