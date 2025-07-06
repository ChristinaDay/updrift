'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  UserIcon, 
  CogIcon, 
  BellIcon, 
  BookmarkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import ThemeToggle from '@/components/ThemeToggle'

interface UserPreferences {
  location: string
  preferredRemote: boolean
  preferredSalaryMin: number
  preferredSalaryMax: number
  skills: string[]
  experienceLevel: string
  jobAlerts: boolean
  emailNotifications: boolean
  preferredJobTypes: string[]
  preferredCompanySize: string[]
  preferredSchedule: string[]
}

const experienceLevels = [
  'Entry Level (0-2 years)',
  'Mid Level (2-5 years)',
  'Senior Level (5-10 years)',
  'Lead/Principal (10+ years)',
  'Executive'
]

const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
  'Temporary'
]

const companySizes = [
  'Startup (1-50)',
  'Small (51-200)',
  'Medium (201-1000)',
  'Large (1001-5000)',
  'Enterprise (5000+)'
]

const scheduleTypes = [
  'Full-time',
  'Part-time',
  'Flexible',
  'Remote',
  'Hybrid',
  'On-site'
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [preferences, setPreferences] = useState<UserPreferences>({
    location: '',
    preferredRemote: false,
    preferredSalaryMin: 0,
    preferredSalaryMax: 0,
    skills: [],
    experienceLevel: '',
    jobAlerts: true,
    emailNotifications: true,
    preferredJobTypes: [],
    preferredCompanySize: [],
    preferredSchedule: []
  })

  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadUserPreferences()
    }
  }, [session])

  const loadUserPreferences = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          setPreferences(data.preferences)
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        setMessage('Preferences saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error saving preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      setMessage('Error saving preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !preferences.skills.includes(newSkill.trim())) {
      setPreferences(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setPreferences(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleArrayToggle = (array: string[], value: string, key: keyof UserPreferences) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value]
    
    setPreferences(prev => ({
      ...prev,
      [key]: newArray
    }))
  }

  if (status === 'loading' || isLoading) {
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
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-primary">
                UpFetch
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/search" className="text-muted-foreground hover:text-primary">
                  Search Jobs
                </Link>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/saved-jobs" className="text-muted-foreground hover:text-primary">
                  Saved Jobs
                </Link>
                <Link href="/profile" className="text-primary font-medium">
                  Profile
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {session.user.name || session.user.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile & Preferences</h1>
          <p className="text-muted-foreground mt-2">
            Customize your job search experience and set your preferences
          </p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* Location & Remote Preferences */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPinIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-card-foreground">Location Preferences</h3>
            </div>
            
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    value={preferences.location}
                    onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    placeholder="e.g., San Francisco, CA or Remote"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remote"
                    checked={preferences.preferredRemote}
                    onChange={(e) => setPreferences(prev => ({ ...prev, preferredRemote: e.target.checked }))}
                    className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
                  />
                  <label htmlFor="remote" className="text-sm text-card-foreground">
                    Open to remote work
                  </label>
                </div>
              </div>
          </div>

          {/* Salary Preferences */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CurrencyDollarIcon className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold text-card-foreground">Salary Preferences</h3>
            </div>
            
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Minimum Salary (Annual)
                  </label>
                  <input
                    type="number"
                    value={preferences.preferredSalaryMin || ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, preferredSalaryMin: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    placeholder="e.g., 80000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Maximum Salary (Annual)
                  </label>
                  <input
                    type="number"
                    value={preferences.preferredSalaryMax || ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, preferredSalaryMax: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    placeholder="e.g., 150000"
                  />
                </div>
              </div>
          </div>

          {/* Experience Level */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AcademicCapIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Experience Level</h3>
            </div>
            
            <select
              value={preferences.experienceLevel}
              onChange={(e) => setPreferences(prev => ({ ...prev, experienceLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select experience level</option>
              {experienceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CogIcon className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
            </div>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a skill (e.g., JavaScript, Python, React)"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {preferences.skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Job Type Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Job Type Preferences</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {jobTypes.map(type => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.preferredJobTypes.includes(type)}
                    onChange={() => handleArrayToggle(preferences.preferredJobTypes, type, 'preferredJobTypes')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Company Size Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BriefcaseIcon className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Company Size Preferences</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {companySizes.map(size => (
                <label key={size} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.preferredCompanySize.includes(size)}
                    onChange={() => handleArrayToggle(preferences.preferredCompanySize, size, 'preferredCompanySize')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Schedule Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ClockIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Schedule Preferences</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {scheduleTypes.map(schedule => (
                <label key={schedule} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.preferredSchedule.includes(schedule)}
                    onChange={() => handleArrayToggle(preferences.preferredSchedule, schedule, 'preferredSchedule')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{schedule}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BellIcon className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.jobAlerts}
                  onChange={(e) => setPreferences(prev => ({ ...prev, jobAlerts: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Enable job alerts for matching positions</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Receive email notifications</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
} 