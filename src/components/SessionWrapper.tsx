'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode, Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary'

interface SessionWrapperProps {
  children: ReactNode
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <SessionProvider 
          basePath="/api/auth"
          refetchInterval={5 * 60}
          refetchOnWindowFocus={true}
          refetchWhenOffline={false}
        >
          {children}
        </SessionProvider>
      </Suspense>
    </ErrorBoundary>
  )
} 