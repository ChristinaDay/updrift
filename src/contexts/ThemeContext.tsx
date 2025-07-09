'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, Theme, applyTheme } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Only two themes: 'dawn' (light) and 'cyber' (dark)
  const lightTheme = themes.find(t => t.name === 'dawn');
  const darkTheme = themes.find(t => t.name === 'cyber');
  const [currentTheme, setCurrentTheme] = useState<Theme>(darkTheme!);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved mode from localStorage
    const savedMode = localStorage.getItem('upfetch-mode') || 'dark';
    const theme = savedMode === 'dark' ? darkTheme : lightTheme;
    setCurrentTheme(theme!);
    applyTheme(theme!.name);
    setIsLoading(false);
  }, []);

  // Only allow 'light' or 'dark' as themeName
  const setTheme = (themeName: string) => {
    let theme: Theme | undefined;
    if (themeName === 'dark') {
      theme = darkTheme;
      localStorage.setItem('upfetch-mode', 'dark');
    } else {
      theme = lightTheme;
      localStorage.setItem('upfetch-mode', 'light');
    }
    if (!theme) return;
    setCurrentTheme(theme);
    applyTheme(theme.name);
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 