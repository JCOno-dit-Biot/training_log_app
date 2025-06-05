import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { GlobalCacheProvider } from './context/GlobalCacheContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalCacheProvider>
        <App />
      </GlobalCacheProvider>
    </BrowserRouter>
  </React.StrictMode>
);
