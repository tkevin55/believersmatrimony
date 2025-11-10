'use client'

import { useState } from 'react'
import { Ban, Loader2 } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'

interface BlockDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  onBlockSuccess?: () => void
}

export function BlockDialog({
  isOpen,
  onClose,
  userId,
  userName,
  onBlockSuccess
}: BlockDialogProps) {
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleBlock = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockedId: userId,
          reason: reason || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'User Blocked',
          description: `You have successfully blocked ${userName}. You will no longer see each other's profiles.`,
          variant: 'default'
        })
        onBlockSuccess?.()
        handleClose()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to block user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Block {userName}?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to block this user? This action will:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="font-medium text-sm text-yellow-900 mb-2">
              What happens when you block someone:
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>They won't be able to see your profile</li>
              <li>You won't be able to see their profile</li>
              <li>Any existing matches will be removed</li>
              <li>You won't be able to message each other</li>
              <li>They won't be notified that you blocked them</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Why are you blocking this user? This helps us improve our community safety."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Your reason is private and won't be shared with the user.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> You can unblock this user later from your settings
              if you change your mind.
            </p>
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
            variant="destructive"
            onClick={handleBlock}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Blocking...
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Block User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
