import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Toaster } from 'sonner';
import './index.css';
import './styles/global.css';
import './styles/theme.css';
import './styles/responsive.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <Toaster position="top-right" richColors />
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

// Register PWA Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then((reg) => console.log("ARAM Service Worker registered successfully.", reg.scope))
      .catch((err) => console.error("ARAM Service Worker registration failed.", err));
  });
}

