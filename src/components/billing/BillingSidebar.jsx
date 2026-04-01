import React, { useState, useRef } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import './BillingSidebar.css';

function BillingSidebar({ onShowPayment, onShowCustomer }) {
  const store = useTransactionStore();
  const items = store.items;
  const getSubtotal = store.getSubtotal;
  const getTaxTotal = store.getTaxTotal;
  const getGrandTotal = store.getGrandTotal;
  const addItem = store.addItem;

  const [itemCode, setItemCode] = useState('');
  const codeInputRef = useRef(null);

  const subtotal = getSubtotal();
  const taxTotal = getTaxTotal();
  const grandTotal = getGrandTotal();
  const discountTotal = items.reduce((sum, item) => sum + item.discount, 0);

  const handleAddByCode = async () => {
    const code = itemCode.trim();
    if (!code || !window.api) return;
    const item = await window.api.getItemByBarcode(code);
    if (item) {
      addItem(item);
      setItemCode('');
    }
  };

  const handleClearCart = () => {
    store.clearTransaction();
  };

  const handleQuantityChange = (index, delta) => {
    const item = items[index];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      store.removeItem(index);
    } else {
      store.updateItemQuantity(index, newQty);
    }
  };

  // Get a color for the item based on its name (consistent hashing)
  const getItemColor = (name) => {
    const colors = ['#2563EB', '#16a34a', '#ea580c', '#7c3aed', '#0d9488', '#dc2626', '#ca8a04'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="billing-sidebar">
      <div className="billing-header">
        <h2 className="billing-title">Billing Section</h2>
        {store.customer && (
          <button className="btn-customer-tag" onClick={onShowCustomer}>
            {store.customer.name}
          </button>
        )}
      </div>

      {/* Add Item Code */}
      <div className="billing-add-row">
        <input
          ref={codeInputRef}
          type="text"
          className="add-item-input"
          placeholder="Add item code..."
          value={itemCode}
          onChange={(e) => setItemCode(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddByCode(); }}
        />
        <button className="btn-add-item" onClick={handleAddByCode}>Add Item</button>
        <button className="btn-clear-cart" onClick={handleClearCart}>Clear Cart</button>
      </div>

      {/* Cart Items Header */}
      <div className="cart-header">
        <span className="cart-header-item">Item</span>
        <span className="cart-header-qty">QTY</span>
        <span className="cart-header-price">Price</span>
        <span className="cart-header-delete">Delete</span>
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {items.length === 0 ? (
          <div className="cart-empty">No items in cart. Scan or add items to begin.</div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="cart-item-icon" style={{ backgroundColor: getItemColor(item.item_name || item.name) }}>
                <span>{(item.item_name || item.name || '?').charAt(0).toUpperCase()}</span>
              </div>
              <div className="cart-item-info">
                <span className="cart-item-name">{item.item_name || item.name}</span>
                {item.is_taxable === 0 && <span className="cart-item-tag">NT</span>}
              </div>
              <div className="cart-item-qty">
                <button className="qty-btn" onClick={() => handleQuantityChange(index, -1)}>-</button>
                <span className="qty-value">{item.quantity}</span>
                <button className="qty-btn" onClick={() => handleQuantityChange(index, 1)}>+</button>
              </div>
              <span className="cart-item-price">${item.line_total.toFixed(2)}</span>
              <button className="cart-item-delete" onClick={() => store.removeItem(index)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="billing-totals">
        <div className="total-row">
          <span>Sub Total :</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>Product Discount :</span>
          <span>{discountTotal > 0 ? `-$${discountTotal.toFixed(2)}` : '$0.00'}</span>
        </div>
        <div className="total-row">
          <span>Tax ({store.taxRate}%) :</span>
          <span>${taxTotal.toFixed(2)}</span>
        </div>
        <div className="total-row total-row-grand">
          <span>Total :</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="billing-actions">
        <button className="btn-cancel-order" onClick={handleClearCart}>Cancel Order</button>
        <button
          className="btn-place-order"
          onClick={() => { if (items.length > 0) onShowPayment(); }}
          disabled={items.length === 0}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}

export default BillingSidebar;
