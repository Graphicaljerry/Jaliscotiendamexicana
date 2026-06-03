import { create } from 'zustand';

/**
 * Kitchen Display Store
 *
 * Manages "fired" orders sent from the POS to the kitchen/bar.
 * Syncs across browser tabs/windows via BroadcastChannel + localStorage
 * so the cashier terminal and the kitchen display stay in sync.
 *
 * In the real Electron app, this same data flows over the Express
 * LAN server instead — the UI and actions stay identical.
 */

const STORAGE_KEY = 'jalisco_kitchen_orders';

// Cross-tab broadcast channel (falls back gracefully if unsupported)
let channel = null;
try {
  channel = new BroadcastChannel('jalisco_kitchen');
} catch {
  channel = null;
}

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

const useKitchenStore = create((set, get) => ({
  orders: loadOrders(),

  // Fire a new order to the kitchen/bar
  fireOrder: (order) => {
    const newOrder = {
      id: Date.now() + Math.random(),
      orderNumber: order.orderNumber,
      orderType: order.orderType || 'dine_in', // dine_in | takeout | call_in | delivery
      customerName: order.customerName || '',
      tableNumber: order.tableNumber || '',
      phone: order.phone || '',
      items: order.items.map(it => ({
        name: it.item_name || it.name,
        quantity: it.quantity,
        note: it.note || '',
        done: false,
      })),
      note: order.note || '',
      firedAt: Date.now(),
      status: 'new', // new | cooking | ready
      station: order.station || 'kitchen', // kitchen | bar
    };

    set((state) => {
      const orders = [...state.orders, newOrder];
      persist(orders);
      if (channel) channel.postMessage({ type: 'sync', orders });
      return { orders };
    });

    return newOrder.id;
  },

  // Advance an order's status: new → cooking → ready
  advanceOrder: (id) => {
    set((state) => {
      const orders = state.orders.map(o => {
        if (o.id !== id) return o;
        const next = o.status === 'new' ? 'cooking' : o.status === 'cooking' ? 'ready' : 'ready';
        return { ...o, status: next };
      });
      persist(orders);
      if (channel) channel.postMessage({ type: 'sync', orders });
      return { orders };
    });
  },

  // Toggle a single item as done (checked off by the cook)
  toggleItemDone: (orderId, itemIndex) => {
    set((state) => {
      const orders = state.orders.map(o => {
        if (o.id !== orderId) return o;
        const items = o.items.map((it, i) => i === itemIndex ? { ...it, done: !it.done } : it);
        return { ...o, items };
      });
      persist(orders);
      if (channel) channel.postMessage({ type: 'sync', orders });
      return { orders };
    });
  },

  // Bump (complete + remove) an order from the display
  bumpOrder: (id) => {
    set((state) => {
      const orders = state.orders.filter(o => o.id !== id);
      persist(orders);
      if (channel) channel.postMessage({ type: 'sync', orders });
      return { orders };
    });
  },

  // Clear all orders (manager action)
  clearAll: () => {
    set(() => {
      persist([]);
      if (channel) channel.postMessage({ type: 'sync', orders: [] });
      return { orders: [] };
    });
  },

  // Internal: replace orders from a sync message
  _setOrders: (orders) => set({ orders }),
}));

// Listen for cross-tab updates
if (channel) {
  channel.onmessage = (e) => {
    if (e.data?.type === 'sync' && Array.isArray(e.data.orders)) {
      useKitchenStore.getState()._setOrders(e.data.orders);
    }
  };
}

// Also listen to storage events (backup sync method for older browsers)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        useKitchenStore.getState()._setOrders(JSON.parse(e.newValue));
      } catch {
        // ignore
      }
    }
  });
}

export default useKitchenStore;
