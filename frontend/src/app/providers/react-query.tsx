import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function ReactQueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(() => new QueryClient({
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
    }));
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}