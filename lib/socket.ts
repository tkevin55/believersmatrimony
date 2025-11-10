import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export interface SocketMessage {
  id: string
  matchId: string
  senderId: string
  receiverId: string
  content: string
  type: 'TEXT' | 'IMAGE'
  createdAt: Date
  sender?: {
    name: string | null
    image: string | null
  }
}

export interface TypingEvent {
  matchId: string
  userId: string
  userName: string | null
}

export interface OnlineStatusEvent {
  userId: string
  isOnline: boolean
}

export const getSocket = (userId?: string): Socket => {
  if (!socket) {
    // For development without custom server, we'll use polling
    // In production with custom server, this would connect to the Socket.io server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'

    socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      auth: {
        userId: userId,
      },
      autoConnect: false,
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }

  return socket
}

export const connectSocket = (userId: string) => {
  const sock = getSocket(userId)
  if (!sock.connected) {
    sock.auth = { userId }
    sock.connect()
  }
  return sock
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const joinConversation = (matchId: string) => {
  if (socket?.connected) {
    socket.emit('join_conversation', { matchId })
  }
}

export const leaveConversation = (matchId: string) => {
  if (socket?.connected) {
    socket.emit('leave_conversation', { matchId })
  }
}

export const sendMessage = (data: {
  matchId: string
  receiverId: string
  content: string
  type?: 'TEXT' | 'IMAGE'
}) => {
  if (socket?.connected) {
    socket.emit('send_message', data)
  }
}

export const emitTypingStart = (matchId: string) => {
  if (socket?.connected) {
    socket.emit('typing_start', { matchId })
  }
}

export const emitTypingStop = (matchId: string) => {
  if (socket?.connected) {
    socket.emit('typing_stop', { matchId })
  }
}

export const markAsRead = (matchId: string, messageIds: string[]) => {
  if (socket?.connected) {
    socket.emit('mark_as_read', { matchId, messageIds })
  }
}

// Event listeners
export const onNewMessage = (callback: (message: SocketMessage) => void) => {
  if (socket) {
    socket.on('new_message', callback)
  }
}

export const onTyping = (callback: (data: TypingEvent) => void) => {
  if (socket) {
    socket.on('typing_start', callback)
    socket.on('typing_stop', callback)
  }
}

export const onMessagesRead = (callback: (data: { matchId: string; messageIds: string[] }) => void) => {
  if (socket) {
    socket.on('messages_read', callback)
  }
}

export const onUserOnline = (callback: (data: OnlineStatusEvent) => void) => {
  if (socket) {
    socket.on('user_online', callback)
  }
}

export const onUserOffline = (callback: (data: OnlineStatusEvent) => void) => {
  if (socket) {
    socket.on('user_offline', callback)
  }
}

// Remove event listeners
export const offNewMessage = () => {
  if (socket) {
    socket.off('new_message')
  }
}

export const offTyping = () => {
  if (socket) {
    socket.off('typing_start')
    socket.off('typing_stop')
  }
}

export const offMessagesRead = () => {
  if (socket) {
    socket.off('messages_read')
  }
}

export const offUserStatus = () => {
  if (socket) {
    socket.off('user_online')
    socket.off('user_offline')
  }
}
