'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function ThemeToggle() {
  const { currentTheme, setTheme, isLoading } = useTheme();

  if (isLoading) return null;

  const isDark = currentTheme.name === 'cyber';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // For testing: use extremely dark gradient colors in both modes
  const gradientClass = 'bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white shadow-lg hover:from-gray-900 hover:via-gray-800 hover:to-black transform hover:scale-105 transition-all rounded-xl';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`w-9 h-9 p-0 border-0 ${gradientClass}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ color: 'white' }}
    >
      {isDark ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </Button>
  );
} 