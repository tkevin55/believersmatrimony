'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Search, MessageCircle, User, Bell, Menu, LogOut, Settings, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationsDropdown } from '@/components/notifications-dropdown'
import { getInitials } from '@/lib/utils'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  if (status === 'loading') {
    return <HeaderSkeleton />
  }

  if (!session) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-bold text-xl">Believers Matrimony</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/discover" className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span className="font-bold text-xl hidden sm:inline-block">Believers Matrimony</span>
          <span className="font-bold text-xl sm:hidden">BM</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-6">
          <Link
            href="/discover"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/discover') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Discover
          </Link>
          <Link
            href="/search"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/search') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Search
          </Link>
          <Link
            href="/messages"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/messages') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Messages
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Dashboard
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                <Link
                  href="/discover"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                    isActive('/discover') ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  <span>Discover</span>
                </Link>
                <Link
                  href="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                    isActive('/search') ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                    isActive('/messages') ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Messages</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                    isActive('/dashboard') ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                      isActive('/admin') ? 'bg-primary/10 text-primary' : ''
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="border-t pt-4">
                  <Link
                    href="/profile/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-md"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/auth/login' })
                    }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-md w-full text-left text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                  <AvatarFallback>{getInitials(session.user.name || 'U')}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
        </div>
      </div>
    </header>
  )
}
