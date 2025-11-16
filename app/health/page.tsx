'use client'

import React, { useState, useEffect } from 'react'
import { Activity, Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface HealthStatus {
  status: 'ok' | 'degraded'
  db: 'up' | 'down'
  timestamp?: string
  error?: string
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        setHealth(data)
        setFetchError(false)
      } catch (error) {
        console.error('Failed to fetch health status:', error)
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  const isHealthy = health?.status === 'ok' && health?.db === 'up'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="bg-card rounded-2xl shadow-lg border p-8">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">System Health</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-lg text-muted-foreground">
                Checking system health…
              </span>
            </div>
          ) : fetchError ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
              <p className="text-lg font-semibold text-destructive">
                Unable to check health right now
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try again later or contact support if the issue persists.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Status */}
              <div
                className={`rounded-lg p-6 border-2 ${
                  isHealthy
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                    : 'bg-destructive/10 border-destructive/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isHealthy ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-destructive" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">
                      System Status: {isHealthy ? 'OK' : 'Degraded'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {health?.timestamp &&
                        `Last checked: ${new Date(health.timestamp).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Database Status */}
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Database</h3>
                      <p className="text-sm text-muted-foreground">
                        PostgreSQL via Prisma
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      health?.db === 'up'
                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {health?.db === 'up' ? '● Connected' : '● Down'}
                  </div>
                </div>
                {health?.error && (
                  <p className="text-sm text-destructive mt-3">{health.error}</p>
                )}
              </div>

              {/* Additional Info */}
              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                <p>Kaapi Connect Health Monitor</p>
                <p className="mt-1">
                  Monitoring application and database connectivity
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
