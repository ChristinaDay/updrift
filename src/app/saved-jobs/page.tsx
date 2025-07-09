'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import JobCard from '@/components/JobCard'
import { 
  BookmarkIcon, 
  TrashIcon, 
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CalendarIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'

interface SavedJob {
  id: string
  jobId: string
  jobData: any
  notes: string | null
  savedAt: string
}

export default function SavedJobsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [filteredJobs, setFilteredJobs] = useState<SavedJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')
  const [message, setMessage] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'company'>('newest')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      loadSavedJobs()
    }
  }, [session])

  useEffect(() => {
    filterAndSortJobs()
  }, [savedJobs, searchQuery, sortBy])

  const loadSavedJobs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/saved-jobs')
      if (response.ok) {
        const data = await response.json()
        setSavedJobs(data.savedJobs || [])
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error)
      setMessage('Error loading saved jobs')
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortJobs = () => {
    let filtered = savedJobs

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(savedJob => 
        savedJob.jobData.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        savedJob.jobData.employer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (savedJob.notes && savedJob.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort jobs
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        case 'oldest':
          return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
        case 'title':
          return a.jobData.job_title.localeCompare(b.jobData.job_title)
        case 'company':
          return a.jobData.employer_name.localeCompare(b.jobData.employer_name)
        default:
          return 0
      }
    })

    setFilteredJobs(filtered)
  }

  const handleUnsaveJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/user/saved-jobs?jobId=${jobId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedJobs(prev => prev.filter(job => job.jobId !== jobId))
        setMessage('Job removed from saved')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error removing job')
      }
    } catch (error) {
      console.error('Error removing job:', error)
      setMessage('Error removing job')
    }
  }

  const handleUpdateNotes = async (savedJobId: string, notes: string) => {
    try {
      const response = await fetch(`/api/user/saved-jobs/${savedJobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        setSavedJobs(prev => prev.map(job => 
          job.id === savedJobId ? { ...job, notes } : job
        ))
        setEditingNotes(null)
        setNotesText('')
        setMessage('Notes updated successfully')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error updating notes')
      }
    } catch (error) {
      console.error('Error updating notes:', error)
      setMessage('Error updating notes')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedJobs.size === 0) return

    try {
      const deletePromises = Array.from(selectedJobs).map(savedJobId => {
        const savedJob = savedJobs.find(job => job.id === savedJobId)
        return savedJob ? fetch(`/api/user/saved-jobs?jobId=${savedJob.jobId}`, {
          method: 'DELETE',
        }) : Promise.resolve()
      })

      await Promise.all(deletePromises)
      
      setSavedJobs(prev => prev.filter(job => !selectedJobs.has(job.id)))
      setSelectedJobs(new Set())
      setShowBulkActions(false)
      setMessage(`${selectedJobs.size} jobs removed from saved`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error bulk deleting jobs:', error)
      setMessage('Error deleting jobs')
    }
  }

  const toggleJobSelection = (savedJobId: string) => {
    const newSelection = new Set(selectedJobs)
    if (newSelection.has(savedJobId)) {
      newSelection.delete(savedJobId)
    } else {
      newSelection.add(savedJobId)
    }
    setSelectedJobs(newSelection)
    setShowBulkActions(newSelection.size > 0)
  }

  const selectAllJobs = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedJobs(new Set(filteredJobs.map(job => job.id)))
      setShowBulkActions(true)
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Updrift
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/search" className="text-gray-600 hover:text-blue-600">
                  Search Jobs
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/saved-jobs" className="text-blue-600 font-medium">
                  Saved Jobs
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {session.user.name || session.user.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookmarkSolidIcon className="h-8 w-8 text-blue-600 mr-3" />
            Saved Jobs ({savedJobs.length})
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your saved job opportunities and track your applications
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Job Title</option>
                  <option value="company">Company</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {savedJobs.length > 0 && (
                <button
                  onClick={selectAllJobs}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  {selectedJobs.size === filteredJobs.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Job List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {savedJobs.length === 0 ? 'No saved jobs yet' : 'No jobs match your search'}
            </h3>
            <p className="text-gray-600 mb-4">
              {savedJobs.length === 0 
                ? 'Start saving interesting job opportunities to keep track of them'
                : 'Try adjusting your search terms'
              }
            </p>
            {savedJobs.length === 0 && (
              <Link
                href="/search"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map(savedJob => (
              <div key={savedJob.id} className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedJobs.has(savedJob.id)}
                    onChange={() => toggleJobSelection(savedJob.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                {/* Job Card */}
                <div className="ml-8">
                  <JobCard
                    job={savedJob.jobData}
                    isSaved={true}
                    onSave={() => handleUnsaveJob(savedJob.jobId)}
                    showMatchScore={true}
                  />
                </div>

                {/* Notes Section */}
                <div className="ml-8 mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                    <button
                      onClick={() => {
                        setEditingNotes(savedJob.id)
                        setNotesText(savedJob.notes || '')
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {editingNotes === savedJob.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Add your notes about this job..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateNotes(savedJob.id, notesText)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(null)
                            setNotesText('')
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {savedJob.notes || 'No notes added yet. Click the edit icon to add notes.'}
                    </p>
                  )}

                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Saved {new Date(savedJob.savedAt).toLocaleDateString()} at{' '}
                    {new Date(savedJob.savedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 