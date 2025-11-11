'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function SeedDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/seed-test-data?secret=seed-test-data-2024')
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to seed database')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Seed Test Database</CardTitle>
          <CardDescription>
            Click the button below to populate your database with 50 test profiles (25 male + 25 female)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && !error && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What will be created:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>2 test accounts: john.test@demo.com & sarah.test@demo.com</li>
                  <li>48 random profiles (24 male + 24 female)</li>
                  <li>All profiles with complete information</li>
                  <li>Partner preferences for realistic matching</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">Test Credentials:</h3>
                <div className="text-sm text-amber-800 space-y-1">
                  <p><strong>Male:</strong> john.test@demo.com / Test@123</p>
                  <p><strong>Female:</strong> sarah.test@demo.com / Test@123</p>
                </div>
              </div>

              <Button
                onClick={handleSeed}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating profiles... (30-60 seconds)
                  </>
                ) : (
                  'Seed Database with 50 Profiles'
                )}
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Success!</h3>
                </div>
                <div className="text-sm text-green-800 space-y-2">
                  <p><strong>Test Accounts:</strong> {result.summary.testAccountsCreated} created</p>
                  <p><strong>Profiles:</strong> {result.summary.profilesCreated} created</p>
                  {result.summary.errors > 0 && (
                    <p className="text-amber-700"><strong>Errors:</strong> {result.summary.errors}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Login Credentials:</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <div>
                    <p className="font-medium">Male Account:</p>
                    <p>Email: {result.credentials.male.email}</p>
                    <p>Password: {result.credentials.male.password}</p>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium">Female Account:</p>
                    <p>Email: {result.credentials.female.email}</p>
                    <p>Password: {result.credentials.female.password}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.href = '/auth/login'}
                  className="flex-1"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  Seed Again
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Error</h3>
                </div>
                <p className="text-sm text-red-800">{error}</p>
              </div>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
