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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
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
              <BriefcaseIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {job.job_title}
            </h3>
            <p className="text-gray-600 font-medium mb-2">
              {job.employer_name}
            </p>
            
            {/* Job Meta */}
            <div className="flex items-center space-x-3 text-sm text-gray-600">
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
                <div className="flex items-center space-x-1">
                  <ComputerDesktopIcon className="h-4 w-4" />
                  <span className="text-green-600 font-medium">Remote</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {showMatchScore && (
            <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
              <SparklesIcon className="w-4 h-4 mr-1" />
              {matchScore}% match
            </div>
          )}
          
          <button
            onClick={handleSave}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title={isSaved ? 'Remove from saved' : 'Save job'}
          >
            {isSaved ? (
              <BookmarkSolidIcon className="w-5 h-5 text-blue-600" />
            ) : (
              <BookmarkIcon className="w-5 h-5" />
            )}
          </button>
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
      <p className="text-gray-600 mb-4 line-clamp-3">
        {truncateDescription(job.job_description, 200)}
      </p>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Benefits */}
      {job.job_benefits && job.job_benefits.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.job_benefits.slice(0, 3).map((benefit, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"
              >
                {benefit}
              </span>
            ))}
            {job.job_benefits.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">
                +{job.job_benefits.length - 3} benefits
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">
              {formatJobPostedDate(job.job_posted_at_datetime_utc)}
            </span>
          </div>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            via {job.job_publisher}
          </span>
        </div>
        
        <button
          onClick={handleApply}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Apply Now
          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  )
} 