'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function useAuthSession() {
  const [isReady, setIsReady] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    // Ensure we're fully mounted on the client
    setIsMounted(true)
    setIsClient(true)
    
    // Allow more time for session to initialize and prevent hydration mismatches
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Always return loading state during SSR to prevent hydration mismatches
  if (!isMounted || !isClient || !isReady) {
    return {
      data: null,
      status: 'loading' as const,
      update: async () => null
    }
  }

  // Wrap useSession with error handling - only on client after mount
  try {
    return useSession()
  } catch (error) {
    console.error('Session error caught in useAuthSession:', error)
    return {
      data: null,
      status: 'unauthenticated' as const,
      update: async () => null
    }
  }
}