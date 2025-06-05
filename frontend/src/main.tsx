import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { ImageCacheProvider } from './context/ImageCacheContext';
import { RunnerCacheProvider } from './context/RunnerCacheContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ImageCacheProvider>
        <RunnerCacheProvider>
        <App />
        </RunnerCacheProvider>
      </ImageCacheProvider>
    </BrowserRouter>
  </React.StrictMode>
);
