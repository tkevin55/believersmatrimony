'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ReportReview } from '@/components/admin/report-review'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

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

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('PENDING')

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (status !== 'all') params.set('status', status)

      const response = await fetch(`/api/admin/reports?${params}`)
      if (!response.ok) throw new Error('Failed to fetch reports')

      const data = await response.json()
      setReports(data.reports)
      setPagination(data.pagination)

      // Auto-select first report if none selected
      if (data.reports.length > 0 && !selectedReport) {
        setSelectedReport(data.reports[0])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [pagination.page, status])

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPagination({ ...pagination, page: 1 })
    setSelectedReport(null)
  }

  const handleReportResolved = () => {
    fetchReports()
    setSelectedReport(null)
  }

  const getReasonLabel = (reason: string) => {
    return reason.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Report Management</h1>
            <p className="text-muted-foreground mt-1">
              Review and resolve user reports
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchReports}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No reports found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Reports List */}
              <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-16rem)] overflow-auto">
                {reports.map((report) => (
                  <Card
                    key={report.id}
                    className={`cursor-pointer transition-colors ${
                      selectedReport?.id === report.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">
                          {getReasonLabel(report.reason)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            report.status === 'PENDING'
                              ? 'bg-red-100 text-red-800'
                              : report.status === 'REVIEWED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {report.reported.name || report.reported.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reported by {report.reporter.name || report.reporter.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(report.createdAt).toLocaleDateString()}
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

              {/* Report Details */}
              <div className="lg:col-span-2">
                {selectedReport ? (
                  <ReportReview
                    report={selectedReport}
                    onResolved={handleReportResolved}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">Select a report to review</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
