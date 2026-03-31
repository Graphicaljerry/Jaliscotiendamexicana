import { create } from 'zustand';

const useTransactionStore = create((set, get) => ({
  // Transaction state
  items: [],
  customer: null,
  transactionType: 'sale',       // sale, return, layaway, order, quote
  taxType: 'taxable',            // taxable, tax_exempt, alt_tax
  discountMode: 'none',          // none, by_line, all
  discountPercent: 0,
  outputType: 'paper_tape',      // paper_tape, invoice
  paymentType: 'cash',
  amountPaid: 0,
  taxRate: 8.25,

  // Computed values
  get itemCount() { return get().items.reduce((sum, item) => sum + item.quantity, 0); },

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

  // Actions
  addItem: (item) => {
    set((state) => {
      // Check if item already in cart
      const existingIndex = state.items.findIndex(i => i.item_id === item.id);
      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          line_total: (updated[existingIndex].quantity + 1) * updated[existingIndex].unit_price
        };
        return { items: updated };
      }

      // Apply discount if discount-all mode
      let discount = 0;
      if (state.discountMode === 'all' && state.discountPercent > 0) {
        discount = item.price * (state.discountPercent / 100);
      }

      return {
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
    set((state) => ({
      items: state.items.filter((_, i) => i !== index)
    }));
  },

  removeLastItem: () => {
    set((state) => ({
      items: state.items.slice(0, -1)
    }));
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

  // Set next item to return (F3 - Return Next)
  returnNextFlag: false,
  setReturnNext: (flag) => set({ returnNextFlag: flag }),

  // Set quantity for next item (F5)
  nextQuantity: 1,
  setNextQuantity: (qty) => set({ nextQuantity: qty }),

  // Tax exempt next item
  taxExemptNextFlag: false,
  setTaxExemptNext: (flag) => set({ taxExemptNextFlag: flag }),

  // Clear the entire transaction
  clearTransaction: () => set({
    items: [],
    customer: null,
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
