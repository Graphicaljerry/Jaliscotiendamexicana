import React from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './TransactionControls.css';

function TransactionControls() {
  const transactionType = useTransactionStore((s) => s.transactionType);
  const setTransactionType = useTransactionStore((s) => s.setTransactionType);
  const taxType = useTransactionStore((s) => s.taxType);
  const setTaxType = useTransactionStore((s) => s.setTaxType);
  const discountMode = useTransactionStore((s) => s.discountMode);
  const setDiscountMode = useTransactionStore((s) => s.setDiscountMode);
  const discountPercent = useTransactionStore((s) => s.discountPercent);
  const setDiscountPercent = useTransactionStore((s) => s.setDiscountPercent);
  const outputType = useTransactionStore((s) => s.outputType);
  const setOutputType = useTransactionStore((s) => s.setOutputType);

  return (
    <div className="transaction-controls">
      {/* Transaction Type */}
      <div className="control-group">
        <label className="section-label">Transaction Type</label>
        <div className="control-buttons">
          {['sale', 'return', 'layaway', 'order', 'quote'].map((type) => (
            <button
              key={type}
              className={`ctrl-btn ${transactionType === type ? 'active' : ''}`}
              onClick={() => setTransactionType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tax Type */}
      <div className="control-group">
        <label className="section-label">Tax</label>
        <div className="control-buttons">
          {[
            { key: 'taxable', label: 'Taxable' },
            { key: 'tax_exempt', label: 'Tax Exempt' },
            { key: 'alt_tax', label: 'Alt. Tax' }
          ].map((opt) => (
            <button
              key={opt.key}
              className={`ctrl-btn ${taxType === opt.key ? 'active' : ''}`}
              onClick={() => setTaxType(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div className="control-group">
        <label className="section-label">Discount</label>
        <div className="control-buttons">
          {[
            { key: 'none', label: 'No Disc.' },
            { key: 'by_line', label: 'By Line' },
            { key: 'all', label: 'Disc. All' }
          ].map((opt) => (
            <button
              key={opt.key}
              className={`ctrl-btn ${discountMode === opt.key ? 'active' : ''}`}
              onClick={() => setDiscountMode(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {discountMode !== 'none' && (
          <div className="discount-percent">
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              className="discount-input"
            />
            <span className="percent-sign">%</span>
          </div>
        )}
      </div>

      {/* Output Type */}
      <div className="control-group">
        <label className="section-label">Output</label>
        <div className="control-buttons">
          <button
            className={`ctrl-btn ${outputType === 'paper_tape' ? 'active' : ''}`}
            onClick={() => setOutputType('paper_tape')}
          >
            Paper Tape
          </button>
          <button
            className={`ctrl-btn ${outputType === 'invoice' ? 'active' : ''}`}
            onClick={() => setOutputType('invoice')}
          >
            Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionControls;
