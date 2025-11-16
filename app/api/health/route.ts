import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Perform a lightweight database check
    // Using a simple count query with limit to minimize overhead
    await prisma.user.count({ take: 1 })

    return NextResponse.json(
      {
        status: 'ok',
        db: 'up',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    // Log the error for debugging
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        status: 'degraded',
        db: 'down',
        error: 'Database check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
