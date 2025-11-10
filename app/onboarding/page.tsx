import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OnboardingForm from '@/components/onboarding-form'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Check if user already has a profile
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  })

  // If profile exists, redirect to discover page
  if (profile) {
    redirect('/discover')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Help us find your perfect match by completing your profile
          </p>
        </div>
        <OnboardingForm userId={session.user.id} />
      </div>
    </div>
  )
}
