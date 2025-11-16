import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

/**
 * Profile card skeleton with shimmer effect
 */
function ProfileCardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="overflow-hidden rounded-2xl shadow-sm border-0 bg-card">
        {/* Photo skeleton */}
        <div className="relative h-96 bg-gradient-to-b from-muted/50 to-muted animate-shimmer bg-[length:2000px_100%] bg-gradient-to-r from-muted via-muted/50 to-muted" />

        {/* Content skeleton */}
        <div className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Interest tags */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
              <Skeleton className="h-6 w-22 rounded-full" />
            </div>
          </div>

          {/* Info lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 flex-1 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, ProfileCardSkeleton }
