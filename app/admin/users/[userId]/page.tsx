'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { ArrowLeft, Ban, CheckCircle, Trash2, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const userId = params.userId as string

  const [user, setUser] = useState<any>(null)
  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    action: 'suspend' | 'activate' | 'delete' | null
  }>({ open: false, action: null })

  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user details')

      const data = await response.json()
      setUser(data.user)
      setActivity(data.activity)
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load user details'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const handleAction = async () => {
    if (!actionDialog.action) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionDialog.action })
      })

      if (!response.ok) throw new Error('Failed to update user')

      toast({
        title: 'Success',
        description: `User ${actionDialog.action}d successfully`
      })

      fetchUserDetails()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user'
      })
    } finally {
      setActionDialog({ open: false, action: null })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">User Details</h1>
              <div className="flex gap-2">
                {user.status === 'ACTIVE' ? (
                  <Button
                    variant="outline"
                    onClick={() => setActionDialog({ open: true, action: 'suspend' })}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setActionDialog({ open: true, action: 'activate' })}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => setActionDialog({ open: true, action: 'delete' })}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* User Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.image || ''} />
                    <AvatarFallback className="text-2xl">
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{user.name || 'No name'}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{user.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email Verified:</span>
                    <p className="font-medium">{user.emailVerified ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Joined:</span>
                    <p className="font-medium">{format(new Date(user.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Active:</span>
                    <p className="font-medium">{format(new Date(user.lastActive), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Interests Sent</span>
                  <span className="font-semibold">{user._count?.sentInterests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Interests Received</span>
                  <span className="font-semibold">{user._count?.receivedInterests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Matches</span>
                  <span className="font-semibold">
                    {(user._count?.matches1 || 0) + (user._count?.matches2 || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Messages Sent</span>
                  <span className="font-semibold">{user._count?.sentMessages || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reports Initiated</span>
                  <span className="font-semibold">{user._count?.reportsInitiated || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reports Received</span>
                  <span className="font-semibold text-red-600">{user._count?.reportsReceived || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Profile Info */}
            {user.profile && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <p className="font-medium">{user.profile.gender}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date of Birth:</span>
                      <p className="font-medium">
                        {format(new Date(user.profile.dateOfBirth), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Denomination:</span>
                      <p className="font-medium">{user.profile.denomination}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium">
                        {user.profile.district}, {user.profile.state}, {user.profile.country}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Occupation:</span>
                      <p className="font-medium">{user.profile.occupation || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Education:</span>
                      <p className="font-medium">{user.profile.educationLevel || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Reports */}
            {activity?.recentReports && activity.recentReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activity.recentReports.map((report: any) => (
                      <div key={report.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={report.status === 'PENDING' ? 'destructive' : 'default'}>
                            {report.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(report.createdAt), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{report.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.reporterId === userId ? 'Reported' : 'Was reported by'}{' '}
                          {report.reporterId === userId
                            ? report.reported.name || report.reported.email
                            : report.reporter.name || report.reporter.email}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === 'delete' ? 'Delete User' :
               actionDialog.action === 'suspend' ? 'Suspend User' : 'Activate User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionDialog.action} this user?
              {actionDialog.action === 'delete' && ' This will mark the account as deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
