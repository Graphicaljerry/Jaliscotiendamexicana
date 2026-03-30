import React from 'react';
import ReactDOM from 'react-dom/client';
import { installMockApi } from './api-mock';
import App from './App';
import './styles/globals.css';

// Install mock API when running in browser (no Electron)
installMockApi();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
