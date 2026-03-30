const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Items
  getItems: () => ipcRenderer.invoke('db:items:getAll'),
  getItemByBarcode: (barcode) => ipcRenderer.invoke('db:items:getByBarcode', barcode),
  getItemById: (id) => ipcRenderer.invoke('db:items:getById', id),
  getItemsByCategory: (categoryId) => ipcRenderer.invoke('db:items:getByCategory', categoryId),
  searchItems: (query) => ipcRenderer.invoke('db:items:search', query),
  createItem: (item) => ipcRenderer.invoke('db:items:create', item),
  updateItem: (id, item) => ipcRenderer.invoke('db:items:update', id, item),
  deleteItem: (id) => ipcRenderer.invoke('db:items:delete', id),

  // Categories
  getCategories: () => ipcRenderer.invoke('db:categories:getAll'),
  createCategory: (category) => ipcRenderer.invoke('db:categories:create', category),
  updateCategory: (id, category) => ipcRenderer.invoke('db:categories:update', id, category),
  deleteCategory: (id) => ipcRenderer.invoke('db:categories:delete', id),

  // Customers
  searchCustomers: (query) => ipcRenderer.invoke('db:customers:search', query),
  getCustomerById: (id) => ipcRenderer.invoke('db:customers:getById', id),
  createCustomer: (customer) => ipcRenderer.invoke('db:customers:create', customer),
  updateCustomer: (id, customer) => ipcRenderer.invoke('db:customers:update', id, customer),

  // Transactions
  createTransaction: (transaction) => ipcRenderer.invoke('db:transactions:create', transaction),
  getTransactions: (filters) => ipcRenderer.invoke('db:transactions:getAll', filters),
  getTransactionById: (id) => ipcRenderer.invoke('db:transactions:getById', id),
  getDailySales: (date) => ipcRenderer.invoke('db:transactions:dailySales', date),

  // Settings
  getSetting: (key) => ipcRenderer.invoke('db:settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('db:settings:set', key, value),
  getAllSettings: () => ipcRenderer.invoke('db:settings:getAll'),

  // Printer
  printReceipt: (transaction) => ipcRenderer.invoke('printer:receipt', transaction),
  openCashDrawer: () => ipcRenderer.invoke('printer:openDrawer'),
  testPrinter: () => ipcRenderer.invoke('printer:test'),

  // Network
  getNetworkStatus: () => ipcRenderer.invoke('network:status'),
  setServerMode: (mode) => ipcRenderer.invoke('network:setMode', mode)
});
