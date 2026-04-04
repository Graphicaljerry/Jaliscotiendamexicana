import React, { useState, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import TransactionScreen from './components/transaction/TransactionScreen';
import AdminScreen from './components/admin/AdminScreen';
import PaymentPreview from './components/payment/PaymentPreview';
import useTransactionStore from './stores/transactionStore';

function App() {
  const setTaxRate = useTransactionStore((s) => s.setTaxRate);

  // Load tax rate from settings on startup
  useEffect(() => {
    async function loadSettings() {
      try {
        if (window.api) {
          const rate = await window.api.getSetting('tax_rate');
          if (rate) setTaxRate(parseFloat(rate));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, [setTaxRate]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<TransactionScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/payment-preview" element={<PaymentPreview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
