'use client'

import { Job } from '@/types/job'
import { 
  formatSalaryRange, 
  formatJobPostedDate, 
  formatJobLocation, 
  formatEmploymentType,
  truncateDescription,
  extractSkills,
  calculateJobMatchScore,
  getCompanyLogoUrl,
  capitalizeLocation
} from '@/utils/jobUtils'
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  ComputerDesktopIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface JobCardProps {
  job: Job
  isSaved?: boolean
  onSave?: (jobId: string) => void
  onApply?: (job: Job) => void
  showMatchScore?: boolean
  className?: string
}

export default function JobCard({ 
  job, 
  isSaved = false, 
  onSave, 
  onApply,
  showMatchScore = true,
  className = '' 
}: JobCardProps) {
  const [imageError, setImageError] = useState(false)
  
  const skills = extractSkills(job)
  const matchScore = calculateJobMatchScore(job)
  const companyLogoUrl = job.employer_logo || getCompanyLogoUrl(job.employer_name, job.employer_website)

  const handleSave = () => {
    if (onSave) {
      onSave(job.job_id)
    }
  }

  const handleApply = () => {
    if (onApply) {
      onApply(job)
    } else {
      window.open(job.job_apply_link, '_blank')
    }
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Company Logo */}
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {!imageError ? (
                <Image
                  src={companyLogoUrl}
                  alt={`${job.employer_name} logo`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <BriefcaseIcon className="w-6 h-6 text-muted-foreground" />
              )}
            </div>

            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
                {job.job_title}
              </h3>
              <p className="text-muted-foreground font-medium mb-2">
                {job.employer_name}
              </p>
              
              {/* Job Meta */}
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span className="font-medium">
                    {job.job_city && job.job_state ? capitalizeLocation(`${job.job_city}, ${job.job_state}`) : 
                     job.job_city ? capitalizeLocation(job.job_city) : 
                     job.job_country || 'Location not specified'}
                  </span>
                </div>
                {job.job_employment_type && (
                  <div className="flex items-center space-x-1">
                    <BriefcaseIcon className="h-4 w-4" />
                    <span>{job.job_employment_type}</span>
                  </div>
                )}
                {job.job_is_remote && (
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    <ComputerDesktopIcon className="h-3 w-3 mr-1" />
                    Remote
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2 flex-shrink-0 ml-4">
            {showMatchScore && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 font-medium px-2 py-1 text-xs sm:text-sm flex items-center dark:bg-green-600 dark:text-white dark:border-green-500 dark:shadow-md">
                <SparklesIcon className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[80px] sm:max-w-none">{matchScore}% match</span>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="text-muted-foreground hover:text-primary p-2"
            >
              {isSaved ? (
                <BookmarkSolidIcon className="w-5 h-5 text-primary" />
              ) : (
                <BookmarkIcon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Salary */}
        {(job.job_min_salary || job.job_max_salary) && (
          <div className="flex items-center mb-3">
            <CurrencyDollarIcon className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-700 font-semibold">
              {formatSalaryRange(job.job_min_salary, job.job_max_salary, job.job_salary_currency, job.job_salary_period)}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {truncateDescription(job.job_description, 200)}
        </p>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20 dark:bg-accent/20 dark:text-accent-foreground dark:border-accent/30">
                  {skill}
                </Badge>
              ))}
              {skills.length > 6 && (
                <Badge variant="outline" className="text-muted-foreground">
                  +{skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Benefits */}
        {job.job_benefits && job.job_benefits.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {job.job_benefits.slice(0, 3).map((benefit, index) => (
                <Badge key={index} variant="secondary" className="bg-success/10 text-success-foreground border-success/20 dark:bg-success/20 dark:text-success-foreground dark:border-success/30">
                  {benefit}
                </Badge>
              ))}
              {job.job_benefits.length > 3 && (
                <Badge variant="outline" className="text-muted-foreground">
                  +{job.job_benefits.length - 3} benefits
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatJobPostedDate(job.job_posted_at_datetime_utc)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              via {job.job_publisher}
            </span>
          </div>
          
          <Button onClick={handleApply} className="flex items-center">
            Apply Now
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 