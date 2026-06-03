import React, { useState } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import useKitchenStore from '../../stores/kitchenStore';
import './FireToKitchenModal.css';

const ORDER_TYPES = [
  { key: 'dine_in', label: 'Dine In', icon: '🍽️' },
  { key: 'takeout', label: 'To-Go', icon: '🥡' },
  { key: 'call_in', label: 'Call-In', icon: '📞' },
  { key: 'delivery', label: 'Delivery', icon: '🚗' },
];

function FireToKitchenModal({ onClose }) {
  const store = useTransactionStore();
  const fireOrder = useKitchenStore((s) => s.fireOrder);

  const [orderType, setOrderType] = useState('call_in');
  const [station, setStation] = useState('kitchen');
  const [customerName, setCustomerName] = useState(store.customer?.name || '');
  const [phone, setPhone] = useState(store.customer?.phone || '');
  const [tableNumber, setTableNumber] = useState('');
  const [note, setNote] = useState('');
  const [keepOpen, setKeepOpen] = useState(true);
  const [fired, setFired] = useState(false);

  const handleFire = () => {
    if (store.items.length === 0) return;

    const orderNumber = store.transactionNumber || Math.floor(Math.random() * 9000 + 1000);

    fireOrder({
      orderNumber,
      orderType,
      station,
      customerName,
      phone,
      tableNumber,
      note,
      items: store.items,
    });

    setFired(true);

    // After firing, either hold the order for later payment, or keep it active
    setTimeout(() => {
      if (keepOpen) {
        // Put on hold so the cashier can reload it to take payment when ready
        store.holdTransaction();
      }
      onClose();
    }, 1200);
  };

  if (fired) {
    return (
      <div className="modal-overlay">
        <div className="modal-content fire-modal fire-success">
          <div className="fire-success-icon">🔥</div>
          <h2>Order Fired!</h2>
          <p>Sent to the {station === 'bar' ? 'bar' : 'kitchen'} display.</p>
          {keepOpen && <p className="fire-hold-note">Order held for payment — reload it when the customer is ready.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fire-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🔥 Fire Order to Kitchen</h2>

        {/* Order Type */}
        <label className="fire-label">Order Type</label>
        <div className="fire-type-grid">
          {ORDER_TYPES.map((t) => (
            <button
              key={t.key}
              className={`fire-type-btn ${orderType === t.key ? 'active' : ''}`}
              onClick={() => setOrderType(t.key)}
            >
              <span className="fire-type-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Station */}
        <label className="fire-label">Send To</label>
        <div className="fire-station-row">
          <button className={`fire-station-btn ${station === 'kitchen' ? 'active' : ''}`} onClick={() => setStation('kitchen')}>Kitchen</button>
          <button className={`fire-station-btn ${station === 'bar' ? 'active' : ''}`} onClick={() => setStation('bar')}>Bar</button>
        </div>

        {/* Details */}
        <div className="fire-fields">
          {orderType === 'dine_in' ? (
            <div className="fire-field">
              <label>Table #</label>
              <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="e.g. 5" />
            </div>
          ) : (
            <>
              <div className="fire-field">
                <label>Customer Name</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Name" />
              </div>
              <div className="fire-field">
                <label>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
              </div>
            </>
          )}
        </div>

        <div className="fire-field">
          <label>Kitchen Note (optional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. no onions, extra spicy" />
        </div>

        {/* Item preview */}
        <div className="fire-items-preview">
          <div className="fire-items-label">{store.items.length} item{store.items.length !== 1 ? 's' : ''}:</div>
          {store.items.map((it, i) => (
            <div key={i} className="fire-item-row">
              <span>{it.quantity}× {it.item_name || it.name}</span>
            </div>
          ))}
        </div>

        <label className="fire-keepopen">
          <input type="checkbox" checked={keepOpen} onChange={(e) => setKeepOpen(e.target.checked)} />
          Hold order for payment after firing (reload to charge later)
        </label>

        <div className="fire-actions">
          <button className="fire-cancel" onClick={onClose}>Cancel</button>
          <button className="fire-confirm" onClick={handleFire}>🔥 Fire to {station === 'bar' ? 'Bar' : 'Kitchen'}</button>
        </div>
      </div>
    </div>
  );
}

export default FireToKitchenModal;
