'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function useAuthSession() {
  const [isReady, setIsReady] = useState(false)
  
  // Wrap useSession with error handling
  const sessionResult = (() => {
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

  useEffect(() => {
    // Allow some time for session to initialize
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return {
      data: null,
      status: 'loading' as const,
      update: sessionResult.update
    }
  }

  return sessionResult
}