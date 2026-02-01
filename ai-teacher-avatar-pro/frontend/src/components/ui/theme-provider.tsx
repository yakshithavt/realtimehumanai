import React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({ children, defaultTheme = 'light', storageKey }: ThemeProviderProps) {
  return (
    <div className={`theme-${defaultTheme}`}>
      {children}
    </div>
  );
}
