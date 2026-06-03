import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useKitchenStore from '../../stores/kitchenStore';
import './KitchenScreen.css';

const ORDER_TYPE_LABELS = {
  dine_in: 'Dine In',
  takeout: 'To-Go',
  call_in: 'Call-In',
  delivery: 'Delivery',
};

function elapsed(firedAt) {
  const secs = Math.floor((Date.now() - firedAt) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ticketColorClass(firedAt) {
  const mins = (Date.now() - firedAt) / 60000;
  if (mins >= 10) return 'ticket-late';     // red — over 10 min
  if (mins >= 5) return 'ticket-warning';   // amber — over 5 min
  return 'ticket-fresh';                      // green — fresh
}

function KitchenScreen() {
  const navigate = useNavigate();
  const orders = useKitchenStore((s) => s.orders);
  const advanceOrder = useKitchenStore((s) => s.advanceOrder);
  const toggleItemDone = useKitchenStore((s) => s.toggleItemDone);
  const bumpOrder = useKitchenStore((s) => s.bumpOrder);
  const clearAll = useKitchenStore((s) => s.clearAll);
  const [station, setStation] = useState('all'); // all | kitchen | bar
  const [, setTick] = useState(0);

  // Re-render every second to update timers
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const visibleOrders = orders
    .filter((o) => station === 'all' || o.station === station)
    .sort((a, b) => a.firedAt - b.firedAt); // oldest first

  return (
    <div className="kitchen-screen">
      <div className="kitchen-header">
        <div className="kitchen-title">
          <span className="kds-dot" /> KITCHEN DISPLAY
          <span className="kds-count">{visibleOrders.length} active</span>
        </div>
        <div className="kitchen-station-tabs">
          {['all', 'kitchen', 'bar'].map((s) => (
            <button
              key={s}
              className={`station-tab ${station === s ? 'active' : ''}`}
              onClick={() => setStation(s)}
            >
              {s === 'all' ? 'All' : s === 'kitchen' ? 'Kitchen' : 'Bar'}
            </button>
          ))}
        </div>
        <div className="kitchen-actions">
          <button className="kds-btn-clear" onClick={() => { if (confirm('Clear all orders?')) clearAll(); }}>Clear All</button>
          <button className="kds-btn-pos" onClick={() => navigate('/')}>Back to POS</button>
        </div>
      </div>

      <div className="kitchen-grid">
        {visibleOrders.length === 0 ? (
          <div className="kitchen-empty">
            <div className="kitchen-empty-icon">🍽️</div>
            <p>No active orders</p>
            <p className="kitchen-empty-hint">Fired orders from the POS will appear here</p>
          </div>
        ) : (
          visibleOrders.map((order) => (
            <div key={order.id} className={`ticket ${ticketColorClass(order.firedAt)} status-${order.status}`}>
              <div className="ticket-header">
                <div className="ticket-num">#{order.orderNumber}</div>
                <div className="ticket-timer">{elapsed(order.firedAt)}</div>
              </div>

              <div className="ticket-meta">
                <span className={`ticket-type type-${order.orderType}`}>
                  {ORDER_TYPE_LABELS[order.orderType] || order.orderType}
                </span>
                {order.station === 'bar' && <span className="ticket-station">BAR</span>}
                {order.tableNumber && <span className="ticket-table">Table {order.tableNumber}</span>}
              </div>

              {(order.customerName || order.phone) && (
                <div className="ticket-customer">
                  {order.customerName}{order.phone ? ` · ${order.phone}` : ''}
                </div>
              )}

              <div className="ticket-items">
                {order.items.map((it, i) => (
                  <div
                    key={i}
                    className={`ticket-item ${it.done ? 'item-done' : ''}`}
                    onClick={() => toggleItemDone(order.id, i)}
                  >
                    <span className="item-qty">{it.quantity}×</span>
                    <span className="item-name">{it.name}</span>
                    {it.done && <span className="item-check">✓</span>}
                  </div>
                ))}
              </div>

              {order.note && <div className="ticket-note">📝 {order.note}</div>}

              <div className="ticket-footer">
                {order.status !== 'ready' ? (
                  <button className="ticket-advance" onClick={() => advanceOrder(order.id)}>
                    {order.status === 'new' ? 'Start Cooking' : 'Mark Ready'}
                  </button>
                ) : (
                  <span className="ticket-ready-label">READY</span>
                )}
                <button className="ticket-bump" onClick={() => bumpOrder(order.id)}>
                  Bump ✓
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default KitchenScreen;
