'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { User, Lock, Bell, Eye, Heart, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ChurchVerificationCard from './church-verification-card'

export default function SettingsTab() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Account settings
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  // Privacy settings
  const [visibilityMode, setVisibilityMode] = useState('all')
  const [isVisible, setIsVisible] = useState(true)

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [matchNotifications, setMatchNotifications] = useState(true)
  const [messageNotifications, setMessageNotifications] = useState(true)
  const [interestNotifications, setInterestNotifications] = useState(true)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setEmail(session.user.email || '')
    }
    fetchSettings()
  }, [session])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setPhoneNumber(data.phoneNumber || '')
        setVisibilityMode(data.profile?.visibilityMode || 'all')
        setIsVisible(data.profile?.isVisible ?? true)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSaveAccount = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneNumber })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Account settings updated successfully'
        })
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update account settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrivacy = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibilityMode, isVisible })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Privacy settings updated successfully'
        })
      } else {
        throw new Error('Failed to update privacy settings')
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications,
          matchNotifications,
          messageNotifications,
          interestNotifications
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification preferences updated successfully'
        })
      } else {
        throw new Error('Failed to update notification preferences')
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Account Information</CardTitle>
          </div>
          <CardDescription>
            Manage your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if you need help.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <Button onClick={handleSaveAccount} disabled={loading}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <CardTitle>Privacy Settings</CardTitle>
          </div>
          <CardDescription>
            Control who can see your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-visible">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to others
              </p>
            </div>
            <Switch
              id="profile-visible"
              checked={isVisible}
              onCheckedChange={setIsVisible}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility-mode">Visibility Mode</Label>
            <Select value={visibilityMode} onValueChange={setVisibilityMode}>
              <SelectTrigger id="visibility-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="matched_only">Matched Users Only</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Control who can view your detailed profile
            </p>
          </div>

          <Button onClick={handleSavePrivacy} disabled={loading}>
            Save Privacy Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="match-notifications">New Matches</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new matches
              </p>
            </div>
            <Switch
              id="match-notifications"
              checked={matchNotifications}
              onCheckedChange={setMatchNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="message-notifications">Messages</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new messages
              </p>
            </div>
            <Switch
              id="message-notifications"
              checked={messageNotifications}
              onCheckedChange={setMessageNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="interest-notifications">Interests</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about interest requests
              </p>
            </div>
            <Switch
              id="interest-notifications"
              checked={interestNotifications}
              onCheckedChange={setInterestNotifications}
            />
          </div>

          <Button onClick={handleSaveNotifications} disabled={loading}>
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Partner Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <CardTitle>Partner Preferences</CardTitle>
          </div>
          <CardDescription>
            Set your ideal match criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => router.push('/preferences')}
            className="w-full sm:w-auto"
          >
            Edit Partner Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Church Verification */}
      <ChurchVerificationCard />

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => router.push('/auth/change-password')}
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                // Handle account deletion
                toast({
                  title: 'Account deletion',
                  description: 'Please contact support to delete your account',
                })
              }
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
