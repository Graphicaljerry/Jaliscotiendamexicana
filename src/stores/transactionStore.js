import { create } from 'zustand';

// Generate transaction numbers (auto-incrementing, stored in memory)
let nextTxnNumber = 300001;

const useTransactionStore = create((set, get) => ({
  // Transaction state
  items: [],
  customer: null,
  transactionType: 'sale',
  taxType: 'taxable',
  discountMode: 'none',
  discountPercent: 0,
  outputType: 'paper_tape',
  paymentType: 'cash',
  amountPaid: 0,
  taxRate: 8.25,

  // Current transaction number (assigned when items are added)
  transactionNumber: null,

  // Held transactions list
  heldTransactions: [],

  // Whether we're in "active transaction" mode or "idle" mode
  // idle = no items, shows the idle function bar with "Reload Held Transaction"
  // active = items present, shows the transaction function bar
  isActive: false,

  // Computed values
  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.line_total - (item.discount || 0), 0);
  },

  getTaxTotal: () => {
    const { items, taxType, taxRate } = get();
    if (taxType === 'tax_exempt') return 0;
    const rate = taxRate / 100;
    return items
      .filter(item => item.is_taxable)
      .reduce((sum, item) => sum + (item.line_total - (item.discount || 0)) * rate, 0);
  },

  getDiscountTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.discount || 0), 0);
  },

  getGrandTotal: () => {
    return get().getSubtotal() + get().getTaxTotal();
  },

  getEbtEligibleTotal: () => {
    const { items } = get();
    return items
      .filter(item => item.is_ebt_eligible)
      .reduce((sum, item) => sum + item.line_total - (item.discount || 0), 0);
  },

  getChange: () => {
    const { amountPaid } = get();
    const grandTotal = get().getGrandTotal();
    return Math.max(0, amountPaid - grandTotal);
  },

  // Begin a new transaction (assigns a number)
  beginTransaction: () => {
    const num = nextTxnNumber++;
    set({ isActive: true, transactionNumber: num });
  },

  // Actions
  addItem: (item) => {
    set((state) => {
      // Auto-begin transaction if not active
      let newState = {};
      if (!state.isActive || !state.transactionNumber) {
        newState = { isActive: true, transactionNumber: nextTxnNumber++ };
      }

      // Check if item already in cart
      const existingIndex = state.items.findIndex(i => i.item_id === item.id);
      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          line_total: (updated[existingIndex].quantity + 1) * updated[existingIndex].unit_price
        };
        return { ...newState, items: updated };
      }

      let discount = 0;
      if (state.discountMode === 'all' && state.discountPercent > 0) {
        discount = item.price * (state.discountPercent / 100);
      }

      return {
        ...newState,
        items: [...state.items, {
          item_id: item.id,
          barcode: item.barcode || null,
          item_name: item.name,
          name: item.name,
          unit_price: item.price,
          quantity: 1,
          line_total: item.price,
          discount: discount,
          is_taxable: item.is_taxable ?? 1,
          is_ebt_eligible: item.is_ebt_eligible ?? 0
        }]
      };
    });
  },

  removeItem: (index) => {
    set((state) => {
      const newItems = state.items.filter((_, i) => i !== index);
      return { items: newItems };
    });
  },

  removeLastItem: () => {
    set((state) => ({ items: state.items.slice(0, -1) }));
  },

  updateItemQuantity: (index, quantity) => {
    set((state) => {
      const updated = [...state.items];
      if (quantity <= 0) {
        return { items: updated.filter((_, i) => i !== index) };
      }
      updated[index] = {
        ...updated[index],
        quantity,
        line_total: quantity * updated[index].unit_price
      };
      return { items: updated };
    });
  },

  updateItemDiscount: (index, discount) => {
    set((state) => {
      const updated = [...state.items];
      updated[index] = { ...updated[index], discount };
      return { items: updated };
    });
  },

  updateItemPrice: (index, price) => {
    set((state) => {
      const updated = [...state.items];
      updated[index] = {
        ...updated[index],
        unit_price: price,
        line_total: updated[index].quantity * price
      };
      return { items: updated };
    });
  },

  setCustomer: (customer) => set({ customer }),
  setTransactionType: (type) => set({ transactionType: type }),
  setTaxType: (type) => set({ taxType: type }),
  setDiscountMode: (mode) => set({ discountMode: mode }),
  setDiscountPercent: (percent) => set({ discountPercent: percent }),
  setOutputType: (type) => set({ outputType: type }),
  setPaymentType: (type) => set({ paymentType: type }),
  setAmountPaid: (amount) => set({ amountPaid: amount }),
  setTaxRate: (rate) => set({ taxRate: rate }),

  returnNextFlag: false,
  setReturnNext: (flag) => set({ returnNextFlag: flag }),

  nextQuantity: 1,
  setNextQuantity: (qty) => set({ nextQuantity: qty }),

  taxExemptNextFlag: false,
  setTaxExemptNext: (flag) => set({ taxExemptNextFlag: flag }),

  // ─── HOLD TRANSACTION ─────────────────────────────────
  // Put current transaction on hold (kitchen sends ticket, cashier reloads later)
  holdTransaction: () => {
    const state = get();
    if (state.items.length === 0) return;

    const held = {
      id: state.transactionNumber || nextTxnNumber++,
      timestamp: new Date().toLocaleString(),
      customer: state.customer,
      items: [...state.items],
      transactionType: state.transactionType,
      taxType: state.taxType,
      subtotal: state.getSubtotal(),
      grandTotal: state.getGrandTotal(),
      itemCount: state.items.reduce((sum, i) => sum + i.quantity, 0),
    };

    set((s) => ({
      heldTransactions: [...s.heldTransactions, held],
      // Clear current transaction
      items: [],
      customer: null,
      transactionNumber: null,
      isActive: false,
      transactionType: 'sale',
      taxType: 'taxable',
      discountMode: 'none',
      discountPercent: 0,
      amountPaid: 0,
      returnNextFlag: false,
      nextQuantity: 1,
      taxExemptNextFlag: false,
    }));

    return held.id;
  },

  // Reload a held transaction (cashier pulls it up to charge customer)
  reloadHeldTransaction: (heldId) => {
    const state = get();
    const held = state.heldTransactions.find(h => h.id === heldId);
    if (!held) return false;

    set({
      items: [...held.items],
      customer: held.customer,
      transactionNumber: held.id,
      isActive: true,
      transactionType: held.transactionType,
      taxType: held.taxType,
      // Remove from held list
      heldTransactions: state.heldTransactions.filter(h => h.id !== heldId),
    });

    return true;
  },

  // Delete a held transaction without reloading
  deleteHeldTransaction: (heldId) => {
    set((s) => ({
      heldTransactions: s.heldTransactions.filter(h => h.id !== heldId),
    }));
  },

  // Clear the entire transaction and go back to idle
  clearTransaction: () => set({
    items: [],
    customer: null,
    transactionNumber: null,
    isActive: false,
    transactionType: 'sale',
    taxType: 'taxable',
    discountMode: 'none',
    discountPercent: 0,
    amountPaid: 0,
    paymentType: 'cash',
    returnNextFlag: false,
    nextQuantity: 1,
    taxExemptNextFlag: false
  }),

  // Repeat last transaction item (F1)
  repeatLastItem: () => {
    set((state) => {
      if (state.items.length === 0) return state;
      const lastItem = state.items[state.items.length - 1];
      return {
        items: [...state.items, { ...lastItem, quantity: 1, line_total: lastItem.unit_price, discount: 0 }]
      };
    });
  }
}));

export default useTransactionStore;
