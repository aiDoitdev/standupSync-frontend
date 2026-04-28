'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// ─────────────────────────────────────────────────────────────────────────────
// QueryClient factory — called once per browser session via useState so the
// client is never shared across server-rendered requests.
// ─────────────────────────────────────────────────────────────────────────────

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 30 seconds — avoids redundant refetches
        // on tab switch / route change for frequently visited pages.
        staleTime: 30 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Only retry once on failure; API errors are usually definitive
        retry: 1,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
        // Don't refetch on window focus — the app has explicit refresh controls
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Surface mutation errors rather than swallowing them
        throwOnError: false,
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  // useState ensures each request gets its own QueryClient (SSR-safe)
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
