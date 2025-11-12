import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    // Group prompts by category
    const groupedPrompts = prompts.reduce((acc: any, prompt: any) => {
      if (!acc[prompt.category]) {
        acc[prompt.category] = []
      }
      acc[prompt.category].push(prompt)
      return acc
    }, {})

    return NextResponse.json({
      prompts: groupedPrompts,
      total: prompts.length
    })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}
