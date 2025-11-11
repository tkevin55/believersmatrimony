'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Heart, Loader2 } from 'lucide-react'

interface SendInterestDialogProps {
  receiverId: string
  receiverName: string
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export default function SendInterestDialog({
  receiverId,
  receiverName,
  trigger,
  onSuccess
}: SendInterestDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const characterLimit = 500
  const remainingChars = characterLimit - message.length

  const handleSendInterest = async () => {
    if (message.length > characterLimit) {
      toast({
        title: 'Message too long',
        description: `Please keep your message under ${characterLimit} characters`,
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          message: message.trim() || null
        })
      })

      if (response.ok) {
        toast({
          title: 'Interest Sent!',
          description: `Your interest has been sent to ${receiverName}`
        })
        setMessage('')
        setOpen(false)
        onSuccess?.()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to send interest',
        })
      }
    } catch (error) {
      console.error('Error sending interest:', error)
      toast({
        title: 'Error',
        description: 'Failed to send interest. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Heart className="h-4 w-4 mr-2" />
            Send Interest
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Interest to {receiverName}</DialogTitle>
          <DialogDescription>
            Let them know you're interested! You can include an optional message to introduce yourself.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Write a brief message introducing yourself..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Keep it respectful and genuine
              </p>
              <p className={remainingChars < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                {remainingChars} characters remaining
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendInterest}
            disabled={loading || remainingChars < 0}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Send Interest
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
