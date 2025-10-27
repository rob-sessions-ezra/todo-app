import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './auth/AuthContext'
import { pushToast } from './services/toaster'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const msg =
        (query?.meta as any)?.errorMessage ??
        (error instanceof Error ? error.message : 'Request failed');
      pushToast(msg, 'error');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      const msg =
        (mutation?.meta as any)?.errorMessage ??
        (error instanceof Error ? error.message : 'Action failed');
      pushToast(msg, 'error');
    },
    onSuccess: (_data, _vars, _ctx, mutation) => {
      const msg = (mutation?.meta as any)?.successMessage;
      if (msg) {
        pushToast(msg, 'success');
      }
    },
  }),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
)
