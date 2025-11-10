import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRemainingQuotas } from '@/lib/quotas'

// GET - Fetch user's remaining quotas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quotas = await getRemainingQuotas(session.user.id)

    return NextResponse.json(quotas)
  } catch (error) {
    console.error('Error fetching quotas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotas' },
      { status: 500 }
    )
  }
}
