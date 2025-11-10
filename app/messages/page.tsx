import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ConversationList } from '@/components/conversation-list'
import { Card } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Messages | Believers Matrimony',
  description: 'Your conversations',
}

async function getConversations(userId: string) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          image: true,
          lastActive: true,
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          image: true,
          lastActive: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      matchedAt: 'desc',
    },
  })

  const conversations = await Promise.all(
    matches.map(async (match) => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1
      const lastMessage = match.messages[0] || null

      const unreadCount = await prisma.message.count({
        where: {
          matchId: match.id,
          receiverId: userId,
          isRead: false,
        },
      })

      const isOnline = otherUser.lastActive
        ? new Date().getTime() - new Date(otherUser.lastActive).getTime() < 5 * 60 * 1000
        : false

      return {
        matchId: match.id,
        user: {
          id: otherUser.id,
          name: otherUser.name,
          image: otherUser.image,
          isOnline,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId,
            }
          : null,
        unreadCount,
        matchedAt: match.matchedAt,
      }
    })
  )

  // Sort by last message time
  conversations.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || a.matchedAt
    const bTime = b.lastMessage?.createdAt || b.matchedAt
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  return conversations
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const conversations = await getConversations(session.user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Connect with your matches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List - Full width on mobile, left panel on desktop */}
        <Card className="lg:col-span-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            currentUserId={session.user.id}
          />
        </Card>

        {/* Empty state for desktop when no conversation selected */}
        <Card className="hidden lg:flex lg:col-span-2 items-center justify-center p-12 text-center">
          <div>
            <MessageSquare className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-500">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
