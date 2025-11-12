import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Check Profile columns
    const profileColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Profile'
        AND column_name IN ('firstName', 'lastName', 'favoriteVerse', 'isComplete')
      ORDER BY column_name;
    `

    // Check User columns
    const userColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
        AND column_name IN ('resetToken', 'resetTokenExpiry')
      ORDER BY column_name;
    `

    // Check migration status
    const migrations = await prisma.$queryRaw<any[]>`
      SELECT migration_name, finished_at, rolled_back_at
      FROM "_prisma_migrations"
      WHERE migration_name LIKE '%add_missing_profile_and_user_fields%'
      ORDER BY started_at DESC
      LIMIT 1;
    `

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        profileColumns: profileColumns.map((c: any) => c.column_name),
        userColumns: userColumns.map((c: any) => c.column_name),
        requiredProfileColumns: ['firstName', 'lastName', 'favoriteVerse', 'isComplete'],
        requiredUserColumns: ['resetToken', 'resetTokenExpiry'],
        missingProfileColumns: ['firstName', 'lastName', 'favoriteVerse', 'isComplete'].filter(
          (col: string) => !profileColumns.some((c: any) => c.column_name === col)
        ),
        missingUserColumns: ['resetToken', 'resetTokenExpiry'].filter(
          (col: string) => !userColumns.some((c: any) => c.column_name === col)
        ),
      },
      migration: migrations[0] || null,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
