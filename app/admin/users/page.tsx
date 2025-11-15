'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { UsersTable } from '@/components/admin/users-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, RefreshCw } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  status: string
  role: string
  createdAt: string
  lastActive: string
  profile?: {
    gender: string
    city: string | null
    state: string | null
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

function AdminUsersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [role, setRole] = useState(searchParams.get('role') || 'all')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())

      if (search) params.set('search', search)
      if (status && status !== 'all') params.set('status', status)
      if (role && role !== 'all') params.set('role', role)

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, search, status, role])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPagination({ ...pagination, page: 1 })
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPagination({ ...pagination, page: 1 })
  }

  const handleRoleChange = (value: string) => {
    setRole(value)
    setPagination({ ...pagination, page: 1 })
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and moderate user accounts
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="DELETED">Deleted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MODERATOR">Moderator</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchUsers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <UsersTable users={users} onRefresh={fetchUsers} />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <AdminUsersContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
