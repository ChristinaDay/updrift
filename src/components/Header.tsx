"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import { UserIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-primary" aria-label="Go to home page">
              UpDrift
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/search" className="text-muted-foreground hover:text-primary flex items-center space-x-1">
                <span>Search Jobs</span>
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-primary flex items-center space-x-1">
                <span>Dashboard</span>
              </Link>
              <Link href="/saved-jobs" className="text-muted-foreground hover:text-primary flex items-center space-x-1">
                <span>Saved Jobs</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-8 w-8">
                      {session.user.image ? (
                        <AvatarImage src={session.user.image} alt={session.user.name || session.user.email || "User"} />
                      ) : (
                        <AvatarFallback>
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm text-muted-foreground max-w-[120px] truncate">
                      {session.user.name || session.user.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
} 