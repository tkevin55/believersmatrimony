'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log error to console for debugging
    console.error('Global error caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">
          Something went off-brew ☕
        </h1>

        <p className="text-muted-foreground mb-8">
          We encountered an unexpected error. Don&apos;t worry - your data is safe.
          Try refreshing the page or return home.
        </p>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full"
            size="lg"
          >
            Try again
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Go back home
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
