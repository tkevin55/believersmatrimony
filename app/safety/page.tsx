import { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield,
  Eye,
  MessageSquare,
  UserCheck,
  AlertTriangle,
  Lock,
  Video,
  Heart,
  Flag,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Safety Tips - Believers Matrimony',
  description: 'Learn how to stay safe while finding your life partner on Believers Matrimony',
}

export default function SafetyPage() {
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
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Safety Matters
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            At Believers Matrimony, your safety is our top priority. Here are important
            guidelines to help you have a safe and positive experience while finding your life partner.
          </p>
        </div>

        {/* Safety Tips Grid */}
        <div className="grid gap-6 mb-12">
          {/* Protect Your Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600" />
                Protect Your Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Never share your full address, phone number, or email in your profile or initial messages</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Use our platform's messaging system until you feel comfortable sharing contact information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Be cautious about sharing financial information or workplace details</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Avoid posting photos that reveal identifiable locations like your home or workplace</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Take Your Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Take Your Time Getting to Know Someone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Have multiple conversations before agreeing to meet in person</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Ask questions about their faith, values, goals, and background</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Be wary of anyone who rushes the relationship or pressures you to meet quickly</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Trust your instincts - if something feels off, it probably is</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Meeting in Person */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Meeting in Person
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Always meet in a public place for your first few meetings</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Tell a friend or family member where you're going and when you'll be back</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Arrange your own transportation to and from the meeting</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Consider doing a video call before meeting in person</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Stay sober and alert during your meeting</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Recognize Red Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Recognize Red Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
                <p className="font-semibold text-orange-900 mb-2">Be cautious if someone:</p>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-orange-600">⚠</span>
                  <span>Asks for money or financial assistance</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-600">⚠</span>
                  <span>Refuses to video chat or meet in person (after reasonable time)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-600">⚠</span>
                  <span>Has inconsistent information in their profile or stories</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-600">⚠</span>
                  <span>Pressures you to move communication off the platform immediately</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-600">⚠</span>
                  <span>Professes strong feelings very quickly</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-600">⚠</span>
                  <span>Makes you feel uncomfortable or disrespects your boundaries</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-600">⚠</span>
                  <span>Has photos that seem professionally shot or too good to be true</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Verify Profiles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-600" />
                Verify Authenticity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Look for verified profiles with the verification badge</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Request a video call to verify their identity before meeting</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Be suspicious of profiles with very limited information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Do a reverse image search if photos seem suspicious</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Report Suspicious Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-600" />
                Report Suspicious Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  If you encounter suspicious behavior, inappropriate content, or anything that
                  makes you uncomfortable, please report it immediately. Your reports help keep
                  our community safe for everyone.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-red-600">•</span>
                    <span>Click the "Report" button on any profile or message</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600">•</span>
                    <span>Provide detailed information about the issue</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600">•</span>
                    <span>Our team reviews all reports within 24-48 hours</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600">•</span>
                    <span>You can also block users to prevent further contact</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Faith-Centered Safety */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                Faith-Centered Approach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Pray about your decisions and seek God's guidance</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Involve your faith community and trusted friends in your journey</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Look for someone who shares your values and commitment to faith</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600">•</span>
                  <span>Maintain appropriate boundaries that align with your beliefs</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have questions about safety or need to report an urgent issue, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> safety@believersmatrimony.com</p>
              <p><strong>Support:</strong> support@believersmatrimony.com</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/guidelines">
                <Button variant="outline">
                  View Community Guidelines
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

        {/* Footer Note */}
        <div className="text-center mt-12 text-sm text-gray-600">
          <p>
            Remember: Your safety is in your hands. Trust your instincts and don't hesitate
            to report suspicious behavior. May God guide you in finding your life partner safely.
          </p>
        </div>
      </div>
    </div>
  )
}
