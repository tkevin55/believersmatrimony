import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAddMorePrompts } from '@/lib/personality-prompts'

/**
 * GET /api/personality-prompts
 * Fetch user's personality prompts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prompts = await prisma.personalityPrompt.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('Error fetching personality prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/personality-prompts
 * Add a new personality prompt answer
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { promptId, answer } = body

    // Validation
    if (!promptId || !answer) {
      return NextResponse.json(
        { error: 'Prompt ID and answer are required' },
        { status: 400 }
      )
    }

    if (answer.trim().length < 10) {
      return NextResponse.json(
        { error: 'Answer must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (answer.length > 280) {
      return NextResponse.json(
        { error: 'Answer must not exceed 280 characters' },
        { status: 400 }
      )
    }

    // Check current count
    const currentCount = await prisma.personalityPrompt.count({
      where: { userId: session.user.id },
    })

    if (!canAddMorePrompts(currentCount)) {
      return NextResponse.json(
        { error: 'Maximum of 3 prompts allowed' },
        { status: 400 }
      )
    }

    // Check for duplicate prompt
    const existingPrompt = await prisma.personalityPrompt.findFirst({
      where: {
        userId: session.user.id,
        prompt: promptId,
      },
    })

    if (existingPrompt) {
      return NextResponse.json(
        { error: 'You have already answered this prompt' },
        { status: 400 }
      )
    }

    // Create the prompt
    const prompt = await prisma.personalityPrompt.create({
      data: {
        userId: session.user.id,
        prompt: promptId,
        answer: answer.trim(),
        order: currentCount, // 0, 1, or 2
      },
    })

    return NextResponse.json({ prompt }, { status: 201 })
  } catch (error) {
    console.error('Error creating personality prompt:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    )
  }
}
