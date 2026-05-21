import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import App from './App';
import AuthGate from './AuthGate';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

/** true = app CampusSocial (sin barra de diseño Figma) */
export const IS_PRODUCTION_APP = import.meta.env.VITE_APP_MODE === 'production';

function AppWithAuth() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] text-slate-600">
        Cargando CampusSocial…
      </div>
    );
  }

  if (IS_PRODUCTION_APP) {
    return <AuthGate />;
  }

  return <App />;
}

export default function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppWithAuth />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
