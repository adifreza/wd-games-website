import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StorefrontProvider } from './context/StorefrontContext.jsx';
import { ToastProvider } from './components/ToastProvider.jsx';

// Entry point SPA (Laravel + Vite)
createRoot(document.getElementById('wdgames-root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <StorefrontProvider>
            <App />
          </StorefrontProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
