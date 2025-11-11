'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { AlertTriangle, CheckCircle, Ban, Trash2, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Report {
  id: string
  reason: string
  description: string | null
  status: string
  createdAt: string
  reporter: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  reported: {
    id: string
    name: string | null
    email: string
    image: string | null
    status: string
    profile?: {
      gender: string
      district: string | null
      state: string | null
    }
  }
}

interface ReportReviewProps {
  report: Report
  onResolved: () => void
}

export function ReportReview({ report, onResolved }: ReportReviewProps) {
  const [reviewNote, setReviewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'dismiss' | 'warn' | 'suspend' | 'delete' | null>(null)
  const { toast } = useToast()

  const handleAction = async (action: 'dismiss' | 'warn' | 'suspend' | 'delete') => {
    setSelectedAction(action)
  }

  const confirmAction = async () => {
    if (!selectedAction) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reports/${report.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedAction,
          reviewNote: reviewNote || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to resolve report')
      }

      toast({
        title: 'Success',
        description: `Report ${selectedAction}ed successfully`
      })

      onResolved()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve report'
      })
    } finally {
      setLoading(false)
      setSelectedAction(null)
    }
  }

  const getReasonLabel = (reason: string) => {
    return reason.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const actionConfig = {
    dismiss: {
      title: 'Dismiss Report',
      description: 'This will mark the report as resolved without taking any action against the user.',
      icon: XCircle,
      color: 'text-gray-600'
    },
    warn: {
      title: 'Warn User',
      description: 'This will send a warning notification to the reported user.',
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    suspend: {
      title: 'Suspend User',
      description: 'This will suspend the reported user account.',
      icon: Ban,
      color: 'text-orange-600'
    },
    delete: {
      title: 'Delete User',
      description: 'This will mark the reported user account as deleted. This action is reversible.',
      icon: Trash2,
      color: 'text-red-600'
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Reason:</span>
              <Badge variant="destructive">{getReasonLabel(report.reason)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge>{report.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Reported On:</span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>

          {report.description && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Description:</span>
              <p className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
                {report.description}
              </p>
            </div>
          )}

          {/* Reporter */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Reporter:</span>
            <Link href={`/admin/users/${report.reporter.id}`}>
              <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <Avatar>
                  <AvatarImage src={report.reporter.image || ''} />
                  <AvatarFallback>
                    {report.reporter.name?.charAt(0) || report.reporter.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{report.reporter.name || 'No name'}</div>
                  <div className="text-sm text-muted-foreground">{report.reporter.email}</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Reported User */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Reported User:</span>
            <Link href={`/admin/users/${report.reported.id}`}>
              <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <Avatar>
                  <AvatarImage src={report.reported.image || ''} />
                  <AvatarFallback>
                    {report.reported.name?.charAt(0) || report.reported.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{report.reported.name || 'No name'}</div>
                    <Badge variant={report.reported.status === 'ACTIVE' ? 'default' : 'destructive'}>
                      {report.reported.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{report.reported.email}</div>
                  {report.reported.profile && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {report.reported.profile.gender} • {report.reported.profile.district}, {report.reported.profile.state}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Review Notes */}
          <div className="space-y-2">
            <label htmlFor="reviewNote" className="text-sm font-medium">
              Review Notes (Optional):
            </label>
            <Textarea
              id="reviewNote"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Add notes about your decision..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Actions:</span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleAction('dismiss')}
                disabled={loading || report.status !== 'PENDING'}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Dismiss
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('warn')}
                disabled={loading || report.status !== 'PENDING'}
                className="gap-2 text-yellow-600 hover:text-yellow-700"
              >
                <AlertTriangle className="h-4 w-4" />
                Warn User
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('suspend')}
                disabled={loading || report.status !== 'PENDING'}
                className="gap-2 text-orange-600 hover:text-orange-700"
              >
                <Ban className="h-4 w-4" />
                Suspend User
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('delete')}
                disabled={loading || report.status !== 'PENDING'}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!selectedAction} onOpenChange={(open) => {
        if (!open) setSelectedAction(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAction && actionConfig[selectedAction].title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction && actionConfig[selectedAction].description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
