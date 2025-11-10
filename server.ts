import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { prisma } from './lib/prisma'
import { validateMessageContent } from './lib/profanity'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Store online users and their socket IDs
const onlineUsers = new Map<string, string>() // userId -> socketId
const userRooms = new Map<string, Set<string>>() // userId -> Set of matchIds

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId

    if (!userId) {
      return next(new Error('Authentication error: userId required'))
    }

    try {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, status: true },
      })

      if (!user || user.status !== 'ACTIVE') {
        return next(new Error('Authentication error: Invalid user'))
      }

      socket.data.userId = userId
      next()
    } catch (error) {
      console.error('Socket auth error:', error)
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.data.userId
    console.log(`User connected: ${userId} (${socket.id})`)

    // Store online user
    onlineUsers.set(userId, socket.id)

    // Update user's last active
    prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() },
    }).catch(console.error)

    // Notify others that user is online
    socket.broadcast.emit('user_online', { userId, isOnline: true })

    // Initialize user rooms
    if (!userRooms.has(userId)) {
      userRooms.set(userId, new Set())
    }

    // Join conversation room
    socket.on('join_conversation', async ({ matchId }: { matchId: string }) => {
      try {
        // Verify user is part of this match
        const match = await prisma.match.findFirst({
          where: {
            id: matchId,
            OR: [
              { user1Id: userId },
              { user2Id: userId },
            ],
          },
        })

        if (!match) {
          socket.emit('error', { message: 'Unauthorized: Not part of this match' })
          return
        }

        socket.join(matchId)
        userRooms.get(userId)?.add(matchId)
        console.log(`User ${userId} joined conversation ${matchId}`)
      } catch (error) {
        console.error('Error joining conversation:', error)
        socket.emit('error', { message: 'Failed to join conversation' })
      }
    })

    // Leave conversation room
    socket.on('leave_conversation', ({ matchId }: { matchId: string }) => {
      socket.leave(matchId)
      userRooms.get(userId)?.delete(matchId)
      console.log(`User ${userId} left conversation ${matchId}`)
    })

    // Send message
    socket.on('send_message', async (data: {
      matchId: string
      receiverId: string
      content: string
      type?: 'TEXT' | 'IMAGE'
    }) => {
      try {
        const { matchId, receiverId, content, type = 'TEXT' } = data

        // Validate message content
        const validation = validateMessageContent(content)
        if (!validation.isValid) {
          socket.emit('error', { message: validation.message })
          return
        }

        // Verify match exists and user is part of it
        const match = await prisma.match.findFirst({
          where: {
            id: matchId,
            OR: [
              { user1Id: userId, user2Id: receiverId },
              { user1Id: receiverId, user2Id: userId },
            ],
          },
        })

        if (!match) {
          socket.emit('error', { message: 'Invalid match or unauthorized' })
          return
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            matchId,
            senderId: userId,
            receiverId,
            content,
            type,
          },
          include: {
            sender: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        })

        // Emit to all users in the conversation room
        io.to(matchId).emit('new_message', message)

        // Create notification for receiver if they're not in the conversation
        const receiverSocketId = onlineUsers.get(receiverId)
        const receiverInRoom = userRooms.get(receiverId)?.has(matchId)

        if (!receiverInRoom) {
          // Create notification
          await prisma.notification.create({
            data: {
              userId: receiverId,
              type: 'NEW_MESSAGE',
              title: 'New Message',
              content: `${message.sender.name || 'Someone'} sent you a message`,
              link: `/messages/${matchId}`,
            },
          })

          // Emit notification to receiver if online
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('new_notification', {
              type: 'NEW_MESSAGE',
              matchId,
            })
          }
        }

        console.log(`Message sent in ${matchId} from ${userId} to ${receiverId}`)
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Typing indicators
    socket.on('typing_start', ({ matchId }: { matchId: string }) => {
      socket.to(matchId).emit('typing_start', {
        matchId,
        userId,
      })
    })

    socket.on('typing_stop', ({ matchId }: { matchId: string }) => {
      socket.to(matchId).emit('typing_stop', {
        matchId,
        userId,
      })
    })

    // Mark messages as read
    socket.on('mark_as_read', async ({ matchId, messageIds }: {
      matchId: string
      messageIds: string[]
    }) => {
      try {
        // Update messages
        await prisma.message.updateMany({
          where: {
            id: { in: messageIds },
            receiverId: userId,
            matchId,
          },
          data: {
            isRead: true,
          },
        })

        // Notify sender
        io.to(matchId).emit('messages_read', {
          matchId,
          messageIds,
        })

        console.log(`Messages marked as read in ${matchId}`)
      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId} (${socket.id})`)
      onlineUsers.delete(userId)
      userRooms.delete(userId)

      // Notify others that user is offline
      socket.broadcast.emit('user_offline', { userId, isOnline: false })

      // Update user's last active
      prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() },
      }).catch(console.error)
    })
  })

  server.listen(port, () => {
    console.log(`> Server listening at http://${hostname}:${port}`)
    console.log(`> Socket.IO server is ready`)
  })
})
