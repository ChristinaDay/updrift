'use client';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import SessionWrapper from './SessionWrapper';

export default function ThemedBody({ children }: { children: React.ReactNode }) {
  const { currentTheme } = useTheme();
  return (
    <body className={`${currentTheme ? `theme-${currentTheme.name}` : ''} transition-colors duration-200`}>
      <SessionWrapper>
        {children}
      </SessionWrapper>
    </body>
  );
} 