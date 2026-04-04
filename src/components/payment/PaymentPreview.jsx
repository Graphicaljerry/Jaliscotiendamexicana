import React, { useEffect } from 'react';
import useTransactionStore from '../../stores/transactionStore';
import PaymentModal from './PaymentModal';
import '../../styles/globals.css';

/**
 * Standalone preview page that renders the PaymentModal
 * with sample data pre-loaded. Used for Figma capture.
 * Access at /payment-preview
 */
function PaymentPreview() {
  const addItem = useTransactionStore((s) => s.addItem);
  const beginTransaction = useTransactionStore((s) => s.beginTransaction);
  const items = useTransactionStore((s) => s.items);

  useEffect(() => {
    // Pre-load sample items so the modal has real data
    if (items.length === 0) {
      beginTransaction();
      addItem({ id: 142, name: 'Cilantro', price: 0.79, is_taxable: 0, is_ebt_eligible: 1 });
      addItem({ id: 1, name: 'TACOS Azada', price: 1.99, is_taxable: 1, is_ebt_eligible: 0 });
      addItem({ id: 203, name: 'Coca Cola', price: 1.49, is_taxable: 1, is_ebt_eligible: 0 });
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PaymentModal onClose={() => {}} />
    </div>
  );
}

export default PaymentPreview;
