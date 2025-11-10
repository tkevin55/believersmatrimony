import { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen,
  Heart,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Community Guidelines - Believers Matrimony',
  description: 'Community guidelines and code of conduct for Believers Matrimony members',
}

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Guidelines
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our guidelines help create a respectful, faith-centered community where members can
            safely search for their life partner. By using Believers Matrimony, you agree to
            follow these guidelines.
          </p>
        </div>

        {/* Core Values */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-600" />
              Our Core Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Faith First</h3>
                <p className="text-sm text-gray-600">
                  A Christ-centered approach to finding your life partner
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Respect</h3>
                <p className="text-sm text-gray-600">
                  Treating everyone with kindness and dignity
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Safety</h3>
                <p className="text-sm text-gray-600">
                  Creating a secure environment for all members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expected Behavior */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Expected Behavior
            </CardTitle>
            <CardDescription>
              We expect all members to:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Be Authentic:</strong> Use real photos and accurate information in your profile.
                  Honesty is the foundation of any meaningful relationship.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Be Respectful:</strong> Treat others with kindness, even if you're not interested.
                  Remember that everyone is on their own journey.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Be Appropriate:</strong> Keep conversations and content suitable for a faith-based
                  platform. Maintain godly boundaries.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Be Patient:</strong> Finding the right person takes time. Don't rush or pressure
                  others into decisions they're not ready for.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Be Responsive:</strong> If someone reaches out, respond politely even if you're
                  not interested. A simple "thank you, but I don't think we're a match" goes a long way.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Be Protective:</strong> Guard your personal information and be cautious about
                  sharing details until you feel comfortable.
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Prohibited Content & Behavior */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Prohibited Content & Behavior
            </CardTitle>
            <CardDescription>
              The following are strictly prohibited and may result in account suspension or termination:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Profile Content
                </h4>
                <ul className="space-y-2 text-gray-700 ml-6">
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Fake profiles or impersonating others</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Inappropriate, sexually suggestive, or revealing photos</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Photos containing minors</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>False information about age, marital status, or other key details</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Promotional content or business solicitation</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Communication
                </h4>
                <ul className="space-y-2 text-gray-700 ml-6">
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Harassment, bullying, or threatening behavior</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Sexually explicit or inappropriate messages</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Hate speech or discrimination based on race, gender, religion, etc.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Spam or repetitive unwanted messages</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Sharing explicit content or links to inappropriate websites</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Fraudulent Activity
                </h4>
                <ul className="space-y-2 text-gray-700 ml-6">
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Requesting money or financial assistance</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Promoting get-rich-quick schemes or investment opportunities</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Romance scams or catfishing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Using the platform for any illegal activities</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Platform Misuse
                </h4>
                <ul className="space-y-2 text-gray-700 ml-6">
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Using bots or automated tools to interact with profiles</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Creating multiple accounts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Attempting to bypass platform features or security measures</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">✕</span>
                    <span>Scraping or collecting user data</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consequences */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Consequences of Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Violations of our community guidelines may result in the following actions:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Warning</h4>
                <p className="text-sm text-yellow-800">
                  First-time or minor violations may receive a warning with guidance on proper conduct.
                </p>
              </div>
              <div className="border-l-4 border-orange-500 bg-orange-50 p-4">
                <h4 className="font-semibold text-orange-900 mb-2">Temporary Suspension</h4>
                <p className="text-sm text-orange-800">
                  Repeated or more serious violations may result in temporary account suspension (7-30 days).
                </p>
              </div>
              <div className="border-l-4 border-red-500 bg-red-50 p-4">
                <h4 className="font-semibold text-red-900 mb-2">Permanent Ban</h4>
                <p className="text-sm text-red-800">
                  Severe violations, illegal activity, or repeated offenses will result in permanent
                  account termination and possible legal action.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Reporting Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you see content or behavior that violates our guidelines, please report it:
            </p>
            <ul className="space-y-3 text-gray-700 mb-6">
              <li className="flex gap-3">
                <span className="text-purple-600">1.</span>
                <span>Click the "Report" button on the user's profile or message</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600">2.</span>
                <span>Select the most appropriate reason for your report</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600">3.</span>
                <span>Provide detailed information about the violation</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600">4.</span>
                <span>Our team will review and take appropriate action within 24-48 hours</span>
              </li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> All reports are confidential. False reports made with malicious
                intent may result in action against the reporting account.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Faith-Centered Expectations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-600" />
              Faith-Centered Expectations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              As a faith-based platform, we ask that all members:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-purple-600">•</span>
                <span>Demonstrate Christian values in all interactions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600">•</span>
                <span>Respect different denominational backgrounds and worship styles</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600">•</span>
                <span>Keep conversations and intentions honorable and God-honoring</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600">•</span>
                <span>Approach the search for a life partner with prayer and discernment</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600">•</span>
                <span>Be understanding that everyone is at different stages in their faith journey</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle>Guidelines Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We may update these guidelines from time to time to reflect changes in our community
              or platform features. Continued use of Believers Matrimony constitutes acceptance of
              the current guidelines.
            </p>
            <p className="text-sm text-gray-600">
              Last updated: November 10, 2025
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/safety">
                <Button variant="outline">
                  View Safety Tips
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Closing Note */}
        <div className="text-center mt-12 text-gray-600">
          <p className="mb-2">
            Thank you for helping us maintain a safe, respectful, and faith-centered community.
          </p>
          <p className="text-sm italic">
            "Love one another as I have loved you." - John 13:34
          </p>
        </div>
      </div>
    </div>
  )
}
