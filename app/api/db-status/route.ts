import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma')

    // Check which tables exist
    const tables = await prisma.$queryRaw<any[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `

    // Check Profile columns
    const profileColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Profile'
      ORDER BY column_name;
    `

    // Check User columns
    const userColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
      ORDER BY column_name;
    `

    const requiredTables = ['UserInterest', 'InterestOption', 'Prompt', 'PromptAnswer', 'PaymentLog']
    const existingTableNames = tables.map((t: any) => t.table_name)
    const missingTables = requiredTables.filter((t: string) => !existingTableNames.includes(t))

    const requiredProfileCols = ['firstName', 'lastName', 'favoriteVerse', 'isComplete']
    const existingProfileCols = profileColumns.map((c: any) => c.column_name)
    const missingProfileCols = requiredProfileCols.filter((c: string) => !existingProfileCols.includes(c))

    const requiredUserCols = ['resetToken', 'resetTokenExpiry']
    const existingUserCols = userColumns.map((c: any) => c.column_name)
    const missingUserCols = requiredUserCols.filter((c: string) => !existingUserCols.includes(c))

    const allGood = missingTables.length === 0 && missingProfileCols.length === 0 && missingUserCols.length === 0

    return NextResponse.json({
      status: allGood ? 'HEALTHY' : 'MISSING_SCHEMA',
      databaseConnected: true,
      summary: {
        totalTables: existingTableNames.length,
        missingTablesCount: missingTables.length,
        missingColumnsCount: missingProfileCols.length + missingUserCols.length,
      },
      details: {
        allTables: existingTableNames,
        missingTables,
        missingProfileColumns: missingProfileCols,
        missingUserColumns: missingUserCols,
      },
      message: allGood
        ? 'Database schema is complete!'
        : 'Database is missing tables/columns. Run the SQL initialization script in Neon.',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'ERROR',
        databaseConnected: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
