import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OnboardingWizard from '@/components/onboarding-wizard'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Check if onboarding is already completed
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      onboardingCompleted: true,
      name: true,
      profile: {
        select: { id: true }
      }
    }
  })

  // If onboarding is completed AND profile exists, redirect to discover page
  if (user?.onboardingCompleted && user?.profile) {
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
        <OnboardingWizard userId={session.user.id} initialName={user?.name || undefined} />
      </div>
    </div>
  )
}
