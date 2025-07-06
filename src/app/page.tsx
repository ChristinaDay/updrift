'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { MagnifyingGlassIcon, MapPinIcon, BriefcaseIcon, ChartBarIcon, SparklesIcon, RocketLaunchIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [radius, setRadius] = useState(25) // Default 25 mile radius
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (location) params.append('location', location)
    if (location && radius) params.append('radius', radius.toString())
    
    router.push(`/search?${params.toString()}`)
  }

  // Fetch location suggestions when user types
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (location.length < 2) {
        setLocationSuggestions([])
        setShowLocationSuggestions(false)
        return
      }

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5&addressdetails=1&countrycodes=us,ca,gb,au`)
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
  }, [location])

  const handleLocationSelect = (suggestion: string) => {
    setLocation(suggestion)
    setShowLocationSuggestions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const features = [
    {
      icon: <SparklesIcon className="h-8 w-8 text-blue-600" />,
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms analyze your skills and experience to find perfect job matches'
    },
    {
      icon: <ChartBarIcon className="h-8 w-8 text-green-600" />,
      title: 'Multi-Platform Aggregation',
      description: 'Search across LinkedIn, Indeed, Glassdoor, and 50+ job boards simultaneously'
    },
    {
      icon: <BriefcaseIcon className="h-8 w-8 text-purple-600" />,
      title: 'Application Tracking',
      description: 'Never lose track of your applications with our intelligent tracking system'
    },
    {
      icon: <RocketLaunchIcon className="h-8 w-8 text-orange-600" />,
      title: 'Smart Notifications',
      description: 'Get notified about new opportunities that match your criteria instantly'
    }
  ]

  const stats = [
    { label: 'Job Listings', value: '2M+', description: 'Fresh opportunities daily' },
    { label: 'Companies', value: '50K+', description: 'From startups to Fortune 500' },
    { label: 'Success Rate', value: '85%', description: 'Users find jobs faster' },
    { label: 'Platforms', value: '50+', description: 'All major job boards' }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold gradient-text">UpFetch</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {status === 'loading' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : session ? (
                <>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {session.user.name?.split(' ')[0] || 'User'}
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => signIn()}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </button>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Job Search</span>
              <span className="block gradient-text">Beyond LinkedIn</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover your next career opportunity with our AI-powered job search platform. 
              We aggregate opportunities from 50+ job boards and use intelligent matching to find your perfect role.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-10 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 gap-4">
                {/* Main search row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Location or remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setShowLocationSuggestions(locationSuggestions.length > 0)}
                      onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                    />
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {locationSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleLocationSelect(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                              {suggestion}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSearch}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105"
                  >
                    Search Jobs
                  </button>
                </div>
                
                {/* Radius selector row - only show when location is entered */}
                {location && (
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>within</span>
                      <select
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-700"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={35}>35</option>
                        <option value={50}>50</option>
                        <option value={75}>75</option>
                        <option value={100}>100</option>
                      </select>
                      <span>miles of {location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">{stat.label}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why UpFetch Beats LinkedIn
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Experience the future of job searching with features that actually work for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Find Your Dream Job?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of professionals who've upgraded their job search experience
          </p>
          <div className="mt-8">
            {session ? (
              <Link
                href="/dashboard"
                className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 transform hover:scale-105 inline-block"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signup"
                className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 transform hover:scale-105 inline-block"
              >
                Start Searching Now
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">UpFetch</h3>
              <p className="text-gray-400">
                The intelligent job search platform that outperforms traditional job boards.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Job Search</a></li>
                <li><a href="#" className="hover:text-white">Company Insights</a></li>
                <li><a href="#" className="hover:text-white">Salary Data</a></li>
                <li><a href="#" className="hover:text-white">Career Advice</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 UpFetch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 