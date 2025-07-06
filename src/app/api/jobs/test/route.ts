import { NextResponse } from 'next/server';

export async function GET() {
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