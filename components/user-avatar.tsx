import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name: string | null
  image: string | null | undefined
  className?: string
}

/**
 * UserAvatar component with color-coded fallback initials
 * Automatically generates a consistent pastel color based on the user's name
 * Uses neutral, culturally-safe colors that don't reveal religion, caste, or gender
 */
export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const displayName = name || 'User'
  const initials = getInitials(displayName)
  const colorClasses = getAvatarColor(displayName)

  return (
    <Avatar className={className}>
      <AvatarImage src={image || undefined} alt={displayName} />
      <AvatarFallback className={cn(colorClasses, 'font-semibold')}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
