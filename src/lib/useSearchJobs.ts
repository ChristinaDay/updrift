import { useState, useEffect, useCallback } from 'react';
import { Job } from '@/types/job';
import { searchCache, debounce } from './searchCache';
import { errorHandler } from './errorHandling';

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
  isUserIdle: boolean;
  currentCacheEntry: { timestamp: number; searchParams: string } | null;
  allCacheEntries: { timestamp: number; searchParams: string }[];
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
  const [lastSearchParams, setLastSearchParams] = useState<{
    query: string;
    location: string;
    radius: number;
  } | null>(null);
  const [currentCacheEntry, setCurrentCacheEntry] = useState<{ timestamp: number; searchParams: string } | null>(null);

  // Track user activity
  useEffect(() => {
    const handleUserActivity = () => {
      searchCache.recordUserActivity();
    };

    // Track various user activities
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Record initial activity
    handleUserActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);

  const searchJobs = useCallback(async (query: string, location: string, radius: number) => {
    // Don't search if both query and location are empty
    if (!query && !location) {
      setJobs([]);
      setFilteredJobs([]);
      setLoading(false);
      setLastSearchParams(null);
      return;
    }

    // Check if this is the same search as before
    const isSameSearch = lastSearchParams && 
      lastSearchParams.query === query && 
      lastSearchParams.location === location && 
      lastSearchParams.radius === radius;

    // Check cache first
    const cachedResult = searchCache.getCachedResult(query, location, radius);
    const cacheEntry = searchCache.getCacheEntry(query, location, radius);
    if (cachedResult) {
      setJobs(cachedResult.original_data || cachedResult.data || []);
      setFilteredJobs(cachedResult.data || []);
      setDataSource(cachedResult.status === 'mock' ? 'mock' : 'real');
      setLocationFilterResults(cachedResult.client_filtered ? {
        applied: true,
        originalCount: cachedResult.original_count || 0,
        filteredCount: cachedResult.filtered_count || 0
      } : null);
      setCurrentCacheEntry(cacheEntry ? { timestamp: cacheEntry.timestamp, searchParams: cacheEntry.searchParams } : null);
      setLoading(false);
      setLastSearchParams({ query, location, radius });
      return;
    } else {
      setCurrentCacheEntry(null);
    }

    // Only make API call for new searches, not when user becomes active again
    if (isSameSearch) {
      console.log('🔄 Same search detected - using cached results without API call');
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
      searchCache.recordApiCall(query, location, radius);
      
      // Cache the result
      searchCache.setCachedResult(query, location, radius, data);
      
      // Set current cache entry for the newly cached result
      const newCacheEntry = searchCache.getCacheEntry(query, location, radius);
      setCurrentCacheEntry(newCacheEntry ? { timestamp: newCacheEntry.timestamp, searchParams: newCacheEntry.searchParams } : null);
      
      // Record the search parameters
      setLastSearchParams({ query, location, radius });
      
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
      const errorResponse = errorHandler.parseError(error, {
        endpoint: 'useSearchJobs',
        params: { query, location, radius }
      });
      
      errorHandler.logError(errorResponse);
      
      console.error('❌ Error loading jobs:', errorResponse.userMessage);
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
    setCurrentCacheEntry(null);
  }, []);

  const cacheStats = searchCache.getCacheStats();

  const allCacheEntries = searchCache.getAllCacheEntries().map(entry => ({
    timestamp: entry.timestamp,
    searchParams: entry.searchParams
  }));

  return {
    jobs,
    filteredJobs,
    loading,
    dataSource,
    locationFilterResults,
    searchJobs: debouncedSearch,
    clearCache,
    cacheStats,
    isUserIdle: searchCache.isUserIdle(),
    currentCacheEntry,
    allCacheEntries
  };
} 