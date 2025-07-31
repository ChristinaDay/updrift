'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import ErrorBoundary from './ErrorBoundary'

interface SessionWrapperProps {
  children: ReactNode
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <ErrorBoundary>
      <SessionProvider 
        basePath="/api/auth"
        refetchInterval={5 * 60}
        refetchOnWindowFocus={true}
      >
        {children}
      </SessionProvider>
    </ErrorBoundary>
  )
} 