import { JobSearchParams, Job } from '@/types/job';
import { searchAdzunaJobs as adzunaSearch } from './api';
import { searchJSearchJobs } from './api';

// Provider interface for job APIs
export interface JobProvider {
  id: string; // Unique provider ID (e.g., 'adzuna', 'jsearch')
  displayName: string; // Human-readable name
  logoUrl?: string; // Optional logo for UI
  searchJobs: (params: JobSearchParams) => Promise<Job[]>;
}

export const adzunaProvider: JobProvider = {
  id: 'adzuna',
  displayName: 'Adzuna',
  logoUrl: '/logos/adzuna.png', // Placeholder, update as needed
  searchJobs: async (params: JobSearchParams): Promise<Job[]> => {
    const response = await adzunaSearch(params);
    return response.data;
  },
};

export const jsearchProvider: JobProvider = {
  id: 'jsearch',
  displayName: 'JSearch',
  logoUrl: '/logos/jsearch-rapidapi.jpeg', // Updated to match the actual file
  searchJobs: async (params: JobSearchParams): Promise<Job[]> => {
    const response = await searchJSearchJobs(params);
    return response.data;
  },
};

export const mockProvider: JobProvider = {
  id: 'mock',
  displayName: 'MockJobs',
  logoUrl: '/logos/mock.png', // Placeholder
  searchJobs: async (_params: JobSearchParams): Promise<Job[]> => [
    {
      job_id: 'mock-1',
      employer_name: 'Mock Company',
      job_title: 'Mock Software Engineer',
      job_description: 'This is a mock job for testing the APIhub aggregation.',
      job_city: 'Remote',
      job_state: '',
      job_country: 'US',
      job_is_remote: true,
      job_posted_at_timestamp: Date.now() / 1000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_apply_link: '#',
      job_apply_is_direct: true,
      job_employment_type: 'FULLTIME',
      job_publisher: 'MockJobs',
      // Optional fields
      employer_logo: undefined,
      employer_website: undefined,
      job_offer_expiration_datetime_utc: undefined,
      job_offer_expiration_timestamp: undefined,
      job_required_experience: undefined,
      job_required_skills: ['Testing', 'TypeScript'],
      job_required_education: undefined,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_min_salary: 100000,
      job_max_salary: 120000,
      job_benefits: ['Remote work', 'Flexible hours'],
      job_google_link: undefined,
      job_naics_code: undefined,
      job_naics_name: undefined,
      job_occupational_categories: undefined,
      job_highlights: {
        Qualifications: ['TypeScript', 'React'],
        Responsibilities: ['Write code', 'Test features'],
        Benefits: ['Remote', 'Flexible']
      }
    }
  ],
};

// Register both providers
export const jobProviders: JobProvider[] = [
  adzunaProvider,
  jsearchProvider,
  mockProvider,
];

// Search all providers in parallel and aggregate results
export async function searchAllProviders(params: JobSearchParams): Promise<Job[]> {
  // Call all providers in parallel
  const results = await Promise.all(
    jobProviders.map(provider =>
      provider.searchJobs(params).catch(err => {
        console.error(`Provider ${provider.id} failed:`, err);
        return [];
      })
    )
  );
  // Flatten and deduplicate by job_id
  const allJobs = results.flat();
  const seen = new Set<string>();
  const deduped = allJobs.filter(job => {
    if (seen.has(job.job_id)) return false;
    seen.add(job.job_id);
    return true;
  });
  return deduped;
} 