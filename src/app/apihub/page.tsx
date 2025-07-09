'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { MagnifyingGlassIcon, BookmarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { jobProviders } from '@/lib/apihub';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export default function APIhubPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Nav Bar (identical to dashboard) */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-primary">
                UpDrift
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/search" className="text-muted-foreground hover:text-primary flex items-center space-x-1">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Search Jobs</span>
                </Link>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary flex items-center space-x-1">
                  <span>Dashboard</span>
                </Link>
                <Link href="/saved-jobs" className="text-muted-foreground hover:text-primary flex items-center space-x-1">
                  <BookmarkIcon className="h-4 w-4" />
                  <span>Saved Jobs</span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {session && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {session.user?.name || session.user?.email}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => signOut({ callbackUrl: '/auth/signin' })}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">APIhub</h1>
        <p className="text-lg text-muted-foreground mb-8">
          All connected job API sources powering your Updrift search. More sources = better results!
        </p>
        <Link
          href="/dashboard"
          className="inline-block mb-8 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow"
        >
          ← Return to Dashboard
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobProviders.map((provider) => (
            <div key={provider.id} className="bg-card rounded-lg shadow border border-border p-6 flex items-center gap-4">
              {provider.logoUrl && (
                <img src={provider.logoUrl} alt={provider.displayName + ' logo'} className="w-12 h-12 rounded bg-muted object-contain" />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">{provider.displayName}</h2>
                <p className="text-sm text-muted-foreground">Status: <span className="text-green-600 font-medium">Active</span></p>
                <p className="text-xs text-muted-foreground mt-1">Provider ID: {provider.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 