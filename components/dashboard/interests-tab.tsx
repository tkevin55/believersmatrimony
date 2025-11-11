'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import InterestCard from '@/components/interest-card'
import { Heart, Send, Inbox } from 'lucide-react'

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

export default function InterestsTab() {
  const { toast } = useToast()
  const [sentInterests, setSentInterests] = useState<Interest[]>([])
  const [receivedInterests, setReceivedInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState('received')

  useEffect(() => {
    fetchInterests()
  }, [])

  const fetchInterests = async () => {
    try {
      const response = await fetch('/api/interests')
      if (response.ok) {
        const data = await response.json()
        setSentInterests(data.sent || [])
        setReceivedInterests(data.received || [])
      }
    } catch (error) {
      console.error('Error fetching interests:', error)
      toast({
        title: 'Error',
        description: 'Failed to load interests',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (interestId: string) => {
    try {
      const response = await fetch(`/api/interests/${interestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' })
      })

      if (response.ok) {
        toast({
          title: 'Interest Accepted!',
          description: 'You now have a new match'
        })
        // Refresh interests
        fetchInterests()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to accept interest',
        })
      }
    } catch (error) {
      console.error('Error accepting interest:', error)
      toast({
        title: 'Error',
        description: 'Failed to accept interest',
      })
    }
  }

  const handleDecline = async (interestId: string) => {
    try {
      const response = await fetch(`/api/interests/${interestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DECLINED' })
      })

      if (response.ok) {
        toast({
          title: 'Interest Declined',
          description: 'The interest has been declined'
        })
        // Refresh interests
        fetchInterests()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to decline interest',
        })
      }
    } catch (error) {
      console.error('Error declining interest:', error)
      toast({
        title: 'Error',
        description: 'Failed to decline interest',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'ACCEPTED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>
      case 'DECLINED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interests</CardTitle>
          <CardDescription>Manage sent and received interests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interests</CardTitle>
        <CardDescription>
          Manage interests you've sent and received
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Received ({receivedInterests.filter(i => i.status === 'PENDING').length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Sent ({sentInterests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4 mt-6">
            {receivedInterests.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Interests Received</h3>
                <p className="text-muted-foreground">
                  You haven't received any interests yet. Complete your profile to increase visibility!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedInterests.map((interest) => (
                  <InterestCard
                    key={interest.id}
                    interest={interest}
                    type="received"
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4 mt-6">
            {sentInterests.length === 0 ? (
              <div className="text-center py-12">
                <Send className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Interests Sent</h3>
                <p className="text-muted-foreground">
                  You haven't sent any interests yet. Start exploring matches!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentInterests.map((interest) => (
                  <InterestCard
                    key={interest.id}
                    interest={interest}
                    type="sent"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
