"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import { UserIcon, MagnifyingGlassIcon, BookmarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-primary" aria-label="Go to home page">
              UpDrift
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/search"
                className={`flex items-center space-x-1 px-1.5 border-b-2 transition-colors duration-200 ${
                  pathname.startsWith("/search")
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-primary"
                }`}
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                <span>Search Jobs</span>
              </Link>
              {session && (
                <>
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-1 px-1.5 border-b-2 transition-colors duration-200 ${
                    pathname === "/dashboard"
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-primary"
                  }`}
                >
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/saved-jobs"
                  className={`flex items-center space-x-1 px-1.5 border-b-2 transition-colors duration-200 ${
                    pathname.startsWith("/saved-jobs")
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-primary"
                  }`}
                >
                  <BookmarkIcon className="h-4 w-4" />
                  <span>Saved Jobs</span>
                </Link>
                </>
              )}
            </nav>
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
                    <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
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
            ) : (
              <>
                <Link href="/auth/signin" className="hidden md:inline-block">
                  <button className="px-4 py-2 rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors text-sm font-medium mr-2">Sign In</button>
                </Link>
                <Link href="/auth/signup" className="hidden md:inline-block">
                  <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold">Get Started</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 