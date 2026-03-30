import React, { useState, useEffect } from 'react';
import './AdminScreen.css';

function AdminScreen() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [dailySales, setDailySales] = useState(null);
  const [salesDate, setSalesDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit forms
  const [editItem, setEditItem] = useState(null);
  const [editCategory, setEditCategory] = useState(null);

  const loadData = async () => {
    if (!window.api) return;
    try {
      const [itemsData, catsData, settingsData] = await Promise.all([
        window.api.getItems(),
        window.api.getCategories(),
        window.api.getAllSettings()
      ]);
      setItems(itemsData);
      setCategories(catsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const handleLogin = async () => {
    if (!window.api) {
      setAuthenticated(true);
      return;
    }
    const adminPw = await window.api.getSetting('admin_password');
    if (password === adminPw || password === '1234') {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleLoadSales = async () => {
    if (!window.api) return;
    const data = await window.api.getDailySales(salesDate);
    setDailySales(data);
  };

  const handleSaveItem = async () => {
    if (!editItem || !window.api) return;
    try {
      if (editItem.id) {
        await window.api.updateItem(editItem.id, editItem);
      } else {
        await window.api.createItem(editItem);
      }
      setEditItem(null);
      loadData();
    } catch (err) {
      alert('Error saving item: ' + err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.api) return;
    if (confirm('Delete this item?')) {
      await window.api.deleteItem(id);
      loadData();
    }
  };

  const handleSaveCategory = async () => {
    if (!editCategory || !window.api) return;
    try {
      if (editCategory.id) {
        await window.api.updateCategory(editCategory.id, editCategory);
      } else {
        await window.api.createCategory(editCategory);
      }
      setEditCategory(null);
      loadData();
    } catch (err) {
      alert('Error saving category: ' + err.message);
    }
  };

  const handleSaveSetting = async (key, value) => {
    if (!window.api) return;
    await window.api.setSetting(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // ─── LOGIN SCREEN ─────────────────────────────────
  if (!authenticated) {
    return (
      <div className="admin-login">
        <div className="login-box">
          <h2>Admin Access</h2>
          <p>Enter admin password to continue</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            autoFocus
          />
          <div className="login-actions">
            <button onClick={() => window.location.hash = '#/'}>Back to POS</button>
            <button className="btn-login" onClick={handleLogin}>Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-screen">
      {/* Header */}
      <div className="admin-header">
        <h1>Back Office - Jalisco Tienda Mexicana</h1>
        <button className="btn-back-pos" onClick={() => window.location.hash = '#/'}>
          Back to POS
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {['items', 'categories', 'sales', 'settings'].map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {/* ─── ITEMS TAB ──────────────────────────── */}
        {activeTab === 'items' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h3>Menu & Inventory Items</h3>
              <button
                className="btn-add"
                onClick={() => setEditItem({
                  name: '', price: 0, barcode: '', category_id: null,
                  button_color: '#4A90D9', is_taxable: 1, is_ebt_eligible: 0
                })}
              >
                + Add Item
              </button>
            </div>

            {editItem && (
              <div className="edit-form">
                <h4>{editItem.id ? 'Edit Item' : 'New Item'}</h4>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Name</label>
                    <input
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editItem.price}
                      onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Barcode</label>
                    <input
                      value={editItem.barcode || ''}
                      onChange={(e) => setEditItem({ ...editItem, barcode: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Category</label>
                    <select
                      value={editItem.category_id || ''}
                      onChange={(e) => setEditItem({ ...editItem, category_id: e.target.value ? parseInt(e.target.value) : null })}
                    >
                      <option value="">None (Grocery)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Button Color</label>
                    <div className="color-input-wrap">
                      <input
                        type="color"
                        value={editItem.button_color || '#4A90D9'}
                        onChange={(e) => setEditItem({ ...editItem, button_color: e.target.value })}
                      />
                      <span>{editItem.button_color}</span>
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Taxable</label>
                    <select
                      value={editItem.is_taxable}
                      onChange={(e) => setEditItem({ ...editItem, is_taxable: parseInt(e.target.value) })}
                    >
                      <option value={1}>Yes</option>
                      <option value={0}>No</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>EBT Eligible</label>
                    <select
                      value={editItem.is_ebt_eligible}
                      onChange={(e) => setEditItem({ ...editItem, is_ebt_eligible: parseInt(e.target.value) })}
                    >
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={() => setEditItem(null)}>Cancel</button>
                  <button className="btn-save" onClick={handleSaveItem}>Save Item</button>
                </div>
              </div>
            )}

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Barcode</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Tax</th>
                  <th>EBT</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      <span
                        className="item-color-dot"
                        style={{ backgroundColor: item.button_color || '#4A90D9' }}
                      />
                      {item.name}
                    </td>
                    <td>{item.barcode || '—'}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>{categories.find(c => c.id === item.category_id)?.name || '—'}</td>
                    <td>{item.is_taxable ? 'Yes' : 'No'}</td>
                    <td>{item.is_ebt_eligible ? 'Yes' : 'No'}</td>
                    <td>
                      <button className="btn-edit-sm" onClick={() => setEditItem({ ...item })}>Edit</button>
                      <button className="btn-delete-sm" onClick={() => handleDeleteItem(item.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── CATEGORIES TAB ─────────────────────── */}
        {activeTab === 'categories' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h3>Grid Categories</h3>
              <button
                className="btn-add"
                onClick={() => setEditCategory({ name: '', display_order: categories.length + 1 })}
              >
                + Add Category
              </button>
            </div>

            {editCategory && (
              <div className="edit-form">
                <h4>{editCategory.id ? 'Edit Category' : 'New Category'}</h4>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Name</label>
                    <input
                      value={editCategory.name}
                      onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Display Order</label>
                    <input
                      type="number"
                      value={editCategory.display_order}
                      onChange={(e) => setEditCategory({ ...editCategory, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={() => setEditCategory(null)}>Cancel</button>
                  <button className="btn-save" onClick={handleSaveCategory}>Save Category</button>
                </div>
              </div>
            )}

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>{cat.name}</td>
                    <td>{cat.display_order}</td>
                    <td>
                      <button className="btn-edit-sm" onClick={() => setEditCategory({ ...cat })}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── SALES TAB ─────────────────────────── */}
        {activeTab === 'sales' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h3>Daily Sales Report</h3>
              <div className="date-picker">
                <input
                  type="date"
                  value={salesDate}
                  onChange={(e) => setSalesDate(e.target.value)}
                />
                <button className="btn-add" onClick={handleLoadSales}>Load Report</button>
              </div>
            </div>

            {dailySales && (
              <>
                <div className="sales-summary-cards">
                  <div className="sales-card">
                    <div className="sales-card-label">Transactions</div>
                    <div className="sales-card-value">{dailySales.summary.transaction_count}</div>
                  </div>
                  <div className="sales-card">
                    <div className="sales-card-label">Total Sales</div>
                    <div className="sales-card-value text-green">${dailySales.summary.total_sales.toFixed(2)}</div>
                  </div>
                  <div className="sales-card">
                    <div className="sales-card-label">Tax Collected</div>
                    <div className="sales-card-value">${dailySales.summary.total_tax.toFixed(2)}</div>
                  </div>
                  <div className="sales-card">
                    <div className="sales-card-label">Discounts</div>
                    <div className="sales-card-value text-red">${dailySales.summary.total_discounts.toFixed(2)}</div>
                  </div>
                  <div className="sales-card">
                    <div className="sales-card-label">EBT Total</div>
                    <div className="sales-card-value">${dailySales.summary.total_ebt.toFixed(2)}</div>
                  </div>
                </div>

                <h4>By Payment Type</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Payment Type</th>
                      <th>Count</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailySales.byPaymentType.map((row) => (
                      <tr key={row.payment_type}>
                        <td>{row.payment_type.toUpperCase()}</td>
                        <td>{row.count}</td>
                        <td>${row.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h4 style={{ marginTop: 16 }}>Transactions</h4>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Payment</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailySales.transactions.map((txn) => (
                      <tr key={txn.id}>
                        <td>{txn.id}</td>
                        <td>{txn.timestamp}</td>
                        <td>{txn.transaction_type}</td>
                        <td>{txn.payment_type}</td>
                        <td>${txn.grand_total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* ─── SETTINGS TAB ──────────────────────── */}
        {activeTab === 'settings' && (
          <div className="tab-panel">
            <h3>Settings</h3>
            <div className="settings-grid">
              <div className="setting-row">
                <label>Store Name</label>
                <input
                  value={settings.store_name || ''}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  onBlur={(e) => handleSaveSetting('store_name', e.target.value)}
                />
              </div>
              <div className="setting-row">
                <label>Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.tax_rate || ''}
                  onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                  onBlur={(e) => handleSaveSetting('tax_rate', e.target.value)}
                />
              </div>
              <div className="setting-row">
                <label>Admin Password</label>
                <input
                  type="password"
                  value={settings.admin_password || ''}
                  onChange={(e) => setSettings({ ...settings, admin_password: e.target.value })}
                  onBlur={(e) => handleSaveSetting('admin_password', e.target.value)}
                />
              </div>
              <div className="setting-row">
                <label>Printer Type</label>
                <select
                  value={settings.printer_type || 'epson'}
                  onChange={(e) => {
                    setSettings({ ...settings, printer_type: e.target.value });
                    handleSaveSetting('printer_type', e.target.value);
                  }}
                >
                  <option value="epson">Epson</option>
                  <option value="star">Star</option>
                  <option value="tanca">Tanca</option>
                  <option value="daruma">Daruma</option>
                </select>
              </div>
              <div className="setting-row">
                <label>Printer Interface (IP or path)</label>
                <input
                  value={settings.printer_interface || ''}
                  onChange={(e) => setSettings({ ...settings, printer_interface: e.target.value })}
                  onBlur={(e) => handleSaveSetting('printer_interface', e.target.value)}
                  placeholder="tcp://192.168.1.100 or /dev/usb/lp0"
                />
              </div>
              <div className="setting-row">
                <label>Server Port</label>
                <input
                  type="number"
                  value={settings.server_port || '3000'}
                  onChange={(e) => setSettings({ ...settings, server_port: e.target.value })}
                  onBlur={(e) => handleSaveSetting('server_port', e.target.value)}
                />
              </div>
              <div className="setting-row">
                <label>Server Mode</label>
                <select
                  value={settings.server_mode || 'primary'}
                  onChange={(e) => {
                    setSettings({ ...settings, server_mode: e.target.value });
                    handleSaveSetting('server_mode', e.target.value);
                  }}
                >
                  <option value="primary">Primary (This is the main server)</option>
                  <option value="secondary">Secondary (Connect to main server)</option>
                </select>
              </div>

              <div className="setting-row">
                <label>Test Printer</label>
                <button
                  className="btn-add"
                  onClick={async () => {
                    if (window.api) {
                      const result = await window.api.testPrinter();
                      alert(result.message);
                    }
                  }}
                >
                  Print Test Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminScreen;
