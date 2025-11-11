import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET user's prompt answers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const answers = await prisma.promptAnswer.findMany({
      where: { userId: session.user.id },
      include: {
        prompt: true
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ answers })
  } catch (error) {
    console.error('Error fetching prompt answers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
      { status: 500 }
    )
  }
}

// POST new prompt answer
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { promptId, answer } = await request.json()

    // Check if user already has 3 answers
    const existingCount = await prisma.promptAnswer.count({
      where: { userId: session.user.id }
    })

    if (existingCount >= 3) {
      return NextResponse.json(
        { error: 'You can only answer up to 3 prompts' },
        { status: 400 }
      )
    }

    // Validate answer length
    if (!answer || answer.length > 250) {
      return NextResponse.json(
        { error: 'Answer must be between 1 and 250 characters' },
        { status: 400 }
      )
    }

    const promptAnswer = await prisma.promptAnswer.create({
      data: {
        userId: session.user.id,
        promptId,
        answer,
        order: existingCount
      },
      include: {
        prompt: true
      }
    })

    return NextResponse.json({ answer: promptAnswer }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating prompt answer:', error)

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already answered this prompt' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save answer' },
      { status: 500 }
    )
  }
}

// DELETE prompt answer
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const answerId = searchParams.get('id')

    if (!answerId) {
      return NextResponse.json(
        { error: 'Answer ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const answer = await prisma.promptAnswer.findUnique({
      where: { id: answerId }
    })

    if (!answer || answer.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    await prisma.promptAnswer.delete({
      where: { id: answerId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prompt answer:', error)
    return NextResponse.json(
      { error: 'Failed to delete answer' },
      { status: 500 }
    )
  }
}
