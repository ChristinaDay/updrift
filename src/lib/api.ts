import axios from 'axios';
import { Job, JobSearchParams, JobSearchResponse } from '@/types/job';
import { searchAllProviders } from './apihub';

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
 * Search jobs using all providers (Adzuna, JSearch, etc.)
 */
export async function searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  // Aggregate jobs from all providers
  const allJobs = await searchAllProviders(params);
  return {
    status: 'success',
    request_id: 'multi-' + Date.now(),
    parameters: params,
    data: allJobs,
    original_data: allJobs,
    num_pages: 1, // For now, pagination is not aggregated
    client_filtered: false,
    original_count: allJobs.length,
    filtered_count: allJobs.length
  };
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
}

/**
 * Get coordinates for a location using a geocoding service
 */
async function getLocationCoordinates(location: string): Promise<{lat: number, lng: number} | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error('Error getting location coordinates:', error);
  }
  return null;
}

/**
 * Search jobs using Adzuna API
 */
export async function searchAdzunaJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  try {
    const { query, location, radius = 25, remote_jobs_only, page = 1, num_pages = 1 } = params;
    
    // Build Adzuna API URL - US jobs
    const country = 'us'; // Can be made configurable later
    const searchUrl = `/${country}/search/${page}`;
    
    // Build query parameters
    const queryParams: any = {
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      results_per_page: 20, // Reduced from 50 to 20 - API might have limits
      'content-type': 'application/json'
    };
    
    // Add search query if provided
    if (query?.trim()) {
      queryParams.what = query.trim();
    }
    
    // Add location with radius-based search approach
    if (location?.trim()) {
      let searchLocation = location.trim();
      
      // Clean location string to just get the city name
      const cleanLocation = searchLocation
        .replace(/,\s*California$/i, '')
        .replace(/,\s*CA$/i, '')
        .replace(/,\s*United States$/i, '')
        .replace(/,\s*US$/i, '')
        .replace(/,\s*[A-Z]{2}$/i, '') // Remove any state abbreviation
        .replace(/\s+Bay\s+Area$/i, '') // Remove "Bay Area"
        .replace(/^Greater\s+/i, '') // Remove "Greater"
        .trim();
      
      queryParams.where = cleanLocation;
      
        console.log(`🎯 Location search: "${searchLocation}" → "${cleanLocation}" (will apply ${radius} mile radius filter client-side)`);
    }
    
    // Add remote jobs filter
    if (remote_jobs_only) {
      queryParams.what = queryParams.what ? `${queryParams.what} remote` : 'remote';
    }
    
    console.log('🔍 Searching jobs with Adzuna API:', searchUrl, queryParams);
    
    const response = await adzunaClient.get(searchUrl, { params: queryParams });
    
    if (response.data?.results) {
      const originalJobs = response.data.results.map(convertAdzunaJob);
      let filteredJobs = originalJobs;
      let radiusFiltered = false;
      
      // Apply radius filtering if location is provided
      if (location?.trim()) {
        const searchCoords = await getLocationCoordinates(location.trim());
        if (searchCoords) {
          const RADIUS_MILES = radius; // Dynamic radius from user selection
          
          filteredJobs = originalJobs.filter((job: Job) => {
            // Check if job has coordinates (from adzunaJob.latitude and adzunaJob.longitude)
            const jobData = response.data.results.find((r: any) => r.id?.toString() === job.job_id);
            if (jobData && jobData.latitude && jobData.longitude) {
              const distance = calculateDistance(
                searchCoords.lat, 
                searchCoords.lng, 
                jobData.latitude, 
                jobData.longitude
              );
              return distance <= RADIUS_MILES;
            }
            // Include jobs without coordinates (better to include than exclude)
            return true;
          });
          
          radiusFiltered = filteredJobs.length < originalJobs.length;
          console.log(`🎯 Radius filter applied: ${originalJobs.length} → ${filteredJobs.length} jobs (within ${RADIUS_MILES} miles)`);
        }
      }
      
      console.log('✅ Adzuna API success:', filteredJobs.length, 'jobs found');
      
      return {
        status: 'success',
        request_id: 'adzuna-' + Date.now(),
        parameters: params,
        data: filteredJobs,
        original_data: originalJobs,
        num_pages: Math.ceil(response.data.count / 20),
        client_filtered: radiusFiltered,
        original_count: originalJobs.length,
        filtered_count: filteredJobs.length
      };
    } else {
      throw new Error('No results from Adzuna API');
    }
    
  } catch (error: any) {
    console.error('❌ Adzuna API error:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('🔍 Response status:', error.response.status);
      console.error('🔍 Response data:', error.response.data);
      console.error('🔍 Request URL:', error.config?.url);
      console.error('🔍 Request params:', error.config?.params);
    }
    
    // Fallback to mock data
    return searchMockJobs(params);
  }
}

/**
 * Mock job data for development/fallback
 */
async function searchMockJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  const { query, location } = params;
  
  // Get the primary city for location-specific mock data
  const primaryCity = location?.split(',')[0]?.trim() || 'San Francisco';
  const primaryState = location?.includes(',') ? location.split(',')[1]?.trim() : 'CA';
  
  const mockJobs: Job[] = [
    {
      job_id: 'mock-1',
      job_title: 'Senior Software Engineer',
      job_description: 'We are seeking a Senior Software Engineer to join our team...',
      job_apply_link: 'https://example.com/apply/1',
      job_city: primaryCity,
      job_state: primaryState,
      job_country: 'US',
      job_employment_type: 'FULLTIME',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() / 1000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_min_salary: 120000,
      job_max_salary: 180000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      employer_name: 'TechCorp Innovation',
      job_publisher: 'Mock Data',
      job_apply_is_direct: false,
    },
    {
      job_id: 'mock-2',
      job_title: 'DevOps Engineer',
      job_description: 'Join our DevOps team and help build scalable infrastructure...',
      job_apply_link: 'https://example.com/apply/2',
      job_city: primaryCity,
      job_state: primaryState,
      job_country: 'US',
      job_employment_type: 'FULLTIME',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() / 1000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_min_salary: 100000,
      job_max_salary: 150000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      employer_name: 'CloudTech Solutions',
      job_publisher: 'Mock Data',
      job_apply_is_direct: false,
    },
    {
      job_id: 'mock-3',
      job_title: 'Product Manager',
      job_description: 'Lead product strategy and development for our AI platform...',
      job_apply_link: 'https://example.com/apply/3',
      job_city: primaryCity,
      job_state: primaryState,
      job_country: 'US',
      job_employment_type: 'FULLTIME',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() / 1000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_min_salary: 130000,
      job_max_salary: 170000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      employer_name: 'DataFlow Analytics',
      job_publisher: 'Mock Data',
      job_apply_is_direct: false,
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
      job.job_state.toLowerCase().includes(locationLower)
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

export async function searchJSearchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  const apiKey = process.env.JSEARCH_API_KEY || process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('JSearch API key not set');

  const url = new URL('https://jsearch.p.rapidapi.com/search');
  url.searchParams.set('query', params.query || '');
  if (params.location) url.searchParams.set('location', params.location);
  if (params.radius) url.searchParams.set('radius', params.radius.toString());
  if (params.page) url.searchParams.set('page', params.page.toString());
  if (params.num_pages) url.searchParams.set('num_pages', params.num_pages.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
  });
  if (!response.ok) throw new Error('JSearch API error');
  const data = await response.json();
  return {
    status: data.status || 'success',
    request_id: data.request_id || '',
    parameters: params,
    data: data.data || [],
    original_data: data.data,
    num_pages: data.num_pages || 1,
    client_filtered: false,
    original_count: data.data?.length || 0,
    filtered_count: data.data?.length || 0,
  };
} 