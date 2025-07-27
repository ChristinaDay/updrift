import { Job } from '@/types/job';
import { formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format salary range for display
 */
export function formatSalaryRange(
  minSalary?: number,
  maxSalary?: number,
  currency = 'USD',
  period = 'YEAR'
): string {
  if (!minSalary && !maxSalary) {
    return 'Salary not disclosed';
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const periodText = period === 'YEAR' ? '/year' : period === 'HOUR' ? '/hour' : '';

  if (minSalary && maxSalary) {
    return `${formatNumber(minSalary)} - ${formatNumber(maxSalary)}${periodText}`;
  } else if (minSalary) {
    return `From ${formatNumber(minSalary)}${periodText}`;
  } else if (maxSalary) {
    return `Up to ${formatNumber(maxSalary)}${periodText}`;
  }

  return 'Salary not disclosed';
}

/**
 * Format job posting date
 */
export function formatJobPostedDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Recently posted';
  }
}

/**
 * Get job location display string
 */
export function formatJobLocation(job: Job): string {
  if (job.job_is_remote) {
    return 'Remote';
  }

  const parts = [];
  if (job.job_city) parts.push(job.job_city);
  if (job.job_state) parts.push(job.job_state);
  if (job.job_country && job.job_country !== 'US') parts.push(job.job_country);

  return parts.join(', ') || 'Location not specified';
}

/**
 * Extract company domain from email or website
 */
export function getCompanyDomain(website?: string, email?: string): string | null {
  if (website) {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }

  if (email) {
    const domain = email.split('@')[1];
    return domain || null;
  }

  return null;
}

/**
 * Generate company logo URL using Clearbit API
 * Returns null if no domain is available (no fallback)
 */
export function getCompanyLogoUrl(companyName: string, website?: string): string | null {
  const domain = getCompanyDomain(website);
  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }

  // No fallback - return null if no domain available
  return null;
}

/**
 * Get employment type display text
 */
export function formatEmploymentType(type: string): string {
  const typeMap: Record<string, string> = {
    FULLTIME: 'Full-time',
    PARTTIME: 'Part-time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    TEMPORARY: 'Temporary',
    VOLUNTEER: 'Volunteer',
  };

  return typeMap[type.toUpperCase()] || type;
}

/**
 * Truncate job description for preview
 */
export function truncateDescription(description: string, maxLength = 200): string {
  if (description.length <= maxLength) {
    return description;
  }

  return description.slice(0, maxLength).trim() + '...';
}

/**
 * Extract skills from job description and requirements
 */
export function extractSkills(job: Job): string[] {
  const skills = new Set<string>();

  // Add required skills if available
  if (job.job_required_skills) {
    job.job_required_skills.forEach(skill => skills.add(skill));
  }

  // Common tech skills to look for in description
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Angular', 'Vue',
    'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure',
    'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL', 'HTML', 'CSS',
    'Sass', 'TailwindCSS', 'Bootstrap', 'Figma', 'Sketch', 'Adobe',
    'Agile', 'Scrum', 'CI/CD', 'DevOps', 'Machine Learning', 'AI',
    'Data Science', 'Analytics', 'Tableau', 'Power BI', 'Excel',
  ];

  const description = job.job_description.toLowerCase();
  const qualifications = job.job_highlights?.Qualifications?.join(' ').toLowerCase() || '';
  const responsibilities = job.job_highlights?.Responsibilities?.join(' ').toLowerCase() || '';

  const fullText = `${description} ${qualifications} ${responsibilities}`;

  commonSkills.forEach(skill => {
    if (fullText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  return Array.from(skills).slice(0, 8); // Limit to 8 skills
}

/**
 * Calculate job match score (mock implementation)
 */
export function calculateJobMatchScore(job: Job, userSkills: string[] = []): number {
  let score = 50; // Base score

  // Boost for remote jobs (popular preference)
  if (job.job_is_remote) score += 10;

  // Boost for jobs with salary information
  if (job.job_min_salary || job.job_max_salary) score += 10;

  // Boost for direct application
  if (job.job_apply_is_direct) score += 5;

  // Boost for recent postings
  const daysOld = (Date.now() - job.job_posted_at_timestamp) / (1000 * 60 * 60 * 24);
  if (daysOld < 7) score += 15;
  else if (daysOld < 30) score += 10;

  // Match user skills
  if (userSkills.length > 0) {
    const jobSkills = extractSkills(job);
    const matchingSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    score += Math.min(matchingSkills.length * 5, 25); // Up to 25 points for skills
  }

  return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
}

/**
 * Filter jobs by criteria
 */
export function filterJobs(jobs: Job[], filters: {
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  employmentTypes?: string[];
  experience?: string;
  datePosted?: string;
}): Job[] {
  return jobs.filter(job => {
    // Remote filter
    if (filters.remote !== undefined && job.job_is_remote !== filters.remote) {
      return false;
    }

    // Salary filters
    if (filters.salaryMin && job.job_max_salary && job.job_max_salary < filters.salaryMin) {
      return false;
    }
    if (filters.salaryMax && job.job_min_salary && job.job_min_salary > filters.salaryMax) {
      return false;
    }

    // Employment type filter
    if (filters.employmentTypes?.length && 
        !filters.employmentTypes.includes(job.job_employment_type)) {
      return false;
    }

    // Date posted filter
    if (filters.datePosted) {
      const daysOld = (Date.now() - job.job_posted_at_timestamp) / (1000 * 60 * 60 * 24);
      const maxDays = filters.datePosted === 'day' ? 1 :
                      filters.datePosted === 'week' ? 7 :
                      filters.datePosted === 'month' ? 30 : 365;
      
      if (daysOld > maxDays) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort jobs by criteria
 */
export function sortJobs(jobs: Job[], sortBy: 'relevance' | 'date' | 'salary' | 'company'): Job[] {
  const sorted = [...jobs];

  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => b.job_posted_at_timestamp - a.job_posted_at_timestamp);
    
    case 'salary':
      return sorted.sort((a, b) => {
        const salaryA = a.job_max_salary || a.job_min_salary || 0;
        const salaryB = b.job_max_salary || b.job_min_salary || 0;
        return salaryB - salaryA;
      });
    
    case 'company':
      return sorted.sort((a, b) => a.employer_name.localeCompare(b.employer_name));
    
    case 'relevance':
    default:
      return sorted.sort((a, b) => calculateJobMatchScore(b) - calculateJobMatchScore(a));
  }
}

/**
 * Capitalize location names properly (Title Case)
 * Handles various location formats like "san francisco", "san francisco, ca", etc.
 */
export function capitalizeLocation(location: string): string {
  if (!location || typeof location !== 'string') return location;
  
  return location
    .split(',')
    .map(part => 
      part.trim()
        .split(' ')
        .map(word => {
          // Handle special cases for common words
          const lowercaseWord = word.toLowerCase();
          
          // Don't capitalize certain prepositions/articles in the middle
          if (lowercaseWord === 'of' || lowercaseWord === 'the' || lowercaseWord === 'and') {
            return lowercaseWord;
          }
          
          // Capitalize first letter, keep rest as lowercase
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ')
    )
    .join(', ');
} 