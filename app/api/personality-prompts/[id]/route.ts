import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/personality-prompts/[id]
 * Delete a personality prompt
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verify ownership
    const prompt = await prisma.personalityPrompt.findUnique({
      where: { id },
    })

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    if (prompt.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the prompt
    await prisma.personalityPrompt.delete({
      where: { id },
    })

    // Reorder remaining prompts
    const remainingPrompts = await prisma.personalityPrompt.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
    })

    // Update order for remaining prompts
    await Promise.all(
      remainingPrompts.map((p, index) =>
        prisma.personalityPrompt.update({
          where: { id: p.id },
          data: { order: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting personality prompt:', error)
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/personality-prompts/[id]
 * Update a personality prompt answer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { answer } = body

    // Validation
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer is required' },
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

    // Verify ownership
    const prompt = await prisma.personalityPrompt.findUnique({
      where: { id },
    })

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    if (prompt.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the answer
    const updatedPrompt = await prisma.personalityPrompt.update({
      where: { id },
      data: { answer: answer.trim() },
    })

    return NextResponse.json({ prompt: updatedPrompt })
  } catch (error) {
    console.error('Error updating personality prompt:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}
