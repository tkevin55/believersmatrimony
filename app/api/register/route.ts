import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, phoneNumber } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check if phone number is already in use
    if (phoneNumber) {
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber }
      })

      if (existingPhone) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user (name will be added during onboarding)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phoneNumber,
        status: 'ACTIVE',
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
