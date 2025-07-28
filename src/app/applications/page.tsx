'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  BriefcaseIcon, 
  TrashIcon, 
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CalendarIcon,
  CheckIcon,
  EyeIcon,
  ClockIcon,
  XCircleIcon,
  TrophyIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon,
  EyeIcon as EyeSolidIcon,
  ClockIcon as ClockSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  TrophyIcon as TrophySolidIcon
} from '@heroicons/react/24/solid'
import Header from '@/components/Header'
import { useJobTracker } from '@/lib/useJobApplications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface ApplicationStats {
  total: number
  applied: number
  viewed: number
  interviewing: number
  rejected: number
  hired: number
}

export default function JobTrackerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [editingApplication, setEditingApplication] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')
  const [newStatus, setNewStatus] = useState<string>('APPLIED')
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [applyJobData, setApplyJobData] = useState<any>(null)

  const {
    applications,
    loading,
    error,
    applicationStatus,
    totalApplications,
    applyToJob,
    updateApplicationStatus,
    deleteApplication,
    refreshApplications
  } = useJobTracker(selectedStatus === 'all' ? undefined : selectedStatus)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Calculate stats
  const stats: ApplicationStats = {
    total: totalApplications,
    applied: applicationStatus.APPLIED,
    viewed: applicationStatus.VIEWED,
    interviewing: applicationStatus.INTERVIEWING,
    rejected: applicationStatus.REJECTED,
    hired: applicationStatus.HIRED
  }

  // Filter applications by search query
  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      app.jobData?.job_title?.toLowerCase().includes(query) ||
      app.jobData?.employer_name?.toLowerCase().includes(query) ||
      app.notes?.toLowerCase().includes(query)
    )
  })

  const handleUpdateStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      await updateApplicationStatus(applicationId, status as any, notes)
      setEditingApplication(null)
      setNotesText('')
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(applicationId)
      } catch (error) {
        console.error('Error deleting application:', error)
      }
    }
  }

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedApplications.size} applications?`)) {
      try {
        await Promise.all(Array.from(selectedApplications).map(id => deleteApplication(id)))
        setSelectedApplications(new Set())
        setShowBulkActions(false)
      } catch (error) {
        console.error('Error bulk deleting applications:', error)
      }
    }
  }

  const toggleApplicationSelection = (applicationId: string) => {
    const newSelected = new Set(selectedApplications)
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId)
    } else {
      newSelected.add(applicationId)
    }
    setSelectedApplications(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const selectAllApplications = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedApplications(new Set(filteredApplications.map(app => app.id)))
      setShowBulkActions(true)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return <CheckCircleIcon className="w-4 h-4 text-blue-600" />
      case 'VIEWED':
        return <EyeSolidIcon className="w-4 h-4 text-yellow-600" />
      case 'INTERVIEWING':
        return <ClockSolidIcon className="w-4 h-4 text-purple-600" />
      case 'REJECTED':
        return <XCircleSolidIcon className="w-4 h-4 text-red-600" />
      case 'HIRED':
        return <TrophySolidIcon className="w-4 h-4 text-green-600" />
      default:
        return <CheckCircleIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-100 text-blue-800'
      case 'VIEWED':
        return 'bg-yellow-100 text-yellow-800'
      case 'INTERVIEWING':
        return 'bg-purple-100 text-purple-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'HIRED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Job Tracker</h1>
            <p className="text-muted-foreground">
              Track jobs you're interested in and your application progress
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <UserIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/saved-jobs">
                <BriefcaseIcon className="w-4 h-4 mr-2" />
                Saved Jobs
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <ChartBarIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applied</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.applied}</p>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Viewed</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.viewed}</p>
                </div>
                <EyeIcon className="w-5 h-5 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interviewing</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.interviewing}</p>
                </div>
                <ClockIcon className="w-5 h-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircleIcon className="w-5 h-5 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hired</p>
                  <p className="text-2xl font-bold text-green-600">{stats.hired}</p>
                </div>
                <TrophyIcon className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="APPLIED">Applied</SelectItem>
              <SelectItem value="VIEWED">Viewed</SelectItem>
              <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="HIRED">Hired</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshApplications} disabled={loading}>
            <CheckIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center justify-between bg-muted p-4 rounded-lg mb-6">
            <span className="text-sm text-muted-foreground">
              {selectedApplications.size} application(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllApplications}>
                {selectedApplications.size === filteredApplications.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshApplications}>Try Again</Button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <BriefcaseIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No applications found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start applying to jobs to track your applications here'
              }
            </p>
            {!searchQuery && selectedStatus === 'all' && (
              <Button asChild>
                <Link href="/search">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Search Jobs
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedApplications.has(application.id)}
                        onChange={() => toggleApplicationSelection(application.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(application.status)}
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Applied {formatDate(application.appliedAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {application.jobData?.job_title}
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          {application.jobData?.employer_name}
                        </p>
                        {application.notes && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Notes: {application.notes}
                          </p>
                        )}
                        {application.applicationUrl && (
                          <a
                            href={application.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Application →
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingApplication(application.id)
                              setNotesText(application.notes || '')
                              setNewStatus(application.status)
                            }}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Application</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="APPLIED">Applied</SelectItem>
                                  <SelectItem value="VIEWED">Viewed</SelectItem>
                                  <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
                                  <SelectItem value="REJECTED">Rejected</SelectItem>
                                  <SelectItem value="HIRED">Hired</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Notes</label>
                              <Textarea
                                value={notesText}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotesText(e.target.value)}
                                placeholder="Add notes about this application..."
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleUpdateStatus(application.id, newStatus, notesText)}
                                className="flex-1"
                              >
                                Update
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingApplication(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteApplication(application.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 