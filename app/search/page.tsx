'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { FilterSidebar, SearchFilters } from '@/components/search/filter-sidebar'
import { SearchResults } from '@/components/search/search-results'
import { toast } from '@/hooks/use-toast'

const DEFAULT_FILTERS: SearchFilters = {
  ageMin: 18,
  ageMax: 80,
  heightMin: 140,
  heightMax: 220,
  denominations: [],
  locations: [],
  educationLevels: [],
  occupation: '',
  incomeRange: '',
  drinking: '',
  smoking: '',
  withPhotoOnly: false,
  verifiedOnly: false,
  onlineOnly: false,
}

interface SearchResult {
  id: string
  name: string | null
  age: number
  gender: string
  location: string
  denomination: string
  educationLevel?: string | null
  occupation?: string | null
  primaryPhoto: string | null
  matchPercentage: number
  isVerified?: boolean
  isOnline?: boolean
}

interface SearchResponse {
  results: SearchResult[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export default function SearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasMore: false,
    total: 0,
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Parse URL parameters on mount
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries())

    const parsedFilters: SearchFilters = {
      ageMin: params.ageMin ? parseInt(params.ageMin) : DEFAULT_FILTERS.ageMin,
      ageMax: params.ageMax ? parseInt(params.ageMax) : DEFAULT_FILTERS.ageMax,
      heightMin: params.heightMin ? parseInt(params.heightMin) : DEFAULT_FILTERS.heightMin,
      heightMax: params.heightMax ? parseInt(params.heightMax) : DEFAULT_FILTERS.heightMax,
      denominations: params.denominations ? params.denominations.split(',') : [],
      locations: params.locations ? params.locations.split(',') : [],
      educationLevels: params.educationLevels ? params.educationLevels.split(',') : [],
      occupation: params.occupation || '',
      incomeRange: params.incomeRange || '',
      drinking: params.drinking || '',
      smoking: params.smoking || '',
      withPhotoOnly: params.withPhotoOnly === 'true',
      verifiedOnly: params.verifiedOnly === 'true',
      onlineOnly: params.onlineOnly === 'true',
    }

    setFilters(parsedFilters)

    if (params.sortBy) {
      setSortBy(params.sortBy)
    }

    if (params.page) {
      setPagination((prev) => ({ ...prev, page: parseInt(params.page) }))
    }
  }, [searchParams])

  // Debounced search function
  const performSearch = useCallback(
    async (page: number = 1) => {
      if (status !== 'authenticated') return

      setIsLoading(true)

      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          sortBy,
        })

        // Add filters
        if (filters.ageMin !== DEFAULT_FILTERS.ageMin) {
          params.append('ageMin', filters.ageMin.toString())
        }
        if (filters.ageMax !== DEFAULT_FILTERS.ageMax) {
          params.append('ageMax', filters.ageMax.toString())
        }
        if (filters.heightMin !== DEFAULT_FILTERS.heightMin) {
          params.append('heightMin', filters.heightMin.toString())
        }
        if (filters.heightMax !== DEFAULT_FILTERS.heightMax) {
          params.append('heightMax', filters.heightMax.toString())
        }
        if (filters.denominations.length > 0) {
          params.append('denominations', filters.denominations.join(','))
        }
        if (filters.locations.length > 0) {
          params.append('locations', filters.locations.join(','))
        }
        if (filters.educationLevels.length > 0) {
          params.append('educationLevels', filters.educationLevels.join(','))
        }
        if (filters.occupation) {
          params.append('occupation', filters.occupation)
        }
        if (filters.incomeRange) {
          params.append('incomeRange', filters.incomeRange)
        }
        if (filters.drinking) {
          params.append('drinking', filters.drinking)
        }
        if (filters.smoking) {
          params.append('smoking', filters.smoking)
        }
        if (filters.withPhotoOnly) {
          params.append('withPhotoOnly', 'true')
        }
        if (filters.verifiedOnly) {
          params.append('verifiedOnly', 'true')
        }
        if (filters.onlineOnly) {
          params.append('onlineOnly', 'true')
        }

        // Update URL with search parameters
        router.push(`/search?${params.toString()}`, { scroll: false })

        // Fetch results
        const response = await fetch(`/api/search?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch search results')
        }

        const data: SearchResponse = await response.json()

        setResults(data.results)
        setPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          hasMore: data.pagination.hasMore,
          total: data.pagination.total,
        })
      } catch (error) {
        console.error('Error searching profiles:', error)
        toast({
          title: 'Error',
          description: 'Failed to search profiles. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [filters, sortBy, status, router]
  )

  // Perform search when filters or sort change
  useEffect(() => {
    if (status === 'authenticated') {
      const timeoutId = setTimeout(() => {
        performSearch(1)
      }, 500) // Debounce for 500ms

      return () => clearTimeout(timeoutId)
    }
  }, [filters, sortBy, status, performSearch])

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setSortBy('relevance')
  }

  const handlePageChange = (page: number) => {
    performSearch(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoadMore = () => {
    performSearch(pagination.page + 1)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Profiles</h1>
          <p className="text-muted-foreground">
            Find your perfect match using advanced filters
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Mobile Filter Button */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              'Searching...'
            ) : (
              <span>
                Found <strong>{pagination.total}</strong> profiles
              </span>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Best Match</SelectItem>
                <SelectItem value="recently_active">Recently Active</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Search Results */}
          <main className="lg:col-span-3">
            <SearchResults
              results={results}
              isLoading={isLoading}
              pagination={pagination}
              onLoadMore={handleLoadMore}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
