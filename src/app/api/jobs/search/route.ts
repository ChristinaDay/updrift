import { NextRequest, NextResponse } from 'next/server';
import { searchJobs } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location') || '';
    const remote_jobs_only = searchParams.get('remote_jobs_only') === 'true';
    const employment_types = searchParams.get('employment_types')?.split(',') || [];
    const salary_min = searchParams.get('salary_min');
    const salary_max = searchParams.get('salary_max');
    const date_posted = searchParams.get('date_posted');
    const page = parseInt(searchParams.get('page') || '1');
    const num_pages = parseInt(searchParams.get('num_pages') || '1');

    console.log('🔍 Job search request:', { query, location, remote_jobs_only, page });

    // Use the new Adzuna API implementation
    const searchResults = await searchJobs({
      query,
      location,
      remote_jobs_only,
      employment_types,
      salary_min: salary_min ? parseInt(salary_min) : undefined,
      salary_max: salary_max ? parseInt(salary_max) : undefined,
      date_posted: date_posted || undefined,
      page,
      num_pages,
    });

    console.log('✅ Job search successful:', searchResults.data?.length || 0, 'jobs found');
    
    return NextResponse.json(searchResults);
    
  } catch (error) {
    console.error('❌ Job search error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to search jobs',
      data: [],
      original_data: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      client_filtered: false,
      original_count: 0,
      filtered_count: 0
    });
  }
} 