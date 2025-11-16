import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Coffee, Home, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Coffee className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3">
          This page isn&apos;t on the menu 🍵
        </h1>

        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Go back home
            </Button>
          </Link>

          <Link href="/discover" className="block">
            <Button variant="outline" className="w-full" size="lg">
              <Compass className="w-4 h-4 mr-2" />
              Discover matches
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Error 404: Page not found
        </p>
      </div>
    </div>
  )
}
