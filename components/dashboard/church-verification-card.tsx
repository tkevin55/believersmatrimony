'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Church, CheckCircle2, Clock, XCircle, AlertCircle, Send, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ChurchVerification {
  id: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'
  pastorName: string
  pastorPhone: string
  churchName: string
  churchAddress?: string
  requestedAt: string
  expiresAt: string
  verifiedAt?: string
  verificationMessage?: string
}

export default function ChurchVerificationCard() {
  const { toast } = useToast()
  const [verification, setVerification] = useState<ChurchVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    pastorName: '',
    pastorPhone: '',
    churchName: '',
    churchAddress: '',
  })

  useEffect(() => {
    fetchVerificationStatus()
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/verification/church')
      if (response.ok) {
        const data = await response.json()
        setVerification(data.verification)
      }
    } catch (error) {
      console.error('Error fetching verification:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.pastorName || !formData.pastorPhone || !formData.churchName) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/verification/church', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit verification')
      }

      toast({
        title: '✓ Verification Request Sent',
        description: 'Your pastor will receive a verification message shortly.',
      })

      setVerification(data.verification)
      setShowForm(false)
      setFormData({
        pastorName: '',
        pastorPhone: '',
        churchName: '',
        churchAddress: '',
      })
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit verification request',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this verification request?')) {
      return
    }

    try {
      const response = await fetch('/api/verification/church', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel verification')
      }

      toast({
        title: 'Verification Cancelled',
        description: 'Your verification request has been cancelled',
      })

      setVerification(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel verification',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Already verified
  if (verification?.status === 'VERIFIED') {
    return (
      <Card className="border-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Church Verified
              </CardTitle>
              <CardDescription>Your church membership has been verified</CardDescription>
            </div>
            <Badge variant="default" className="bg-green-500">
              VERIFIED
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Verified by:</span>
                <span className="font-medium ml-2">{verification.pastorName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Church:</span>
                <span className="font-medium ml-2">{verification.churchName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Verified on:</span>
                <span className="font-medium ml-2">
                  {verification.verifiedAt &&
                    new Date(verification.verifiedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
            <p>Your profile now displays a verified badge, building trust with other members.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Pending verification
  if (verification?.status === 'PENDING') {
    return (
      <Card className="border-orange-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Verification Pending
              </CardTitle>
              <CardDescription>Waiting for your pastor to verify</CardDescription>
            </div>
            <Badge variant="outline" className="border-orange-500 text-orange-600">
              PENDING
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Pastor/Elder:</span>
                <span className="font-medium ml-2">{verification.pastorName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium ml-2">{verification.pastorPhone}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Church:</span>
                <span className="font-medium ml-2">{verification.churchName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Expires:</span>
                <span className="font-medium ml-2">
                  {new Date(verification.expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 text-orange-500" />
            <p>
              We've sent a verification request to {verification.pastorName}. They have 7 days to respond.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cancel Request
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Rejected verification
  if (verification?.status === 'REJECTED') {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Verification Declined
              </CardTitle>
              <CardDescription>Your verification request was declined</CardDescription>
            </div>
            <Badge variant="destructive">DECLINED</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Declined by:</span>
                <span className="font-medium ml-2">{verification.pastorName}</span>
              </div>
              {verification.verificationMessage && (
                <div>
                  <span className="text-muted-foreground">Reason:</span>
                  <p className="mt-1 text-sm">{verification.verificationMessage}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>You can submit a new verification request with updated information.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto"
          >
            Submit New Request
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // No verification - show form or CTA
  if (!showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Church className="h-5 w-5" />
            Church Verification
          </CardTitle>
          <CardDescription>
            Get your profile verified by your church elder or pastor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100 mb-3 font-medium">
              Why get verified?
            </p>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Build trust with other members</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Get a verified badge on your profile</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Increase profile visibility</span>
              </li>
            </ul>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              We'll send a verification request to your church elder or pastor. They will receive a
              message explaining about Believers Matrimony and asking them to confirm your membership.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Send className="h-4 w-4 mr-2" />
            Request Verification
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Verification form
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Church className="h-5 w-5" />
            Church Verification Request
          </CardTitle>
          <CardDescription>
            Provide your church elder or pastor's details for verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pastorName">
              Pastor/Elder Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pastorName"
              placeholder="e.g., Pastor John Smith"
              value={formData.pastorName}
              onChange={(e) => setFormData({ ...formData, pastorName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pastorPhone">
              Pastor/Elder Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pastorPhone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.pastorPhone}
              onChange={(e) => setFormData({ ...formData, pastorPhone: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Include country code. We'll send verification request via SMS/WhatsApp.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="churchName">
              Church Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="churchName"
              placeholder="e.g., Grace Community Church"
              value={formData.churchName}
              onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="churchAddress">Church Address (Optional)</Label>
            <Textarea
              id="churchAddress"
              placeholder="Street, City, State"
              value={formData.churchAddress}
              onChange={(e) => setFormData({ ...formData, churchAddress: e.target.value })}
              rows={2}
            />
          </div>

          <div className="bg-muted rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">What happens next?</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Your pastor will receive a verification message</li>
              <li>They can verify you by clicking a secure link</li>
              <li>You'll get a verified badge on your profile</li>
              <li>The process takes just a few minutes</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Verification Request
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
