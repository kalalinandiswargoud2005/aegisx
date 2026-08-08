import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from './providers/theme-provider';
import { AuthProvider } from './features/auth/AuthContext';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { AppRoutes } from './routes';

// Providers
const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="aegisx-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <BrowserRouter>
              <div className="relative flex min-h-screen bg-background text-white">
                <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>
                <div className="relative flex flex-col flex-1 w-full min-w-0">
                  <AppRoutes />
                </div>
              </div>
              <Toaster theme="dark" position="bottom-right" />
            </BrowserRouter>
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
