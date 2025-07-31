'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function useAuthSession() {
  const [isReady, setIsReady] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    // Allow more time for session to initialize
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Wrap useSession with error handling
  const sessionResult = (() => {
    if (!isClient || !isReady) {
      return {
        data: null,
        status: 'loading' as const,
        update: async () => null
      }
    }

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
  })()

  return sessionResult
}