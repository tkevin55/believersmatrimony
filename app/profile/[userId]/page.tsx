"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import {
  Heart,
  MessageCircle,
  Shield,
  MapPin,
  Briefcase,
  GraduationCap,
  Home,
  Calendar,
  Ruler,
  Church,
  User,
  Users,
  Ban,
  Flag,
  Eye,
  Loader2,
  CheckCircle2,
  Mail,
  Phone,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface ProfileViewProps {
  params: {
    userId: string
  }
}

export default function ProfileViewPage({ params }: ProfileViewProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [interestStatus, setInterestStatus] = useState<any>(null)
  const [isMatched, setIsMatched] = useState(false)
  const [verifications, setVerifications] = useState<string[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [showInterestDialog, setShowInterestDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [interestMessage, setInterestMessage] = useState('')
  const [reportReason, setReportReason] = useState('OTHER')
  const [reportDescription, setReportDescription] = useState('')
  const [isSendingInterest, setIsSendingInterest] = useState(false)
  const [isReporting, setIsReporting] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [params.userId])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${params.userId}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data.profile)
      setPhotos(data.photos || [])
      setInterestStatus(data.interestStatus)
      setIsMatched(data.isMatched)
      setVerifications(data.verifications || [])
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load profile',
        variant: 'destructive',
      })
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendInterest = async () => {
    if (!session?.user?.id) {
      router.push('/auth/login')
      return
    }

    setIsSendingInterest(true)
    try {
      const response = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: params.userId,
          message: interestMessage
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send interest')
      }

      toast({
        title: 'Interest Sent',
        description: 'Your interest has been sent successfully'
      })

      setShowInterestDialog(false)
      fetchProfile() // Refresh to update interest status
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send interest',
        variant: 'destructive'
      })
    } finally {
      setIsSendingInterest(false)
    }
  }

  const handleBlock = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockedId: params.userId,
          reason: 'Blocked from profile view'
        })
      })

      if (!response.ok) throw new Error('Failed to block user')

      toast({
        title: 'User Blocked',
        description: 'You will no longer see this profile'
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to block user',
        variant: 'destructive'
      })
    }
  }

  const handleReport = async () => {
    if (!session?.user?.id) return

    setIsReporting(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedId: params.userId,
          reason: reportReason,
          description: reportDescription
        })
      })

      if (!response.ok) throw new Error('Failed to report user')

      toast({
        title: 'Report Submitted',
        description: 'Thank you for helping keep our community safe'
      })

      setShowReportDialog(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report',
        variant: 'destructive'
      })
    } finally {
      setIsReporting(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatHeight = (cm: number) => {
    const feet = Math.floor(cm / 30.48)
    const inches = Math.round(((cm / 30.48) % 1) * 12)
    return `${cm} cm (${feet}'${inches}")`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const isOwnProfile = session?.user?.id === params.userId

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photos and Quick Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Primary Photo */}
          <Card>
            <CardContent className="p-4">
              <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                <img
                  src={photos[0]?.url || profile.user.image || '/placeholder-avatar.png'}
                  alt={profile.user.name || 'Profile photo'}
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={() => setSelectedPhoto(photos[0]?.url || profile.user.image)}
                />
                {verifications.includes('PHOTO') && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white p-1.5 rounded-full">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Photo gallery */}
              {photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {photos.slice(1).map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition"
                      onClick={() => setSelectedPhoto(photo.url)}
                    >
                      <img
                        src={photo.url}
                        alt="Profile photo"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Profile Stats */}
              <div className="mt-4 pt-4 border-t space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{profile.profileViews || 0} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!isOwnProfile && session?.user?.id && (
            <Card>
              <CardContent className="p-4 space-y-2">
                {isMatched ? (
                  <Button className="w-full" onClick={() => router.push('/messages')}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                ) : interestStatus?.sent ? (
                  <Button className="w-full" disabled>
                    <Heart className="h-4 w-4 mr-2 fill-current" />
                    Interest Sent ({interestStatus.sent})
                  </Button>
                ) : (
                  <Dialog open={showInterestDialog} onOpenChange={setShowInterestDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Heart className="h-4 w-4 mr-2" />
                        Send Interest
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Interest</DialogTitle>
                        <DialogDescription>
                          Send an interest request to {profile.user.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            placeholder="Introduce yourself..."
                            rows={4}
                            value={interestMessage}
                            onChange={(e) => setInterestMessage(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowInterestDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSendInterest} disabled={isSendingInterest}>
                          {isSendingInterest ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Interest'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleBlock}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Block
                  </Button>

                  <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report Profile</DialogTitle>
                        <DialogDescription>
                          Help us keep our community safe by reporting inappropriate behavior
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason</Label>
                          <select
                            id="reason"
                            className="w-full p-2 border rounded-md"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                          >
                            <option value="INAPPROPRIATE_PHOTOS">Inappropriate Photos</option>
                            <option value="FAKE_PROFILE">Fake Profile</option>
                            <option value="HARASSMENT">Harassment</option>
                            <option value="SPAM">Spam</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Please provide more details..."
                            rows={4}
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowReportDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleReport}
                          disabled={isReporting}
                        >
                          {isReporting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Reporting...
                            </>
                          ) : (
                            'Submit Report'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

          {isOwnProfile && (
            <Link href="/profile/settings">
              <Button className="w-full">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {profile.user.name}
                    {verifications.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {calculateAge(profile.dateOfBirth)} years old • {profile.gender}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.city}, {profile.state}, {profile.country}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* About Me */}
          {profile.aboutMe && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.aboutMe}</p>
              </CardContent>
            </Card>
          )}

          {/* Faith Background */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Church className="h-5 w-5" />
                Faith Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Denomination</p>
                  <p className="font-medium">{profile.denomination.replace('_', ' ')}</p>
                </div>
                {profile.churchName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Church</p>
                    <p className="font-medium">{profile.churchName}</p>
                  </div>
                )}
                {profile.yearsAsBeliever !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Years as Believer</p>
                    <p className="font-medium">{profile.yearsAsBeliever} years</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Baptized</p>
                  <p className="font-medium">{profile.isBaptized ? 'Yes' : 'No'}</p>
                </div>
                {profile.churchInvolvementLevel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Church Involvement</p>
                    <p className="font-medium">{profile.churchInvolvementLevel.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Physical Attributes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Physical Attributes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {profile.height && (
                  <div>
                    <p className="text-sm text-muted-foreground">Height</p>
                    <p className="font-medium">{formatHeight(profile.height)}</p>
                  </div>
                )}
                {profile.bodyType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Body Type</p>
                    <p className="font-medium">{profile.bodyType.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Education & Career */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Education & Career
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {profile.educationLevel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Education</p>
                    <p className="font-medium">{profile.educationLevel.replace('_', ' ')}</p>
                  </div>
                )}
                {profile.fieldOfStudy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Field of Study</p>
                    <p className="font-medium">{profile.fieldOfStudy}</p>
                  </div>
                )}
                {profile.occupation && (
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">{profile.occupation}</p>
                  </div>
                )}
                {profile.incomeRange && (
                  <div>
                    <p className="text-sm text-muted-foreground">Income Range</p>
                    <p className="font-medium">{profile.incomeRange.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Family Background */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {profile.familyType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Family Type</p>
                    <p className="font-medium">{profile.familyType.replace('_', ' ')}</p>
                  </div>
                )}
                {profile.siblingsCount !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Siblings</p>
                    <p className="font-medium">{profile.siblingsCount}</p>
                  </div>
                )}
                {profile.birthOrder && (
                  <div>
                    <p className="text-sm text-muted-foreground">Birth Order</p>
                    <p className="font-medium">{profile.birthOrder}</p>
                  </div>
                )}
                {profile.parentsOccupation && (
                  <div>
                    <p className="text-sm text-muted-foreground">Parents Occupation</p>
                    <p className="font-medium">{profile.parentsOccupation}</p>
                  </div>
                )}
              </div>
              {profile.familyValues && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Family Values</p>
                  <p className="text-sm">{profile.familyValues}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lifestyle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Lifestyle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                {profile.drinking && (
                  <div>
                    <p className="text-sm text-muted-foreground">Drinking</p>
                    <p className="font-medium">{profile.drinking}</p>
                  </div>
                )}
                {profile.smoking && (
                  <div>
                    <p className="text-sm text-muted-foreground">Smoking</p>
                    <p className="font-medium">{profile.smoking}</p>
                  </div>
                )}
                {profile.dietPreference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Diet</p>
                    <p className="font-medium">{profile.dietPreference.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
              {profile.hobbies && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Hobbies & Interests</p>
                  <p className="text-sm">{profile.hobbies}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Open to Relocate</p>
                <p className="font-medium">{profile.openToRelocate ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <img
              src={selectedPhoto}
              alt="Profile photo"
              className="w-full h-auto rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
