'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('upfetch-theme-mode') || 'light'
    const prefersDark = savedTheme === 'dark'
    setIsDark(prefersDark)
    applyTheme(prefersDark)
  }, [])

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement
    
    if (dark) {
      // Apply a sophisticated dark theme (Cyberpunk)
      html.className = html.className.replace(/theme-\w+/g, '') + ' theme-cyber'
    } else {
      // Apply a sophisticated light theme (Dawn)
      html.className = html.className.replace(/theme-\w+/g, '') + ' theme-dawn'
    }
    
    // Save preference
    localStorage.setItem('upfetch-theme-mode', dark ? 'dark' : 'light')
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    applyTheme(newIsDark)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </Button>
  )
} 