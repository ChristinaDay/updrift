'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { PaintBrushIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

type Theme = {
  id: string
  name: string
  color: string
  primaryHsl: string
  description: string
  emoji: string
  bestFor: string
}

const themes: Theme[] = [
  {
    id: 'blue',
    name: 'Professional Blue',
    color: '#3b82f6',
    primaryHsl: '217 91% 60%',
    description: 'Trust, professionalism, corporate',
    emoji: '🔵',
    bestFor: 'Corporate & Finance'
  },
  {
    id: 'green',
    name: 'Fresh Green',
    color: '#22c55e',
    primaryHsl: '142 76% 36%',
    description: 'Growth, innovation, eco-friendly',
    emoji: '🟢',
    bestFor: 'Startups & Tech'
  },
  {
    id: 'purple',
    name: 'Creative Purple',
    color: '#8b5cf6',
    primaryHsl: '262 83% 58%',
    description: 'Creative, artistic, premium',
    emoji: '🟣',
    bestFor: 'Design & Creative'
  },
  {
    id: 'orange',
    name: 'Energetic Orange',
    color: '#f97316',
    primaryHsl: '24 74% 58%',
    description: 'Dynamic, warm, action-oriented',
    emoji: '🟠',
    bestFor: 'Sales & Marketing'
  }
]

export default function ThemeSelector({ showPreview = false }: { showPreview?: boolean }) {
  const [currentTheme, setCurrentTheme] = useState<string>('blue')
  const [isOpen, setIsOpen] = useState(false)

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('upfetch-theme') || 'blue'
    setCurrentTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (!theme) return

    // Update CSS variables
    const root = document.documentElement
    root.style.setProperty('--primary', theme.primaryHsl)
    root.style.setProperty('--ring', theme.primaryHsl)
    
    // Save to localStorage
    localStorage.setItem('upfetch-theme', themeId)
    setCurrentTheme(themeId)
  }

  const currentThemeData = themes.find(t => t.id === currentTheme)

  if (showPreview) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">🎨 Choose Your Theme</h2>
            <p className="text-muted-foreground">Click any theme to see it in action instantly!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {themes.map((theme) => (
              <Card 
                key={theme.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  currentTheme === theme.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => applyTheme(theme.id)}
              >
                <CardContent className="p-4 text-center">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-white shadow-lg"
                    style={{ backgroundColor: theme.color }}
                  />
                  <h3 className="font-semibold text-sm mb-1">
                    {theme.emoji} {theme.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {theme.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {theme.bestFor}
                  </Badge>
                  {currentTheme === theme.id && (
                    <Badge className="mt-2 w-full">
                      ✨ Active
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Theme changes apply instantly and are saved to your browser
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: currentThemeData?.color }}
          />
          <PaintBrushIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Theme</span>
          <ChevronDownIcon className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2">
          <p className="text-sm font-medium mb-2">Choose Theme</p>
          {themes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => applyTheme(theme.id)}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                currentTheme === theme.id ? 'bg-accent' : ''
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border flex-shrink-0"
                style={{ backgroundColor: theme.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  {theme.emoji} {theme.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {theme.bestFor}
                </div>
              </div>
              {currentTheme === theme.id && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 