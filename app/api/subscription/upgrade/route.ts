import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Upgrade user's subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier } = body

    if (!tier || !['PREMIUM', 'PREMIUM_PLUS'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be PREMIUM or PREMIUM_PLUS' },
        { status: 400 }
      )
    }

    // Calculate end date (30 days from now)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    // Determine pricing based on tier
    const amount = tier === 'PREMIUM' ? 999 : 1999

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        tier,
        status: 'ACTIVE',
        startDate,
        endDate,
        amount,
        lastPaymentDate: startDate,
        autoRenew: true,
      },
      create: {
        userId: session.user.id,
        tier,
        status: 'ACTIVE',
        startDate,
        endDate,
        amount,
        lastPaymentDate: startDate,
        autoRenew: true,
        paymentMethod: 'DEMO', // In production, this would come from payment gateway
        currency: 'INR',
      },
    })

    return NextResponse.json({
      success: true,
      subscription,
      message: `Successfully upgraded to ${tier}`,
    })
  } catch (error) {
    console.error('Error upgrading subscription:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    )
  }
}
