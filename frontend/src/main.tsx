import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { GlobalCacheProvider } from './context/GlobalCacheContext';
import { AuthProvider } from './context/AuthContext';
import { AfterAuthWarmup } from './functions/auth/AfterAuthWarmup';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,     // 1 min: adjust per endpoint
      gcTime: 5 * 60_000,    // 5 min cache garbage collection
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AfterAuthWarmup />
          <App />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
