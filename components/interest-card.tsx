'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, X, MapPin, Briefcase, Calendar, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  name: string
  email: string
  image: string | null
  profile: {
    denomination: string
    city: string
    state: string
    occupation: string
    aboutMe: string
  } | null
  photos: Array<{
    url: string
    isPrimary: boolean
  }>
}

interface Interest {
  id: string
  senderId: string
  receiverId: string
  message: string | null
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
  sender?: User
  receiver?: User
}

interface InterestCardProps {
  interest: Interest
  type: 'sent' | 'received'
  onAccept?: (interestId: string) => void
  onDecline?: (interestId: string) => void
}

export default function InterestCard({
  interest,
  type,
  onAccept,
  onDecline
}: InterestCardProps) {
  const user = type === 'received' ? interest.sender : interest.receiver

  if (!user) return null

  const primaryPhoto = user.photos?.find((p) => p.isPrimary)
  const location = [user.profile?.city, user.profile?.state].filter(Boolean).join(', ')

  const getStatusBadge = () => {
    switch (interest.status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'ACCEPTED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>
      case 'DECLINED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          {/* User Avatar & Photo */}
          <div className="flex-shrink-0">
            {primaryPhoto ? (
              <div className="w-24 h-24 rounded-lg overflow-hidden">
                <img
                  src={primaryPhoto.url}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                {user.profile?.denomination && (
                  <Badge variant="secondary" className="mt-1">
                    {user.profile.denomination}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
              </div>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{location}</span>
                </div>
              )}
              {user.profile?.occupation && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span>{user.profile.occupation}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  {type === 'received' ? 'Received' : 'Sent'}{' '}
                  {formatDistanceToNow(new Date(interest.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Message */}
            {interest.message && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  <span>Message</span>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "{interest.message}"
                </p>
              </div>
            )}

            {/* Actions for Received Interests */}
            {type === 'received' && interest.status === 'PENDING' && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => onAccept?.(interest.id)}
                  className="flex-1 sm:flex-none"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDecline?.(interest.id)}
                  className="flex-1 sm:flex-none"
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {/* Status message for non-pending interests */}
            {interest.status !== 'PENDING' && (
              <div className="pt-2 text-sm text-muted-foreground">
                {type === 'sent' ? (
                  interest.status === 'ACCEPTED' ? (
                    <span className="text-green-600">This user accepted your interest!</span>
                  ) : (
                    <span className="text-red-600">This user declined your interest.</span>
                  )
                ) : (
                  interest.status === 'ACCEPTED' ? (
                    <span className="text-green-600">You accepted this interest.</span>
                  ) : (
                    <span className="text-red-600">You declined this interest.</span>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
