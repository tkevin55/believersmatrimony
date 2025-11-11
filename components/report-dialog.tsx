'use client'

import { useState } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface ReportDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  onReportSuccess?: () => void
}

const REPORT_REASONS = [
  { value: 'INAPPROPRIATE_PHOTOS', label: 'Inappropriate Photos' },
  { value: 'FAKE_PROFILE', label: 'Fake Profile' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'SPAM', label: 'Spam or Scam' },
  { value: 'OTHER', label: 'Other' },
]

export function ReportDialog({
  isOpen,
  onClose,
  userId,
  userName,
  onReportSuccess
}: ReportDialogProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleReport = async () => {
    if (!reason) {
      toast({
        title: 'Error',
        description: 'Please select a reason for reporting',
      })
      return
    }

    if (!description || description.length < 10) {
      toast({
        title: 'Error',
        description: 'Please provide a description (at least 10 characters)',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedId: userId,
          reason,
          description
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        onReportSuccess?.()
        setTimeout(() => {
          handleClose()
        }, 3000)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to submit report',
        })
      }
    } catch (error) {
      console.error('Error reporting user:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setDescription('')
    setIsSubmitted(false)
    onClose()
  }

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              Report Submitted
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Thank you for your report</h3>
            <p className="text-sm text-muted-foreground">
              Our team will review this report and take appropriate action.
              We take all reports seriously and are committed to maintaining a safe community.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-600" />
            Report {userName}
          </DialogTitle>
          <DialogDescription>
            Help us keep our community safe by reporting inappropriate behavior or content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for reporting <span className="text-destructive">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Details <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide specific details about the issue (minimum 10 characters)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isLoading}
              className={description.length > 0 && description.length < 10 ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/10 characters minimum
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-900">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>Our team will review your report within 24-48 hours</li>
              <li>Appropriate action will be taken if we find violations</li>
              <li>Your report is confidential and anonymous</li>
              <li>False reports may result in account restrictions</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleReport}
            disabled={isLoading || !reason || description.length < 10}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Flag className="mr-2 h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
