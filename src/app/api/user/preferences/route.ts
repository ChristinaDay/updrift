import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        location: true,
        preferredRemote: true,
        preferredSalaryMin: true,
        preferredSalaryMax: true,
        skills: true,
        experienceLevel: true,
        jobAlerts: true,
        emailNotifications: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse skills from JSON string
    const preferences = {
      ...user,
      skills: user.skills ? JSON.parse(user.skills) : [],
      // Add new preferences with defaults
      preferredJobTypes: [], // Will be added to database schema later
      preferredCompanySize: [],
      preferredSchedule: [],
    }

    return NextResponse.json({
      success: true,
      preferences
    })

  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await request.json()

    // Validate required fields
    if (!preferences) {
      return NextResponse.json(
        { error: 'Preferences data is required' },
        { status: 400 }
      )
    }

    // Update user preferences in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        location: preferences.location || null,
        preferredRemote: preferences.preferredRemote || false,
        preferredSalaryMin: preferences.preferredSalaryMin || null,
        preferredSalaryMax: preferences.preferredSalaryMax || null,
        skills: JSON.stringify(preferences.skills || []),
        experienceLevel: preferences.experienceLevel || null,
        jobAlerts: preferences.jobAlerts !== undefined ? preferences.jobAlerts : true,
        emailNotifications: preferences.emailNotifications !== undefined ? preferences.emailNotifications : true,
      },
      select: {
        id: true,
        location: true,
        preferredRemote: true,
        preferredSalaryMin: true,
        preferredSalaryMax: true,
        skills: true,
        experienceLevel: true,
        jobAlerts: true,
        emailNotifications: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      user: {
        ...updatedUser,
        skills: updatedUser.skills ? JSON.parse(updatedUser.skills) : [],
      }
    })

  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 