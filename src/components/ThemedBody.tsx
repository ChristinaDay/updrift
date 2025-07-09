'use client';
import React from 'react';
import SessionWrapper from './SessionWrapper';

export default function ThemedBody({ children }: { children: React.ReactNode }) {
  // No need to set theme class on <body>; applyTheme sets it on <html>
  return (
    <body className="transition-colors duration-200">
      <SessionWrapper>
        {children}
      </SessionWrapper>
    </body>
  );
} 