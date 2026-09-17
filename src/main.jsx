import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App.jsx';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { ThemeProvider } from '@/context/ThemeContext.jsx';
import { LanguageProvider } from '@/context/LanguageContext.jsx';
import { Toaster } from 'sonner';
import '@/index.css';
import '@/styles/theme.css';
import '@/styles/responsive.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Toaster position="top-right" richColors />
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

// Service Worker registration disabled to prevent asset caching bugs

