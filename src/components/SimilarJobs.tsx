'use client'

import { useState, useEffect } from 'react'
import { Job } from '@/types/job'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { formatSalaryRange, formatJobLocation, formatJobPostedDate, getCompanyLogoUrl } from '@/utils/jobUtils'
import Link from 'next/link'

interface SimilarJobsProps {
  currentJob: Job
  maxJobs?: number
}

export default function SimilarJobs({ currentJob, maxJobs = 4 }: SimilarJobsProps) {
  const [similarJobs, setSimilarJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      try {
        setLoading(true)
        
        // Extract key terms from current job for similar search
        const jobTitle = currentJob.job_title
        const location = currentJob.job_city || currentJob.job_country || ''
        
        // Create search query based on job title keywords
        const titleWords = jobTitle.toLowerCase().split(' ').filter(word => 
          word.length > 2 && !['the', 'and', 'or', 'for', 'with', 'in', 'at', 'to', 'of', 'a', 'an'].includes(word)
        )
        
        // Use first 2-3 meaningful words from title
        const searchQuery = titleWords.slice(0, 3).join(' ')
        
        if (!searchQuery) {
          setLoading(false)
          return
        }

        const response = await fetch(`/api/jobs/search?query=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}&num_pages=1`)
        const data = await response.json()

        if (data.status === 'success' && data.jobs) {
          // Filter out the current job and limit results
          const filteredJobs = data.jobs
            .filter((job: Job) => job.job_id !== currentJob.job_id)
            .slice(0, maxJobs)
          
          setSimilarJobs(filteredJobs)
        } else {
          setError('Failed to load similar jobs')
        }
      } catch (err) {
        console.error('Error fetching similar jobs:', err)
        setError('Failed to load similar jobs')
      } finally {
        setLoading(false)
      }
    }

    if (currentJob) {
      fetchSimilarJobs()
    }
  }, [currentJob, maxJobs])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Similar Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: maxJobs }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || similarJobs.length === 0) {
    return null // Don't show anything if no similar jobs found
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {similarJobs.map((job) => {
            const generatedLogoUrl = getCompanyLogoUrl(job.employer_name, job.employer_website)
            
            return (
              <Link
                key={job.job_id}
                href={`/jobs/${job.job_publisher.toLowerCase()}-${job.job_id}`}
                className="block group"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Company Logo */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {generatedLogoUrl ? (
                      <img 
                        src={generatedLogoUrl} 
                        alt={job.employer_name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <BuildingOfficeIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {job.job_title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {job.employer_name}
                    </p>
                    
                    {/* Job Details */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        <span className="truncate">{formatJobLocation(job)}</span>
                      </div>
                      
                      {job.job_min_salary && job.job_max_salary && (
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="w-3 h-3" />
                          <span>{formatSalaryRange(job.job_min_salary, job.job_max_salary, job.job_salary_currency)}</span>
                        </div>
                      )}
                    </div>

                    {/* Posted Date */}
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatJobPostedDate(job.job_posted_at_timestamp.toString())}</span>
                    </div>
                  </div>

                  {/* View Button */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    View
                  </Button>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 