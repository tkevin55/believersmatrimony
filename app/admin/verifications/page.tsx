'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Verification {
  id: string
  type: string
  data: string | null
  status: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    status: string
    createdAt: string
    profile?: {
      gender: string
      dateOfBirth: string
      city: string | null
      state: string | null
    }
    photos: Array<{
      url: string
      isPrimary: boolean
    }>
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    action: 'approve' | 'reject' | null
  }>({ open: false, action: null })
  const { toast } = useToast()

  const fetchVerifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      params.set('status', 'PENDING')

      const response = await fetch(`/api/admin/verifications?${params}`)
      if (!response.ok) throw new Error('Failed to fetch verifications')

      const data = await response.json()
      setVerifications(data.verifications)
      setPagination(data.pagination)

      // Auto-select first verification if none selected
      if (data.verifications.length > 0 && !selectedVerification) {
        setSelectedVerification(data.verifications[0])
      }
    } catch (error) {
      console.error('Error fetching verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVerifications()
  }, [pagination.page])

  const handleAction = async () => {
    if (!selectedVerification || !actionDialog.action) return

    try {
      const response = await fetch(`/api/admin/verifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: selectedVerification.id,
          action: actionDialog.action
        })
      })

      if (!response.ok) throw new Error('Failed to update verification')

      toast({
        title: 'Success',
        description: `Verification ${actionDialog.action}d successfully`
      })

      // Remove the verified item from list and select next
      const updatedVerifications = verifications.filter(v => v.id !== selectedVerification.id)
      setVerifications(updatedVerifications)
      setSelectedVerification(updatedVerifications[0] || null)

      // Refresh if no more items
      if (updatedVerifications.length === 0) {
        fetchVerifications()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update verification'
      })
    } finally {
      setActionDialog({ open: false, action: null })
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

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Photo Verifications</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve user photo verifications
            </p>
          </div>

          <div className="flex gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchVerifications}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              {pagination.total} pending verification{pagination.total !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : verifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">All caught up! No pending verifications.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Verifications List */}
              <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-16rem)] overflow-auto">
                {verifications.map((verification) => (
                  <Card
                    key={verification.id}
                    className={`cursor-pointer transition-colors ${
                      selectedVerification?.id === verification.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedVerification(verification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarImage src={verification.user.image || ''} />
                          <AvatarFallback>
                            {verification.user.name?.charAt(0) ||
                              verification.user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {verification.user.name || 'No name'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {verification.user.email}
                          </p>
                        </div>
                      </div>
                      {verification.user.profile && (
                        <div className="text-xs text-muted-foreground">
                          {verification.user.profile.gender} •{' '}
                          {calculateAge(verification.user.profile.dateOfBirth)} years
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(verification.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.totalPages}
                      className="flex-1"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>

              {/* Verification Details */}
              <div className="lg:col-span-2">
                {selectedVerification ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Verification Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* User Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={selectedVerification.user.image || ''} />
                            <AvatarFallback>
                              {selectedVerification.user.name?.charAt(0) ||
                                selectedVerification.user.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {selectedVerification.user.name || 'No name'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedVerification.user.email}
                            </p>
                            {selectedVerification.user.profile && (
                              <p className="text-xs text-muted-foreground">
                                {selectedVerification.user.profile.gender} •{' '}
                                {calculateAge(selectedVerification.user.profile.dateOfBirth)} years •{' '}
                                {selectedVerification.user.profile.city},{' '}
                                {selectedVerification.user.profile.state}
                              </p>
                            )}
                          </div>
                        </div>
                        <Link href={`/admin/users/${selectedVerification.user.id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </Link>
                      </div>

                      {/* Account Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Account Status:</span>
                          <p className="font-medium">
                            <Badge variant={selectedVerification.user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                              {selectedVerification.user.status}
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Member Since:</span>
                          <p className="font-medium">
                            {format(new Date(selectedVerification.user.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      {/* Photos */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Profile Photos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedVerification.user.photos.length > 0 ? (
                            selectedVerification.user.photos.map((photo, index) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                <img
                                  src={photo.url}
                                  alt={`Photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {photo.isPrimary && (
                                  <Badge className="absolute top-2 left-2">Primary</Badge>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground col-span-full">
                              No photos uploaded
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Verification Photo */}
                      {selectedVerification.data && (
                        <div>
                          <h4 className="text-sm font-medium mb-3">Verification Photo</h4>
                          <div className="relative aspect-square max-w-md rounded-lg overflow-hidden border">
                            <img
                              src={selectedVerification.data}
                              alt="Verification"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Compare this verification photo with the profile photos above
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          className="flex-1"
                          onClick={() => setActionDialog({ open: true, action: 'approve' })}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => setActionDialog({ open: true, action: 'reject' })}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">Select a verification to review</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === 'approve' ? 'Approve Verification' : 'Reject Verification'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === 'approve'
                ? 'This will mark the user\'s photos as verified and notify them of approval.'
                : 'This will reject the verification request and notify the user to try again.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              Confirm {actionDialog.action === 'approve' ? 'Approval' : 'Rejection'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export const dynamic = 'force-dynamic'
