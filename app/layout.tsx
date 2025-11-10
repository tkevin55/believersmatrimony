import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Believers Matrimony - Christian Matrimonial Platform',
  description: 'Find your life partner in faith. A matrimonial platform for Protestant Christians.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen pb-16 md:pb-0">
            {children}
          </main>
          <MobileNav />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
