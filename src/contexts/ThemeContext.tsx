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
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('upfetch-theme') || 'cyber';
    const theme = themes.find(t => t.name === savedTheme) || themes[0];
    
    setCurrentTheme(theme);
    applyTheme(theme.name);
    setIsLoading(false);
  }, []);

  const setTheme = (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
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