const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Database and IPC will be loaded after we set up the build steps
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1366,
    minHeight: 768,
    title: 'Jalisco Tienda Mexicana POS',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // In development, load from Vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Maximize on start for POS usage
  mainWindow.maximize();
}

app.whenReady().then(() => {
  // Initialize database
  try {
    const { initDatabase } = require('./database/index.js');
    initDatabase();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database init error:', err.message);
  }

  // Register IPC handlers
  try {
    const { registerHandlers } = require('./ipc/handlers.js');
    registerHandlers();
    console.log('IPC handlers registered');
  } catch (err) {
    console.error('IPC handler registration error:', err.message);
  }

  // Start network server if this is the primary terminal
  try {
    const { getDb } = require('./database/index.js');
    const db = getDb();
    const modeRow = db.prepare("SELECT value FROM settings WHERE key = 'server_mode'").get();
    if (!modeRow || modeRow.value === 'primary') {
      const { startServer } = require('./services/network.js');
      const portRow = db.prepare("SELECT value FROM settings WHERE key = 'server_port'").get();
      const port = portRow ? parseInt(portRow.value) : 3000;
      startServer(port);
    }
  } catch (err) {
    console.error('Network server start error:', err.message);
  }

  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
