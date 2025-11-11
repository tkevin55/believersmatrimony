'use client'

import { useState, useEffect } from 'react'
import { Ban, Loader2, UserX } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface BlockedUser {
  id: string
  blocked: {
    id: string
    name: string
    image: string | null
    profile: {
      city: string | null
      state: string | null
      gender: string
    } | null
  }
  reason: string | null
  createdAt: string
}

export function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch('/api/block')
      if (response.ok) {
        const data = await response.json()
        setBlockedUsers(data.blockedUsers)
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error)
      toast({
        title: 'Error',
        description: 'Failed to load blocked users',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnblock = async (blockedId: string, userName: string) => {
    if (!confirm(`Are you sure you want to unblock ${userName}?`)) return

    setUnblockingId(blockedId)

    try {
      const response = await fetch(`/api/block?blockedId=${blockedId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setBlockedUsers(blockedUsers.filter(b => b.blocked.id !== blockedId))
        toast({
          title: 'User Unblocked',
          description: `${userName} has been unblocked successfully`,
        })
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to unblock user',
        })
      }
    } catch (error) {
      console.error('Error unblocking user:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
      })
    } finally {
      setUnblockingId(null)
    }
  }

  useEffect(() => {
    fetchBlockedUsers()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
          <CardDescription>
            Manage users you've blocked
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocked Users</CardTitle>
        <CardDescription>
          Manage users you've blocked. Blocked users cannot see your profile or contact you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {blockedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UserX className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Blocked Users</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              You haven't blocked anyone yet. If you encounter inappropriate behavior,
              you can block users from their profile.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blockedUsers.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={block.blocked.image || undefined} />
                    <AvatarFallback>
                      {block.blocked.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {block.blocked.name || 'Unknown User'}
                      </h4>
                      <Ban className="h-4 w-4 text-destructive" />
                    </div>

                    {block.blocked.profile && (
                      <p className="text-sm text-muted-foreground">
                        {block.blocked.profile.gender} • {block.blocked.profile.city}
                        {block.blocked.profile.state && `, ${block.blocked.profile.state}`}
                      </p>
                    )}

                    {block.reason && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        Reason: {block.reason}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      Blocked {formatDistanceToNow(new Date(block.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblock(block.blocked.id, block.blocked.name)}
                  disabled={unblockingId === block.blocked.id}
                  className="ml-4"
                >
                  {unblockingId === block.blocked.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Unblocking...
                    </>
                  ) : (
                    'Unblock'
                  )}
                </Button>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> When you unblock someone, they'll be able to see your
                profile again, but you won't automatically match. You can block them again at
                any time if needed.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
