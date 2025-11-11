'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Church, User, Mail, Calendar, MapPin, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VerificationDetails {
  userName: string
  userEmail: string
  churchName: string
  churchAddress?: string
  denomination: string
  pastorName: string
  requestedAt: string
  expiresAt: string
}

export default function ChurchVerificationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [details, setDetails] = useState<VerificationDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [showMessageBox, setShowMessageBox] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      fetchVerificationDetails()
    }
  }, [token])

  const fetchVerificationDetails = async () => {
    try {
      const response = await fetch(`/api/verification/church/verify?token=${token}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to load verification details')
        return
      }

      setDetails(data.verification)
    } catch (error) {
      console.error('Error fetching verification:', error)
      setError('Failed to load verification details')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please provide a reason for declining the verification',
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/verification/church/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action,
          message: message.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setSuccess(true)
      toast({
        title: action === 'approve' ? '✓ Verification Approved' : 'Verification Declined',
        description: data.message,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process verification',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleActionClick = (action: 'approve' | 'reject') => {
    setActionType(action)
    if (action === 'reject') {
      setShowMessageBox(true)
    } else {
      setShowMessageBox(false)
      handleVerification(action)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading verification details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Verification Failed</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                This verification link may be invalid, expired, or already processed.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
            >
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md border-green-500">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>Verification Complete</CardTitle>
            </div>
            <CardDescription>
              Thank you for helping us build a trusted community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm">
                {actionType === 'approve'
                  ? `You have successfully verified ${details.userName}'s church membership. They will be notified immediately.`
                  : `You have declined the verification request from ${details.userName}. They will be notified of your decision.`}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <div className="w-full text-center text-sm text-muted-foreground">
              <p className="mb-2">About Believers Matrimony</p>
              <p className="text-xs">
                A Christian matrimonial platform helping believers find their life partner.
                Church verification helps build trust and authenticity in our community.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
            >
              Visit Believers Matrimony
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 py-12">
      <div className="container max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Church className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Church Verification</h1>
          </div>
          <p className="text-muted-foreground">
            Believers Matrimony - Building Trust Through Community
          </p>
        </div>

        {/* Verification Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verification Request</CardTitle>
            <CardDescription>
              A member has requested verification of their church membership
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Member Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Member Name</p>
                  <p className="font-medium">{details.userName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{details.userEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Church className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Church</p>
                  <p className="font-medium">{details.churchName}</p>
                  {details.churchAddress && (
                    <p className="text-sm text-muted-foreground mt-1">{details.churchAddress}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Denomination</p>
                  <Badge variant="outline">{details.denomination}</Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Requested</p>
                  <p className="font-medium">
                    {new Date(details.requestedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    About This Request
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    {details.userName} has listed you as their church elder/pastor for verification on
                    Believers Matrimony, a Christian matrimonial platform. Please confirm if they are an
                    active member of your church.
                  </p>
                </div>
              </div>
            </div>

            {/* Message Box (for rejection) */}
            {showMessageBox && (
              <div className="space-y-2">
                <Label htmlFor="message">Reason for Declining (Required)</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide a brief reason..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            {!showMessageBox ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleActionClick('reject')}
                  disabled={submitting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleActionClick('approve')}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Verify Member
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowMessageBox(false)
                    setMessage('')
                    setActionType(null)
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleVerification('reject')}
                  disabled={submitting || !message.trim()}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Confirm Decline
                    </>
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>

        {/* About Section */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">About Believers Matrimony</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Believers Matrimony is a Christian matrimonial platform dedicated to helping believers find their
              God-ordained life partner. We prioritize faith, values, and community trust.
            </p>
            <p>
              Church verification helps us ensure the authenticity of our members and builds confidence within
              our community. Thank you for taking the time to help us maintain the integrity of our platform.
            </p>
            <p className="text-xs pt-2">
              If you have any questions or concerns about this verification request, please contact us at
              support@believersmatrimony.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
