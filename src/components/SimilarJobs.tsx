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
          word.length > 2 && !['the', 'and', 'or', 'for', 'with', 'in', 'at', 'to', 'of', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being'].includes(word)
        )
        
        // Use first 2-3 meaningful words from title, or fallback to full title if too short
        const searchQuery = titleWords.length >= 2 
          ? titleWords.slice(0, 3).join(' ')
          : jobTitle.toLowerCase().split(' ').slice(0, 2).join(' ')
        
        if (!searchQuery) {
          setLoading(false)
          return
        }

        // Try multiple search strategies for better results
        const searchStrategies = [
          // Strategy 1: Use extracted keywords with location
          { query: searchQuery, location },
          // Strategy 2: Use just the main keywords without location (broader search)
          { query: searchQuery, location: '' },
          // Strategy 3: Use just the first meaningful word (very broad)
          { query: titleWords[0] || searchQuery, location: '' }
        ]

        let allJobs: Job[] = []
        
        // Try each strategy until we get enough results
        for (const strategy of searchStrategies) {
          if (allJobs.length >= maxJobs * 2) break // Stop if we have enough candidates
          
          try {
            const response = await fetch(`/api/jobs/search?query=${encodeURIComponent(strategy.query)}&location=${encodeURIComponent(strategy.location)}&num_pages=1`)
            const data = await response.json()

            if (data.status === 'success' && data.jobs) {
              const newJobs = data.jobs.filter((job: Job) => 
                job.job_id !== currentJob.job_id && 
                !allJobs.some(existingJob => existingJob.job_id === job.job_id)
              )
              allJobs = [...allJobs, ...newJobs]
            }
          } catch (err) {
            console.error('Error with search strategy:', err)
          }
        }

        // Sort by relevance (jobs with same location first, then by title similarity)
        const sortedJobs = allJobs.sort((a, b) => {
          // Prioritize jobs in the same location
          const aSameLocation = (a.job_city === currentJob.job_city) || (a.job_country === currentJob.job_country)
          const bSameLocation = (b.job_city === currentJob.job_city) || (b.job_country === currentJob.job_country)
          
          if (aSameLocation && !bSameLocation) return -1
          if (!aSameLocation && bSameLocation) return 1
          
          // Then sort by title similarity (simple word overlap)
          const currentWords = new Set(currentJob.job_title.toLowerCase().split(' '))
          const aWords = new Set(a.job_title.toLowerCase().split(' '))
          const bWords = new Set(b.job_title.toLowerCase().split(' '))
          
          const aOverlap = [...currentWords].filter(word => aWords.has(word)).length
          const bOverlap = [...currentWords].filter(word => bWords.has(word)).length
          
          return bOverlap - aOverlap
        })

        setSimilarJobs(sortedJobs.slice(0, maxJobs))
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
          
          {/* View All Similar Jobs Button */}
          {similarJobs.length > 0 && (
            <div className="pt-2">
              <Link
                href={`/search?query=${encodeURIComponent(currentJob.job_title)}&location=${encodeURIComponent(currentJob.job_city || currentJob.job_country || '')}`}
                className="block"
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  View All Similar Jobs
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 