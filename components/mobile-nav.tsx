'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Search, MessageCircle, User, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

export function MobileNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session) return

    // Fetch unread message count
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/messages')
        if (res.ok) {
          const data = await res.json()
          const unread = data.conversations?.reduce(
            (sum: number, conv: any) => sum + (conv.unreadCount || 0),
            0
          )
          setUnreadCount(unread || 0)
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    }

    fetchUnreadCount()
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [session])

  if (!session) return null

  // Hide on auth pages
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/onboarding')) {
    return null
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/discover"
          className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
            isActive('/discover') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Heart className={`h-5 w-5 ${isActive('/discover') ? 'fill-primary' : ''}`} />
          <span className="text-xs">Discover</span>
        </Link>

        <Link
          href="/search"
          className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
            isActive('/search') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">Search</span>
        </Link>

        <Link
          href="/messages"
          className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 relative ${
            isActive('/messages') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <div className="relative">
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </div>
          <span className="text-xs">Messages</span>
        </Link>

        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
            isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  )
}
