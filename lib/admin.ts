import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true }
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    throw new Error('Forbidden: Admin access required')
  }

  if (user.status !== 'ACTIVE') {
    throw new Error('Account is not active')
  }

  return { userId: session.user.id, role: user.role }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  return user?.role === 'ADMIN' || user?.role === 'MODERATOR'
}

export async function getCurrentAdmin() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true
    }
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return null
  }

  return user
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: any
) {
  // Create a notification or log entry for the admin action
  // This could be stored in a separate AdminLog table if needed
  console.log(`Admin Action: ${action} by ${adminId} on ${targetType}:${targetId}`, details)
}
