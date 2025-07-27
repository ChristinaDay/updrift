import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rateLimiter';

async function testHandler() {
  const hasApiKey = !!process.env.RAPIDAPI_KEY;
  
  return NextResponse.json({
    status: 'success',
    hasApiKey,
    message: hasApiKey 
      ? 'API key configured - real job data available!' 
      : 'No API key found - using demo data',
    timestamp: new Date().toISOString()
  });
}

// Export the rate-limited handler
export const GET = withRateLimit('api-test')(testHandler); 