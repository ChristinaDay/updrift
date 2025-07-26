import { useState, useEffect, useCallback } from 'react';
import { Job } from '@/types/job';
import { searchCache, debounce } from './searchCache';

interface UseSearchJobsReturn {
  jobs: Job[];
  filteredJobs: Job[];
  loading: boolean;
  dataSource: 'loading' | 'real' | 'mock' | 'error';
  locationFilterResults: {
    applied: boolean;
    originalCount: number;
    filteredCount: number;
  } | null;
  searchJobs: (query: string, location: string, radius: number) => void;
  clearCache: () => void;
  cacheStats: { size: number; keys: string[] };
}

export function useSearchJobs(): UseSearchJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'loading' | 'real' | 'mock' | 'error'>('loading');
  const [locationFilterResults, setLocationFilterResults] = useState<{
    applied: boolean;
    originalCount: number;
    filteredCount: number;
  } | null>(null);

  const searchJobs = useCallback(async (query: string, location: string, radius: number) => {
    // Don't search if both query and location are empty
    if (!query && !location) {
      setJobs([]);
      setFilteredJobs([]);
      setLoading(false);
      return;
    }

    // Check cache first
    const cachedResult = searchCache.getCachedResult(query, location, radius);
    if (cachedResult) {
      setJobs(cachedResult.original_data || cachedResult.data || []);
      setFilteredJobs(cachedResult.data || []);
      setDataSource(cachedResult.status === 'mock' ? 'mock' : 'real');
      setLocationFilterResults(cachedResult.client_filtered ? {
        applied: true,
        originalCount: cachedResult.original_count || 0,
        filteredCount: cachedResult.filtered_count || 0
      } : null);
      setLoading(false);
      return;
    }

    // Check if we should make an API call
    if (!searchCache.shouldMakeApiCall(query, location, radius)) {
      console.log('🚫 API call blocked by throttling or cache');
      return;
    }

    setLoading(true);
    try {
      // Build API URL with parameters
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (location) params.append('location', location);
      if (location && radius) params.append('radius', radius.toString());
      
      console.log('🔍 Fetching jobs with params:', params.toString());
      
      const response = await fetch(`/api/jobs/search?${params.toString()}`);
      const data = await response.json();
      
      console.log('📊 API Response:', data.status, data.data?.length || 0, 'jobs');
      
      // Record the API call
      searchCache.recordApiCall();
      
      // Cache the result
      searchCache.setCachedResult(query, location, radius, data);
      
      if (data.status === 'mock') {
        console.log('🚨 Using mock data - configure RAPIDAPI_KEY for real jobs');
        setDataSource('mock');
      } else if (data.status === 'success') {
        console.log('✅ Using real job data from JSearch API');
        setDataSource('real');
      } else {
        console.log('⚠️ API error, using fallback data');
        setDataSource('error');
      }
      
      // Store original and filtered jobs
      setJobs(data.original_data || data.data || []);
      setFilteredJobs(data.data || []);

      // Track location filtering results
      if (data.client_filtered) {
        setLocationFilterResults({
          applied: true,
          originalCount: data.original_count || 0,
          filteredCount: data.filtered_count || 0
        });
      } else {
        setLocationFilterResults(null);
      }
    } catch (error) {
      console.error('❌ Error loading jobs:', error);
      setDataSource('error');
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, location: string, radius: number) => {
      await searchJobs(query, location, radius);
    }, 300),
    [searchJobs]
  );

  const clearCache = useCallback(() => {
    searchCache.clearCache();
  }, []);

  const cacheStats = searchCache.getCacheStats();

  return {
    jobs,
    filteredJobs,
    loading,
    dataSource,
    locationFilterResults,
    searchJobs: debouncedSearch,
    clearCache,
    cacheStats
  };
} 