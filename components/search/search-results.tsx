'use client'

import { ProfileCardCompact } from './profile-card-compact'
import { CoconutTreeIllustration } from '@/components/illustrations/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, SearchX } from 'lucide-react'

interface ProfileResult {
  id: string
  name: string | null
  age: number
  gender: string
  location: string
  interestTags?: string[]
  politicalLeaning?: string | null
  homeDistrict?: string | null
  educationLevel?: string | null
  occupation?: string | null
  primaryPhoto: string | null
  matchPercentage: number
  isVerified?: boolean
  isOnline?: boolean
}

interface SearchResultsProps {
  results: ProfileResult[]
  isLoading: boolean
  pagination: {
    page: number
    totalPages: number
    hasMore: boolean
    total: number
  }
  onLoadMore: () => void
  onPageChange: (page: number) => void
}

export function SearchResults({
  results,
  isLoading,
  pagination,
  onLoadMore,
  onPageChange,
}: SearchResultsProps) {
  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Empty state with Kerala illustration
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <CoconutTreeIllustration className="h-40 w-40 mb-8" />
      <h3 className="text-2xl font-bold mb-3">No matches brewing with these filters 🍵</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6 leading-relaxed">
        Great connections are out there! Try widening your search to discover more profiles.
      </p>
      <div className="bg-secondary/30 rounded-xl p-6 max-w-md">
        <p className="font-semibold text-sm mb-3 text-foreground/80">Try these tweaks:</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-primary">•</span>
            <span>Expand your age or height preferences</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">•</span>
            <span>Broaden your location search</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">•</span>
            <span>Add more interests or Kerala districts</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">•</span>
            <span>Adjust education or lifestyle filters</span>
          </li>
        </ul>
      </div>
    </div>
  )

  // Pagination controls
  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <div className="text-sm text-muted-foreground">
        Showing page {pagination.page} of {pagination.totalPages}
        <span className="ml-2">({pagination.total} total profiles)</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1 || isLoading}
        >
          Previous
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNum: number

            if (pagination.totalPages <= 5) {
              pageNum = i + 1
            } else if (pagination.page <= 3) {
              pageNum = i + 1
            } else if (pagination.page >= pagination.totalPages - 2) {
              pageNum = pagination.totalPages - 4 + i
            } else {
              pageNum = pagination.page - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className="w-10"
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasMore || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  )

  // Main render
  if (isLoading && results.length === 0) {
    return <LoadingSkeleton />
  }

  if (!isLoading && results.length === 0) {
    return <EmptyState />
  }

  return (
    <div>
      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((profile) => (
          <ProfileCardCompact key={profile.id} {...profile} />
        ))}
      </div>

      {/* Loading indicator for pagination */}
      {isLoading && results.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && <PaginationControls />}
    </div>
  )
}
