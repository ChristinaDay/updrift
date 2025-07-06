import axios from 'axios';
import { Job, JobSearchParams, JobSearchResponse } from '@/types/job';

// Adzuna API Configuration (much better than JSearch!)
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || '';

// Create axios instance for Adzuna API
const adzunaClient = axios.create({
  baseURL: ADZUNA_BASE_URL,
  timeout: 10000,
});

/**
 * Convert Adzuna job format to our Job interface
 */
function convertAdzunaJob(adzunaJob: any): Job {
  return {
    job_id: adzunaJob.id?.toString() || '',
    job_title: adzunaJob.title || '',
    job_description: adzunaJob.description || '',
    job_apply_link: adzunaJob.redirect_url || '',
    job_city: adzunaJob.location?.display_name?.split(',')[0]?.trim() || '',
    job_state: adzunaJob.location?.area?.[1] || '',
    job_country: adzunaJob.location?.area?.[0] || 'US',
    job_employment_type: adzunaJob.contract_type || 'FULLTIME',
    job_is_remote: adzunaJob.location?.display_name?.toLowerCase().includes('remote') || false,
    job_posted_at_timestamp: adzunaJob.created ? new Date(adzunaJob.created).getTime() / 1000 : 0,
    job_posted_at_datetime_utc: adzunaJob.created || '',
    job_min_salary: adzunaJob.salary_min || undefined,
    job_max_salary: adzunaJob.salary_max || undefined,
    job_salary_currency: 'USD',
    job_salary_period: 'YEAR',
    employer_name: adzunaJob.company?.display_name || '',
    job_publisher: 'Adzuna',
    job_apply_is_direct: false,
    // Optional properties
    employer_logo: undefined,
    employer_website: undefined,
    job_offer_expiration_datetime_utc: undefined,
    job_offer_expiration_timestamp: undefined,
    job_required_experience: undefined,
    job_required_skills: undefined,
    job_required_education: undefined,
    job_benefits: undefined,
    job_google_link: undefined,
    job_naics_code: undefined,
    job_naics_name: undefined,
    job_occupational_categories: undefined,
    job_highlights: undefined,
  };
}

/**
 * Search jobs using Adzuna API (much better location filtering!)
 */
export async function searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  // Use Adzuna if credentials are available
  if (ADZUNA_APP_ID && ADZUNA_APP_KEY) {
    return searchAdzunaJobs(params);
  }
  
  // Fallback to mock data
  console.log('🚨 ADZUNA credentials not configured, using mock data');
  return searchMockJobs(params);
}

/**
 * Search jobs using Adzuna API
 */
async function searchAdzunaJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  try {
    const { query, location, remote_jobs_only, page = 1, num_pages = 1 } = params;
    
    // Build Adzuna API URL - US jobs
    const country = 'us'; // Can be made configurable later
    const searchUrl = `/${country}/search/${page}`;
    
    // Build query parameters
    const queryParams: any = {
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      results_per_page: 10,
      'content-type': 'application/json'
    };
    
    // Add search query if provided
    if (query?.trim()) {
      queryParams.what = query.trim();
    }
    
    // Add location if provided (Adzuna has EXCELLENT location filtering!)
    if (location?.trim()) {
      queryParams.where = location.trim();
    }
    
    // Add remote jobs filter
    if (remote_jobs_only) {
      queryParams.what = queryParams.what ? `${queryParams.what} remote` : 'remote';
    }
    
    console.log('🔍 Searching jobs with Adzuna API:', searchUrl, queryParams);
    
    const response = await adzunaClient.get(searchUrl, { params: queryParams });
    
    if (response.data?.results) {
      const jobs = response.data.results.map(convertAdzunaJob);
      
      console.log('✅ Adzuna API success:', jobs.length, 'jobs found');
      
      return {
        status: 'success',
        request_id: 'adzuna-' + Date.now(),
        parameters: params,
        data: jobs,
        original_data: jobs, // No client-side filtering needed - Adzuna does it right!
        num_pages: Math.ceil(response.data.count / 10),
        client_filtered: false, // Adzuna handles location filtering properly
        original_count: jobs.length,
        filtered_count: jobs.length
      };
    } else {
      throw new Error('No results from Adzuna API');
    }
    
  } catch (error) {
    console.error('❌ Adzuna API error:', error);
    
    // Fallback to mock data
    return searchMockJobs(params);
  }
}

/**
 * Mock job data for development/fallback
 */
async function searchMockJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  const { query, location } = params;
  
  const mockJobs: Job[] = [
    {
      job_id: 'mock-1',
      job_title: 'Senior Software Engineer',
      job_description: 'We are seeking a Senior Software Engineer to join our team...',
      job_apply_link: 'https://example.com/apply/1',
      job_city: 'San Francisco',
      job_state: 'CA',
      job_country: 'US',
      job_employment_type: 'FULLTIME',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() / 1000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_min_salary: 120000,
      job_max_salary: 180000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_benefits: null,
      job_google_link: null,
      job_offer_expiration_datetime_utc: null,
      job_offer_expiration_timestamp: null,
      job_required_experience: null,
      job_required_skills: null,
      job_required_education: null,
      job_highlights: null,
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: null,
      job_onet_job_zone: null,
      job_naics_code: null,
      job_naics_name: null,
      employer_name: 'TechCorp Innovation',
      employer_logo: null,
      employer_website: null,
      employer_company_type: null,
      employer_linkedin_url: null,
      job_publisher: 'Mock Data',
      job_apply_is_direct: false,
      job_apply_quality_score: null,
      apply_options: null,
      job_description_language: 'en',
      estimated_salaries: null,
      job_location: 'San Francisco, CA',
      job_latitude: null,
      job_longitude: null,
    },
    {
      job_id: 'mock-2',
      job_title: 'DevOps Engineer',
      job_description: 'Join our DevOps team and help build scalable infrastructure...',
      job_apply_link: 'https://example.com/apply/2',
      job_city: 'Seattle',
      job_state: 'WA',
      job_country: 'US',
      job_employment_type: 'FULLTIME',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() / 1000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_min_salary: 100000,
      job_max_salary: 150000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_benefits: null,
      job_google_link: null,
      job_offer_expiration_datetime_utc: null,
      job_offer_expiration_timestamp: null,
      job_required_experience: null,
      job_required_skills: null,
      job_required_education: null,
      job_highlights: null,
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: null,
      job_onet_job_zone: null,
      job_naics_code: null,
      job_naics_name: null,
      employer_name: 'CloudTech Solutions',
      employer_logo: null,
      employer_website: null,
      employer_company_type: null,
      employer_linkedin_url: null,
      job_publisher: 'Mock Data',
      job_apply_is_direct: false,
      job_apply_quality_score: null,
      apply_options: null,
      job_description_language: 'en',
      estimated_salaries: null,
      job_location: 'Seattle, WA',
      job_latitude: null,
      job_longitude: null,
    },
    {
      job_id: 'mock-3',
      job_title: 'Product Manager',
      job_description: 'Lead product strategy and development for our AI platform...',
      job_apply_link: 'https://example.com/apply/3',
      job_city: 'Denver',
      job_state: 'CO',
      job_country: 'US',
      job_employment_type: 'FULLTIME',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() / 1000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_min_salary: 130000,
      job_max_salary: 170000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_benefits: null,
      job_google_link: null,
      job_offer_expiration_datetime_utc: null,
      job_offer_expiration_timestamp: null,
      job_required_experience: null,
      job_required_skills: null,
      job_required_education: null,
      job_highlights: null,
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: null,
      job_onet_job_zone: null,
      job_naics_code: null,
      job_naics_name: null,
      employer_name: 'DataFlow Analytics',
      employer_logo: null,
      employer_website: null,
      employer_company_type: null,
      employer_linkedin_url: null,
      job_publisher: 'Mock Data',
      job_apply_is_direct: false,
      job_apply_quality_score: null,
      apply_options: null,
      job_description_language: 'en',
      estimated_salaries: null,
      job_location: 'Denver, CO',
      job_latitude: null,
      job_longitude: null,
    }
  ];
  
  // Filter by query
  let filteredJobs = mockJobs;
  if (query?.trim()) {
    const queryLower = query.toLowerCase();
    filteredJobs = filteredJobs.filter(job =>
      job.job_title.toLowerCase().includes(queryLower) ||
      job.job_description.toLowerCase().includes(queryLower) ||
      job.employer_name.toLowerCase().includes(queryLower)
    );
  }
  
  // Filter by location
  if (location?.trim()) {
    const locationLower = location.toLowerCase();
    filteredJobs = filteredJobs.filter(job =>
      job.job_city.toLowerCase().includes(locationLower) ||
      job.job_state.toLowerCase().includes(locationLower) ||
      job.job_location.toLowerCase().includes(locationLower)
    );
  }
  
  return {
    status: 'mock',
    request_id: 'mock-' + Date.now(),
    parameters: params,
    data: filteredJobs,
    original_data: mockJobs,
    num_pages: 1,
    client_filtered: location?.trim() !== '',
    original_count: mockJobs.length,
    filtered_count: filteredJobs.length
  };
}

/**
 * Get job details by ID
 */
export async function getJobDetails(jobId: string): Promise<Job> {
  try {
    const response = await adzunaClient.get(`/job-details?job_id=${jobId}`);
    return response.data.data[0];
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw new Error('Failed to fetch job details. Please try again.');
  }
}

/**
 * Search for jobs with estimated salaries
 */
export async function searchJobsWithSalaries(params: JobSearchParams): Promise<JobSearchResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all search parameters
    if (params.query) queryParams.append('query', params.query);
    if (params.location) queryParams.append('location', params.location);
    if (params.remote_jobs_only) queryParams.append('remote_jobs_only', 'true');
    
    // Force salary estimates
    queryParams.append('salary_insights', 'true');
    
    const response = await adzunaClient.get(`/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error searching jobs with salaries:', error);
    throw new Error('Failed to search jobs with salary data. Please try again.');
  }
}

/**
 * Get estimated salary for a job title and location
 */
export async function getEstimatedSalary(jobTitle: string, location: string) {
  try {
    const queryParams = new URLSearchParams({
      job_title: jobTitle,
      location: location,
    });
    
    const response = await adzunaClient.get(`/estimated-salary?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching salary estimate:', error);
    throw new Error('Failed to fetch salary estimate. Please try again.');
  }
}

/**
 * Get company information
 */
export async function getCompanyInfo(companyName: string) {
  try {
    const queryParams = new URLSearchParams({
      query: companyName,
    });
    
    const response = await adzunaClient.get(`/company-jobs?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company info:', error);
    throw new Error('Failed to fetch company information. Please try again.');
  }
}

/**
 * Mock data for development/demo purposes
 */
export function getMockJobs(): Job[] {
  return [
    {
      job_id: 'mock-1',
      employer_name: 'TechCorp Inc.',
      employer_logo: 'https://logo.clearbit.com/techcorp.com',
      employer_website: 'https://techcorp.com',
      job_title: 'Senior Software Engineer',
      job_description: 'We are looking for a passionate Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions.',
      job_city: 'San Francisco',
      job_state: 'CA',
      job_country: 'US',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() - 86400000, // 1 day ago
      job_posted_at_datetime_utc: new Date(Date.now() - 86400000).toISOString(),
      job_apply_link: 'https://techcorp.com/jobs/senior-software-engineer',
      job_apply_is_direct: true,
      job_employment_type: 'FULLTIME',
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_min_salary: 120000,
      job_max_salary: 180000,
      job_benefits: ['Health Insurance', '401k', 'Remote Work', 'Flexible Hours'],
      job_publisher: 'TechCorp Careers',
      job_required_skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      job_highlights: {
        Qualifications: [
          '5+ years of software development experience',
          'Strong proficiency in JavaScript and React',
          'Experience with backend development',
        ],
        Responsibilities: [
          'Design and develop scalable web applications',
          'Collaborate with cross-functional teams',
          'Mentor junior developers',
        ],
        Benefits: [
          'Competitive salary and equity',
          'Comprehensive health coverage',
          'Flexible work arrangements',
        ],
      },
    },
    {
      job_id: 'mock-2',
      employer_name: 'DataFlow Solutions',
      employer_logo: 'https://logo.clearbit.com/dataflow.com',
      employer_website: 'https://dataflow.com',
      job_title: 'Product Manager',
      job_description: 'Join our product team to drive innovation and deliver exceptional user experiences. You will work closely with engineering, design, and business teams.',
      job_city: 'New York',
      job_state: 'NY',
      job_country: 'US',
      job_is_remote: true,
      job_posted_at_timestamp: Date.now() - 172800000, // 2 days ago
      job_posted_at_datetime_utc: new Date(Date.now() - 172800000).toISOString(),
      job_apply_link: 'https://dataflow.com/careers/product-manager',
      job_apply_is_direct: true,
      job_employment_type: 'FULLTIME',
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_min_salary: 130000,
      job_max_salary: 160000,
      job_benefits: ['Health Insurance', '401k', 'Stock Options', 'Unlimited PTO'],
      job_publisher: 'DataFlow Careers',
      job_required_skills: ['Product Management', 'Agile', 'Analytics', 'Strategy'],
      job_highlights: {
        Qualifications: [
          '3+ years of product management experience',
          'Strong analytical and communication skills',
          'Experience with B2B software products',
        ],
        Responsibilities: [
          'Define product strategy and roadmap',
          'Work with engineering to deliver features',
          'Analyze user feedback and metrics',
        ],
        Benefits: [
          'Remote-first culture',
          'Professional development budget',
          'Equity participation',
        ],
      },
    },
  ];
} 