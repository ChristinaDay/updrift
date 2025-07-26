'use client'

/**
 * Job Search Page
 * 
 * IMPORTANT: Location Filtering Solution
 * =====================================
 * This page implements client-side location filtering to fix a critical issue with
 * the JSearch API (RapidAPI). The external API does not properly respect the location
 * parameter, often returning jobs from random locations when searching for specific cities.
 * 
 * Our solution:
 * 1. Send location parameter to API (for potential future improvements)
 * 2. Apply smart client-side filtering based on job_city, job_state, job_country fields
 * 3. Handle various location formats (city, state, abbreviations, metro areas)
 * 4. Show users filtering statistics to maintain transparency
 * 
 * This ensures users only see jobs actually relevant to their location search.
 * 
 * API THROTTLING & CACHING
 * ========================
 * - 24-hour cache duration for search results
 * - Only one API call per unique search per 24 hours
 * - Idle detection prevents API calls when user is inactive (10+ minutes)
 * - No automatic refresh when user becomes active again
 * - Manual search triggers required for new API calls
 */

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Job } from '@/types/job'
import { filterJobs, sortJobs, capitalizeLocation } from '@/utils/jobUtils'
import { useSearchJobs } from '@/lib/useSearchJobs'
import { useJobApplications } from '@/lib/useJobApplications'
import JobCard from '@/components/JobCard'
import ApiSetupGuide from '@/components/ApiSetupGuide'
import {
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { signOut } from 'next-auth/react';
// import ThemeSelector from '@/components/ThemeSelector'
import Header from '@/components/Header'

type SortOption = 'relevance' | 'date' | 'salary' | 'company'
type ViewMode = 'grid' | 'list'

function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [showApiGuide, setShowApiGuide] = useState(false)
  const [userPreferences, setUserPreferences] = useState<any>(null)

  // Use the new search hook
  const {
    jobs,
    filteredJobs: initialFilteredJobs,
    loading,
    dataSource,
    locationFilterResults,
    searchJobs,
    clearCache,
    cacheStats,
    isUserIdle
  } = useSearchJobs()

  // Use job applications hook
  const {
    applications,
    applyToJob,
    updateApplicationStatus,
    loading: applicationsLoading
  } = useJobApplications()

  // Enhanced filter states
  const [filters, setFilters] = useState({
    remote: false,
    salaryMin: '',
    salaryMax: '',
    employmentTypes: [] as string[],
    datePosted: 'all',
    experience: 'all',
    skills: [] as string[],
    companySize: [] as string[],
    schedule: [] as string[]
  })

  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [inputQuery, setInputQuery] = useState('')
  const [inputLocation, setInputLocation] = useState('')
  const [radius, setRadius] = useState(25) // Default 25 mile radius
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  // Local filtered jobs state (for client-side filtering)
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])

  // Get search parameters from URL
  useEffect(() => {
    const query = searchParams.get('q') || ''
    const loc = searchParams.get('location') || ''
    const rad = searchParams.get('radius')
    setSearchQuery(query)
    setLocation(loc)
    setInputQuery(query)
    setInputLocation(loc)
    if (rad) {
      setRadius(parseInt(rad))
    }
  }, [searchParams])

  // Manual search trigger function
  const triggerSearch = () => {
    setSearchQuery(inputQuery)
    setLocation(inputLocation)
    
    // Update URL with current search parameters
    const params = new URLSearchParams()
    if (inputQuery) params.append('q', inputQuery)
    if (inputLocation) params.append('location', inputLocation)
    if (inputLocation && radius) params.append('radius', radius.toString())
    
    router.push(`/search?${params.toString()}`)
  }

  // Handle Enter key press to trigger search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      triggerSearch()
    }
  }

  // Fetch location suggestions when user types
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (inputLocation.length < 2) {
        setLocationSuggestions([])
        setShowLocationSuggestions(false)
        return
      }

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputLocation)}&limit=5&addressdetails=1&countrycodes=us,ca,gb,au`)
        const data = await response.json()
        
        const suggestions = data.map((item: any) => {
          const address = item.address
          const city = address.city || address.town || address.village || address.hamlet
          const state = address.state || address.region
          const country = address.country
          
          if (city && state) {
            return `${city}, ${state}`
          } else if (city) {
            return `${city}, ${country}`
          } else {
            return item.display_name.split(',').slice(0, 2).join(',')
          }
        }).filter((suggestion: string, index: number, array: string[]) => 
          array.indexOf(suggestion) === index // Remove duplicates
        )
        
        setLocationSuggestions(suggestions)
        setShowLocationSuggestions(suggestions.length > 0)
      } catch (error) {
        console.error('Error fetching location suggestions:', error)
        setLocationSuggestions([])
        setShowLocationSuggestions(false)
      }
    }

    const delayedFetch = setTimeout(fetchLocationSuggestions, 300)
    return () => clearTimeout(delayedFetch)
  }, [inputLocation])

  const handleLocationSelect = (suggestion: string) => {
    setInputLocation(suggestion)
    setLocation(suggestion)
    setShowLocationSuggestions(false)
    // Trigger search when location is selected
    setTimeout(() => triggerSearch(), 100)
  }

  // Load user's saved jobs if authenticated
  useEffect(() => {
    if (session?.user) {
      loadSavedJobs()
    }
  }, [session])

  const loadSavedJobs = async () => {
    try {
      const response = await fetch('/api/user/saved-jobs?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const savedJobIds = new Set<string>()
        data.savedJobs.forEach((saved: any) => {
          if (saved.jobId) {
            savedJobIds.add(saved.jobId)
          }
        })
        setSavedJobs(savedJobIds)
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error)
    }
  }

  // Load user preferences if authenticated
  useEffect(() => {
    if (session?.user) {
      loadUserPreferences()
    }
  }, [session])

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        setUserPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Error loading user preferences:', error)
    }
  }

  const applyUserPreferences = () => {
    if (userPreferences) {
      setFilters(prev => ({
        ...prev,
        remote: userPreferences.preferredRemote || false,
        salaryMin: userPreferences.preferredSalaryMin?.toString() || '',
        salaryMax: userPreferences.preferredSalaryMax?.toString() || '',
        skills: userPreferences.skills || [],
        employmentTypes: userPreferences.preferredJobTypes || [],
        companySize: userPreferences.preferredCompanySize || [],
        schedule: userPreferences.preferredSchedule || []
      }))
      
      // Apply location from preferences if not already set
      if (!location && userPreferences.location) {
        setLocation(userPreferences.location)
      }
    }
  }

  const saveCurrentSearch = async () => {
    if (!session?.user) return
    
    try {
      const searchData = {
        query: searchQuery,
        location: location,
        filters: filters
      }
      
      const response = await fetch('/api/user/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchData)
      })
      
      if (response.ok) {
        // Show success message
        console.log('Search saved successfully!')
      }
    } catch (error) {
      console.error('Error saving search:', error)
    }
  }

  // Load jobs using the new search hook
  useEffect(() => {
    // Only search if we have actual search parameters (not just empty strings from initial state)
    if (!searchQuery && !location) {
      return
    }

    // Use the new search hook to load jobs
    searchJobs(searchQuery, location, radius)

    // Track search in history if user is authenticated and search has content
    if (session?.user && (searchQuery || location)) {
      trackSearch()
    }
  }, [searchQuery, location, radius, searchJobs, session])

  const trackSearch = async () => {
    try {
      await fetch('/api/user/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          location: location
        })
      })
    } catch (error) {
      console.error('Error tracking search:', error)
    }
  }

  // Apply filters and sorting
  useEffect(() => {
    let filtered = filterJobs(initialFilteredJobs, {
      remote: filters.remote || undefined,
      salaryMin: filters.salaryMin ? parseInt(filters.salaryMin) : undefined,
      salaryMax: filters.salaryMax ? parseInt(filters.salaryMax) : undefined,
      employmentTypes: filters.employmentTypes.length > 0 ? filters.employmentTypes : undefined,
      datePosted: filters.datePosted !== 'all' ? filters.datePosted : undefined,
      experience: filters.experience !== 'all' ? filters.experience : undefined
    })

    filtered = sortJobs(filtered, sortBy)
    setFilteredJobs(filtered)
  }, [initialFilteredJobs, filters, sortBy])

  const handleSaveJob = async (jobId: string) => {
    if (!session?.user) {
      setSaveMessage('Please sign in to save jobs')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    const isSaved = savedJobs.has(jobId)
    const job = jobs.find(j => j.job_id === jobId)

    if (!job) {
      setSaveMessage('Job not found')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      if (isSaved) {
        // Unsave job
        const response = await fetch(`/api/user/saved-jobs?jobId=${jobId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          const newSavedJobs = new Set(savedJobs)
          newSavedJobs.delete(jobId)
          setSavedJobs(newSavedJobs)
          setSaveMessage('Job removed from saved')
        } else {
          setSaveMessage('Error removing job')
        }
      } else {
        // Save job
        const response = await fetch('/api/user/saved-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: jobId,
            jobData: job,
          }),
        })

        if (response.ok) {
          const newSavedJobs = new Set(savedJobs)
          newSavedJobs.add(jobId)
          setSavedJobs(newSavedJobs)
          setSaveMessage('Job saved successfully!')
        } else {
          const errorData = await response.json()
          setSaveMessage(errorData.error || 'Error saving job')
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error)
      setSaveMessage('Error saving job')
    }

    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleApplyToJob = async (job: any) => {
    if (!session?.user) {
      setSaveMessage('Please sign in to apply to jobs')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      await applyToJob(job.job_id, job, job.job_apply_link)
      setSaveMessage('Application tracked successfully!')
      
      // Open the application link in a new tab
      if (job.job_apply_link) {
        window.open(job.job_apply_link, '_blank')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      setSaveMessage(error instanceof Error ? error.message : 'Error applying to job')
    }

    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleUpdateApplicationStatus = async (jobId: string, status: string) => {
    try {
      const application = applications.find(app => app.jobId === jobId)
      if (application) {
        await updateApplicationStatus(application.id, status as any)
        setSaveMessage('Application status updated!')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      setSaveMessage('Error updating application status')
    }

    setTimeout(() => setSaveMessage(''), 3000)
  }

  // Get application status for a job
  const getApplicationStatus = (jobId: string) => {
    const application = applications.find(app => app.jobId === jobId)
    return application?.status
  }

  const handleEmploymentTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      employmentTypes: checked 
        ? [...prev.employmentTypes, type]
        : prev.employmentTypes.filter(t => t !== type)
    }))
  }

  const clearFilters = () => {
    setFilters({
      remote: false,
      salaryMin: '',
      salaryMax: '',
      employmentTypes: [],
      datePosted: 'all',
      experience: 'all',
      skills: [],
      companySize: [],
      schedule: []
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-20">
        {/* Always render the search/filter UI here, including the search bar */}
        <div className="space-y-6 mb-8">
          {/* Title and Summary Section */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {searchQuery ? `Jobs for "${searchQuery}"` : (location ? `Jobs in ${capitalizeLocation(location)}` : 'Explore Job Opportunities')}
              {location && searchQuery && ` within ${radius} miles of ${capitalizeLocation(location)}`}
            </h1>
            {location && !searchQuery && (
              <p className="text-sm text-muted-foreground mt-1">
                within {radius} miles of {capitalizeLocation(location)}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <p className="text-muted-foreground text-sm">
                {filteredJobs.length} opportunities found
                {!searchQuery && !location && ' • Browse sample jobs or search for specific roles'}
                {session?.user && userPreferences && ' • Personalized for you'}
                {!session?.user && ' • Sign in for personalized results'}
                • Powered by UpDrift AI
                {cacheStats.size > 0 && ` • ${cacheStats.size} cached searches (24h)`}
                {isUserIdle && ' • Idle mode (API calls disabled)'}
              </p>
              {/* Cache management */}
              {cacheStats.size > 0 && (
                <button
                  onClick={clearCache}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                  title="Clear search cache"
                >
                  Clear Cache
                </button>
              )}
            </div>
          </div>
          
          {/* Search refinement bar (search bar UI) - always visible */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 sm:flex-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Refine search..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64 bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="relative flex-1 sm:flex-none">
              <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Location..."
                value={inputLocation}
                onChange={(e) => setInputLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowLocationSuggestions(locationSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                className="pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-48 bg-background text-foreground placeholder:text-muted-foreground"
              />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-muted focus:bg-muted text-sm text-foreground border-b border-muted last:border-b-0"
                    >
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground mr-2" />
                        {suggestion}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Radius Selector - always visible */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="pl-3 pr-8 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-background text-foreground w-full"
              >
                <option value={5}>Within 5 miles</option>
                <option value={10}>Within 10 miles</option>
                <option value={15}>Within 15 miles</option>
                <option value={25}>Within 25 miles</option>
                <option value={35}>Within 35 miles</option>
                <option value={50}>Within 50 miles</option>
                <option value={75}>Within 75 miles</option>
                <option value={100}>Within 100 miles</option>
              </select>
            </div>
            <button
              onClick={triggerSearch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            {saveMessage}
          </div>
        )}

        {/* Location Filtering Notification */}
        {locationFilterResults?.applied && location && locationFilterResults.filteredCount === 0 && locationFilterResults.originalCount > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  API Location Filtering Issue Detected
                </h3>
                <div className="mt-1 text-sm text-amber-700">
                  <p className="mb-2">
                    Found <strong>{locationFilterResults.originalCount} jobs</strong> from the API, but <strong>none actually match {capitalizeLocation(location)}</strong>. 
                    This suggests the job search API is not properly filtering by location.
                  </p>
                  <div className="flex space-x-4 mt-3">
                    <button
                      onClick={() => {
                        setFilteredJobs(jobs);
                      }}
                      className="text-amber-800 hover:text-amber-900 font-medium underline"
                    >
                      Show All {locationFilterResults.originalCount} Jobs
                    </button>
                    <button
                      onClick={() => {
                        const newLocation = '';
                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.delete('location');
                        window.history.pushState({}, '', newUrl.toString());
                        router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
                      }}
                      className="text-amber-800 hover:text-amber-900 font-medium underline"
                    >
                      Search Without Location
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-amber-600">
                    <strong>Tip:</strong> Consider upgrading to a better job search API like Adzuna for accurate location filtering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-sm border border-input p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              </div>

              {/* User Preferences Quick Apply */}
              {session?.user && userPreferences && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Your Preferences</span>
                  </div>
                  <button
                    onClick={applyUserPreferences}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    Apply My Preferences
                  </button>
                </div>
              )}

              {/* Save Search */}
              {session?.user && (
                <div className="mb-6">
                  <button
                    onClick={saveCurrentSearch}
                    className="w-full flex items-center justify-center space-x-2 bg-muted text-foreground px-3 py-2 rounded-md text-sm hover:bg-muted/80 transition-colors"
                  >
                    <BookmarkIcon className="h-4 w-4" />
                    <span>Save Search</span>
                  </button>
                </div>
              )}

              {/* Remote Work */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.remote}
                    onChange={(e) => setFilters(prev => ({ ...prev, remote: e.target.checked }))}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Remote only</span>
                </label>
              </div>

              {/* Salary Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Salary Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.salaryMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
                    className="px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.salaryMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, salaryMax: e.target.value }))}
                    className="px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Employment Type */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Employment Type</h4>
                <div className="space-y-2">
                  {['FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERNSHIP'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.employmentTypes.includes(type)}
                        onChange={(e) => handleEmploymentTypeChange(type, e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-muted-foreground capitalize">
                        {type.toLowerCase().replace('fulltime', 'Full-time').replace('parttime', 'Part-time')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Posted */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Date Posted</h4>
                <select
                  value={filters.datePosted}
                  onChange={(e) => setFilters(prev => ({ ...prev, datePosted: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="all">Any time</option>
                  <option value="day">Past 24 hours</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                </select>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Advanced Filters</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </button>

                {showAdvancedFilters && (
                  <div className="mt-4 space-y-6">
                    {/* Experience Level */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Experience Level</h4>
                      <select
                        value={filters.experience}
                        onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                        className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      >
                        <option value="all">Any level</option>
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>

                    {/* Company Size */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Company Size</h4>
                      <div className="space-y-2">
                        {['Startup (1-50)', 'Small (51-200)', 'Medium (201-1000)', 'Large (1001-5000)', 'Enterprise (5000+)'].map(size => (
                          <label key={size} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.companySize.includes(size)}
                              onChange={(e) => {
                                const newArray = e.target.checked
                                  ? [...filters.companySize, size]
                                  : filters.companySize.filter(s => s !== size)
                                setFilters(prev => ({ ...prev, companySize: newArray }))
                              }}
                              className="rounded border-input text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-muted-foreground">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Schedule Type */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Schedule</h4>
                      <div className="space-y-2">
                        {['Full-time', 'Part-time', 'Flexible', 'Remote', 'Hybrid', 'On-site'].map(schedule => (
                          <label key={schedule} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.schedule.includes(schedule)}
                              onChange={(e) => {
                                const newArray = e.target.checked
                                  ? [...filters.schedule, schedule]
                                  : filters.schedule.filter(s => s !== schedule)
                                setFilters(prev => ({ ...prev, schedule: newArray }))
                              }}
                              className="rounded border-input text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-muted-foreground">{schedule}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 mt-6 lg:mt-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-muted-foreground">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-1 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Most recent</option>
                    <option value="salary">Highest salary</option>
                    <option value="company">Company A-Z</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Job listings */}
            {filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {locationFilterResults?.applied && locationFilterResults.filteredCount === 0 && locationFilterResults.originalCount > 0
                      ? `No jobs found in ${capitalizeLocation(location)}`
                      : "No jobs found"
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {locationFilterResults?.applied && locationFilterResults.filteredCount === 0 && locationFilterResults.originalCount > 0
                      ? `We found ${locationFilterResults.originalCount} jobs for "${searchQuery}", but none were located in ${capitalizeLocation(location)}.`
                      : "Try adjusting your search criteria or filters"
                    }
                  </p>
                  
                  {locationFilterResults?.applied && locationFilterResults.filteredCount === 0 && locationFilterResults.originalCount > 0 && (
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => {
                          setFilteredJobs(jobs);
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Show All {locationFilterResults.originalCount} Jobs
                      </button>
                      <button
                        onClick={() => {
                          router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
                        }}
                        className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        Remove Location Filter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    isSaved={savedJobs.has(job.job_id)}
                    onSave={handleSaveJob}
                    onApply={handleApplyToJob}
                    applicationStatus={getApplicationStatus(job.job_id)}
                    onUpdateApplicationStatus={handleUpdateApplicationStatus}
                    showMatchScore={true}
                    className={viewMode === 'list' ? 'lg:flex lg:space-x-6' : ''}
                  />
                ))}
              </div>
            )}

            {/* Load more button */}
            {filteredJobs.length > 0 && (
              <div className="text-center mt-8">
                <button className="bg-card border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium">
                  Load more jobs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Setup Guide Modal */}
      <ApiSetupGuide
        isVisible={showApiGuide}
        onClose={() => setShowApiGuide(false)}
      />
    </div>
  )
}

// Suspense wrapper component
function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg shadow p-6">
                <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted/70 rounded w-3/4"></div>
                  <div className="h-4 bg-muted/70 rounded w-1/2"></div>
                  <div className="h-4 bg-muted/70 rounded w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg shadow p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted/70 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted/70 rounded w-full"></div>
                      <div className="h-4 bg-muted/70 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPageWithSuspense() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPage />
    </Suspense>
  )
}