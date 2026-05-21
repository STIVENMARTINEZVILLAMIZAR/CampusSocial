import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'default' | 'high-contrast';

type ThemeState = {
  mode: ThemeMode;
  toggleContrast: () => void;
};

const ThemeCtx = createContext<ThemeState | null>(null);
const STORAGE_KEY = 'campus-social-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'high-contrast' ? 'high-contrast' : 'default';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleContrast = () => {
    setMode((m) => (m === 'high-contrast' ? 'default' : 'high-contrast'));
  };

  return (
    <ThemeCtx.Provider value={{ mode, toggleContrast }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme dentro de ThemeProvider');
  return ctx;
}
