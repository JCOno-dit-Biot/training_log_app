import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { GlobalCacheProvider } from './context/GlobalCacheContext';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GlobalCacheProvider>
          <App />
        </GlobalCacheProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
