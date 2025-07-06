import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    
    // Test environment variables (don't expose secrets)
    const envCheck = {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasAdzunaId: !!process.env.ADZUNA_APP_ID,
      hasAdzunaKey: !!process.env.ADZUNA_APP_KEY,
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL // Safe to show this one
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug check successful',
      database: {
        connected: true,
        userCount: userCount
      },
      environment: envCheck,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Debug check failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 