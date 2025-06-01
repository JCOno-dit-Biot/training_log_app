import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { ImageCacheProvider } from './context/ImageCacheContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ImageCacheProvider>
        <App />
      </ImageCacheProvider>
    </BrowserRouter>
  </React.StrictMode>
);
