'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Sparkles, Heart, MessageCircle, Eye, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SubscriptionData {
  tier: string
  status: string
  endDate: string | null
}

export default function PremiumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscription()
    }
  }, [session])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const handleUpgrade = async (tier: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upgrade')
      }

      const data = await response.json()

      toast({
        title: '🎉 Upgrade Successful!',
        description: `You are now on the ${tier} plan. Enjoy unlimited features!`,
      })

      // Refresh subscription data
      fetchSubscription()

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: any) {
      toast({
        title: 'Upgrade Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isPremium = subscription?.tier === 'PREMIUM' || subscription?.tier === 'PREMIUM_PLUS'

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Upgrade to Premium</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find your perfect match without limits. Unlock unlimited likes, super likes, and interests to connect with believers across the platform.
        </p>
      </div>

      {/* Current Plan Badge */}
      {isPremium && subscription && (
        <div className="text-center mb-8">
          <Badge variant="default" className="text-lg px-6 py-2">
            <Crown className="h-4 w-4 mr-2" />
            Current Plan: {subscription.tier}
          </Badge>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Get started with basic features</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">₹0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">10 Likes per day</p>
                  <p className="text-sm text-muted-foreground">Show interest in profiles</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">5 Super Likes per week</p>
                  <p className="text-sm text-muted-foreground">Stand out from the crowd</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">15 Interests per week</p>
                  <p className="text-sm text-muted-foreground">Send personalized messages</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Profile creation</p>
                  <p className="text-sm text-muted-foreground">Create and manage your profile</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Search & filters</p>
                  <p className="text-sm text-muted-foreground">Find profiles by preferences</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              disabled={!isPremium}
            >
              {!isPremium ? 'Current Plan' : 'Downgrade'}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="relative border-primary shadow-lg scale-105">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Badge className="px-4 py-1 bg-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              MOST POPULAR
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              Premium
            </CardTitle>
            <CardDescription>Unlimited connections and features</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">₹999</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <Zap className="h-4 w-4 text-primary" />
                    Unlimited Likes
                  </p>
                  <p className="text-sm text-muted-foreground">Like as many profiles as you want</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Unlimited Super Likes
                  </p>
                  <p className="text-sm text-muted-foreground">Show extra interest without limits</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Unlimited Interests
                  </p>
                  <p className="text-sm text-muted-foreground">Send personalized messages anytime</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <Eye className="h-4 w-4 text-primary" />
                    See who liked you
                  </p>
                  <p className="text-sm text-muted-foreground">View all likes and super likes</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Priority profile visibility</p>
                  <p className="text-sm text-muted-foreground">Appear first in search results</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Advanced filters</p>
                  <p className="text-sm text-muted-foreground">Find your perfect match faster</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Ad-free experience</p>
                  <p className="text-sm text-muted-foreground">Browse without interruptions</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleUpgrade('PREMIUM')}
              disabled={loading || subscription?.tier === 'PREMIUM'}
            >
              {loading ? 'Processing...' : subscription?.tier === 'PREMIUM' ? 'Current Plan' : 'Upgrade to Premium'}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plus Plan */}
        <Card className="relative border-purple-500">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Crown className="h-6 w-6 text-purple-500" />
              Premium Plus
            </CardTitle>
            <CardDescription>Everything in Premium + exclusive perks</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">₹1,999</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium mb-2">
                <Check className="h-5 w-5" />
                Everything in Premium, plus:
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Dedicated support</p>
                  <p className="text-sm text-muted-foreground">Priority customer service</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Profile verification badge</p>
                  <p className="text-sm text-muted-foreground">Get verified faster</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Exclusive matchmaking</p>
                  <p className="text-sm text-muted-foreground">AI-powered recommendations</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Monthly video profile</p>
                  <p className="text-sm text-muted-foreground">Stand out with video intro</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Read receipts</p>
                  <p className="text-sm text-muted-foreground">Know when messages are read</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
              onClick={() => handleUpgrade('PREMIUM_PLUS')}
              disabled={loading || subscription?.tier === 'PREMIUM_PLUS'}
            >
              {loading ? 'Processing...' : subscription?.tier === 'PREMIUM_PLUS' ? 'Current Plan' : 'Upgrade to Premium Plus'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Trust Indicators */}
      <div className="bg-muted/50 rounded-lg p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-6">Why Upgrade to Premium?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Find Love Faster</h3>
              <p className="text-sm text-muted-foreground">
                Premium members find matches 3x faster than free users. Don't miss your perfect match!
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Stand Out</h3>
              <p className="text-sm text-muted-foreground">
                Your profile gets 5x more visibility with premium badge and priority placement.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Unlimited Connections</h3>
              <p className="text-sm text-muted-foreground">
                No more waiting for quotas to reset. Connect with as many believers as you want.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Premium Support</h3>
              <p className="text-sm text-muted-foreground">
                Get priority support from our team whenever you need help finding your match.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! You can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, UPI, net banking, and digital wallets through our secure payment gateway.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is my data secure?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Absolutely! We use bank-level encryption to protect your personal and payment information. Your privacy is our top priority.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What happens if I don't find a match?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We're confident you'll find meaningful connections. However, we're committed to helping every member succeed. Contact our support team if you need personalized assistance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-16 mb-8">
        <p className="text-muted-foreground mb-4">
          Join thousands of believers who found their perfect match with Premium
        </p>
        <Button size="lg" onClick={() => handleUpgrade('PREMIUM')} disabled={loading || isPremium}>
          <Crown className="h-5 w-5 mr-2" />
          {isPremium ? 'Already Premium' : 'Start Your Premium Journey'}
        </Button>
      </div>
    </div>
  )
}
