'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookmarkIcon, MagnifyingGlassIcon, UserIcon, SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { capitalizeLocation } from '@/utils/jobUtils'
import ThemeToggle from '@/components/ThemeToggle'
import Header from '@/components/Header'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load search history
      const searchResponse = await fetch('/api/user/saved-searches')
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        setSearchHistory(searchData.searches?.slice(0, 5) || []) // Show recent 5
      }

      // Load saved jobs
      const savedJobsResponse = await fetch('/api/user/saved-jobs?limit=5')
      if (savedJobsResponse.ok) {
        const savedJobsData = await savedJobsResponse.json()
        setSavedJobs(savedJobsData.savedJobs || [])
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session.user.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your job search
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/saved-jobs" className="group bg-card p-6 rounded-lg shadow-sm border border-border transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex flex-col h-full justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-secondary rounded-lg">
                <BookmarkSolidIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Saved Jobs</p>
                <p className="text-2xl font-bold text-foreground">{savedJobs.length}</p>
              </div>
            </div>
            <div className="flex items-center justify-end mt-6">
              <span className="text-primary text-sm font-medium">View</span>
            </div>
          </Link>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-secondary rounded-lg">
                <MagnifyingGlassIcon className="h-6 w-6 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-secondary rounded-lg">
                <UserIcon className="h-6 w-6 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold text-foreground">--</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Search</h3>
            <p className="text-muted-foreground mb-4">Find your next opportunity</p>
            <Link 
              href="/search"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-background bg-primary hover:bg-primary/90"
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Search Jobs
            </Link>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Profile Settings</h3>
            <p className="text-muted-foreground mb-4">Update your preferences and skills</p>
            <Link 
              href="/profile"
              className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">APIhub</h3>
            <p className="text-muted-foreground mb-4">See all connected job APIs and their status</p>
            <Link 
              href="/apihub"
              className="inline-flex items-center px-4 py-2 border border-accent bg-accent text-accent-foreground text-sm font-semibold rounded-md shadow hover:brightness-110 transition"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              View API Sources
            </Link>
          </div>
        </div>

        {/* Saved Jobs Section */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Recent Saved Jobs</h3>
              {savedJobs.length > 0 && (
                <Link 
                  href="/saved-jobs"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View all saved jobs
                </Link>
              )}
            </div>
          </div>
          <div className="p-6">
            {savedJobs.length === 0 ? (
              <div className="text-center py-8">
                <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h4>
                <p className="text-gray-600 mb-4">
                  Start saving jobs you're interested in to keep track of them
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {savedJobs.map((savedJob: any, index: number) => (
                  <div key={savedJob.id || index} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="p-2 bg-secondary rounded-lg">
                        <BookmarkSolidIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {savedJob.jobData.job_title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {savedJob.jobData.employer_name}
                        </p>
                        <p className="text-xs text-muted">
                          Saved {new Date(savedJob.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/saved-jobs`}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        View
                      </Link>
                      <Link
                        href={savedJob.jobData.job_apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-success hover:text-success/80 text-sm font-medium"
                      >
                        Apply
                      </Link>
                    </div>
                  </div>
                ))}
                
                {savedJobs.length >= 5 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/saved-jobs"
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      View all saved jobs
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Search History */}
        <div className="mt-8 bg-card rounded-lg shadow-sm border border-border">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Recent Searches</h3>
              <Link 
                href="/search"
                className="text-sm text-primary hover:text-primary/80"
              >
                Start new search
              </Link>
            </div>
          </div>
          <div className="p-6">
            {searchHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">No searches yet</h4>
                <p className="text-muted-foreground mb-4">
                  Start searching for jobs to see your activity here
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
                >
                  Start Searching
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {searchHistory.map((search: any, index: number) => (
                  <div key={search.id || index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent rounded-lg">
                        <MagnifyingGlassIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {search.query || 'All jobs'}
                          {search.location && ` in ${capitalizeLocation(search.location)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(search.searchedAt).toLocaleDateString()} at{' '}
                          {new Date(search.searchedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/search?${new URLSearchParams({
                        ...(search.query && { q: search.query }),
                        ...(search.location && { location: search.location })
                      }).toString()}`}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Search again
                    </Link>
                  </div>
                ))}
                {searchHistory.length >= 5 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/profile"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      View all search history
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 