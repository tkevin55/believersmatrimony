'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

const profileSchema = z.object({
  aboutMe: z.string().min(50, 'About me should be at least 50 characters').max(1000).optional(),
  // Kaapi Connect - Interests & Values
  interestTags: z.array(z.string()).optional(),
  politicalLeaning: z.string().optional(),
  socialValues: z.array(z.string()).optional(),
  relationshipTimeline: z.string().optional(),
  wantChildren: z.string().optional(),
  livingArrangementPreference: z.string().optional(),
  weekendPreference: z.array(z.string()).optional(),
  communicationStyle: z.string().optional(),
  // Kaapi Connect - Kerala Connection
  homeDistrict: z.string().optional(),
  diasporaLocation: z.string().optional(),
  keralaConnection: z.string().optional(),
  languagePreference: z.string().optional(),
  relocationFlexibility: z.string().optional(),
  // Physical & Profile
  height: z.number().min(100).max(250).optional(),
  bodyType: z.string().optional(),
  complexion: z.string().optional(),
  languages: z.array(z.string()).optional(),
  educationLevel: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  occupation: z.string().optional(),
  incomeRange: z.string().optional(),
  parentsOccupation: z.string().optional(),
  siblingsCount: z.number().min(0).optional(),
  birthOrder: z.string().optional(),
  familyType: z.string().optional(),
  familyValues: z.string().optional(),
  drinking: z.string().optional(),
  smoking: z.string().optional(),
  dietPreference: z.string().optional(),
  hobbies: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  openToRelocate: z.boolean().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const INDIAN_LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi',
  'Gujarati', 'Punjabi', 'Odia', 'Urdu', 'Assamese', 'Konkani'
]

// Kaapi Connect - Interest Categories
const INTEREST_CATEGORIES = [
  {
    category: 'Arts & Culture',
    interests: [
      { value: 'music', label: 'Music' },
      { value: 'movies', label: 'Movies' },
      { value: 'indie_films', label: 'Indie Films' },
      { value: 'reading', label: 'Reading' },
      { value: 'painting', label: 'Painting' },
      { value: 'photography', label: 'Photography' },
      { value: 'theatre', label: 'Theatre' },
      { value: 'classical_dance', label: 'Classical Dance' },
    ]
  },
  {
    category: 'Sports & Fitness',
    interests: [
      { value: 'cricket', label: 'Cricket' },
      { value: 'football', label: 'Football' },
      { value: 'badminton', label: 'Badminton' },
      { value: 'gym', label: 'Gym' },
      { value: 'yoga', label: 'Yoga' },
      { value: 'running', label: 'Running' },
      { value: 'trekking', label: 'Trekking' },
      { value: 'cycling', label: 'Cycling' },
    ]
  },
  {
    category: 'Food & Travel',
    interests: [
      { value: 'cooking', label: 'Cooking' },
      { value: 'baking', label: 'Baking' },
      { value: 'street_food', label: 'Street Food' },
      { value: 'coffee_hunting', label: 'Coffee Hunting' },
      { value: 'road_trips', label: 'Road Trips' },
      { value: 'backpacking', label: 'Backpacking' },
      { value: 'solo_travel', label: 'Solo Travel' },
    ]
  },
  {
    category: 'Tech & Creativity',
    interests: [
      { value: 'coding', label: 'Coding' },
      { value: 'gaming', label: 'Gaming' },
      { value: 'startups', label: 'Startups' },
      { value: 'design', label: 'Design' },
      { value: 'content_creation', label: 'Content Creation' },
      { value: 'podcasts', label: 'Podcasts' },
    ]
  },
  {
    category: 'Social & Lifestyle',
    interests: [
      { value: 'pets', label: 'Pets' },
      { value: 'gardening', label: 'Gardening' },
      { value: 'home_decor', label: 'Home Decor' },
      { value: 'standup_comedy', label: 'Stand-up Comedy' },
      { value: 'board_games', label: 'Board Games' },
      { value: 'family_time', label: 'Family Time' },
    ]
  },
]

const KERALA_DISTRICTS = [
  { value: 'THIRUVANANTHAPURAM', label: 'Thiruvananthapuram' },
  { value: 'KOLLAM', label: 'Kollam' },
  { value: 'PATHANAMTHITTA', label: 'Pathanamthitta' },
  { value: 'ALAPPUZHA', label: 'Alappuzha' },
  { value: 'KOTTAYAM', label: 'Kottayam' },
  { value: 'IDUKKI', label: 'Idukki' },
  { value: 'ERNAKULAM', label: 'Ernakulam' },
  { value: 'THRISSUR', label: 'Thrissur' },
  { value: 'PALAKKAD', label: 'Palakkad' },
  { value: 'MALAPPURAM', label: 'Malappuram' },
  { value: 'KOZHIKODE', label: 'Kozhikode' },
  { value: 'WAYANAD', label: 'Wayanad' },
  { value: 'KANNUR', label: 'Kannur' },
  { value: 'KASARAGOD', label: 'Kasaragod' },
]

const DIASPORA_LOCATIONS = [
  { value: 'NONE', label: 'Not in diaspora' },
  { value: 'GULF_UAE', label: 'UAE' },
  { value: 'GULF_SAUDI', label: 'Saudi Arabia' },
  { value: 'GULF_QATAR', label: 'Qatar' },
  { value: 'GULF_KUWAIT', label: 'Kuwait' },
  { value: 'GULF_OMAN', label: 'Oman' },
  { value: 'GULF_BAHRAIN', label: 'Bahrain' },
  { value: 'USA', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CANADA', label: 'Canada' },
  { value: 'AUSTRALIA', label: 'Australia' },
  { value: 'SINGAPORE', label: 'Singapore' },
  { value: 'MALAYSIA', label: 'Malaysia' },
  { value: 'EUROPE_OTHER', label: 'Europe (Other)' },
  { value: 'OTHER', label: 'Other' },
]

export default function EditProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const height = watch('height')
  const openToRelocate = watch('openToRelocate')
  const selectedLanguages = watch('languages') || []
  const selectedInterestTags = watch('interestTags') || []
  const selectedSocialValues = watch('socialValues') || []
  const selectedWeekendPreference = watch('weekendPreference') || []

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()

      // Set form values from profile data
      if (data.profile) {
        const profile = data.profile
        reset({
          aboutMe: profile.aboutMe || '',
          // Kaapi Connect - Interests & Values
          interestTags: profile.interestTags || [],
          politicalLeaning: profile.politicalLeaning || '',
          socialValues: profile.socialValues || [],
          relationshipTimeline: profile.relationshipTimeline || '',
          wantChildren: profile.wantChildren || '',
          livingArrangementPreference: profile.livingArrangementPreference || '',
          weekendPreference: profile.weekendPreference || [],
          communicationStyle: profile.communicationStyle || '',
          // Kaapi Connect - Kerala Connection
          homeDistrict: profile.homeDistrict || '',
          diasporaLocation: profile.diasporaLocation || '',
          keralaConnection: profile.keralaConnection || '',
          languagePreference: profile.languagePreference || '',
          relocationFlexibility: profile.relocationFlexibility || '',
          // Physical & Profile
          height: profile.height || 165,
          bodyType: profile.bodyType || '',
          complexion: profile.complexion || '',
          languages: profile.languages || [],
          educationLevel: profile.educationLevel || '',
          fieldOfStudy: profile.fieldOfStudy || '',
          occupation: profile.occupation || '',
          incomeRange: profile.incomeRange || '',
          parentsOccupation: profile.parentsOccupation || '',
          siblingsCount: profile.siblingsCount || 0,
          birthOrder: profile.birthOrder || '',
          familyType: profile.familyType || '',
          familyValues: profile.familyValues || '',
          drinking: profile.drinking || '',
          smoking: profile.smoking || '',
          dietPreference: profile.dietPreference || '',
          hobbies: profile.hobbies || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || 'India',
          openToRelocate: profile.openToRelocate || false,
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleLanguage = (language: string) => {
    const current = selectedLanguages || []
    const updated = current.includes(language)
      ? current.filter(l => l !== language)
      : [...current, language]
    setValue('languages', updated)
  }

  const toggleInterestTag = (interest: string) => {
    const current = selectedInterestTags || []
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest]
    setValue('interestTags', updated)
  }

  const toggleSocialValue = (value: string) => {
    const current = selectedSocialValues || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    setValue('socialValues', updated)
  }

  const toggleWeekendPreference = (pref: string) => {
    const current = selectedWeekendPreference || []
    const updated = current.includes(pref)
      ? current.filter(p => p !== pref)
      : [...current, pref]
    setValue('weekendPreference', updated)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* About Me */}
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
            <CardDescription>Tell others about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aboutMe">About Me *</Label>
              <Textarea
                id="aboutMe"
                {...register('aboutMe')}
                placeholder="Write something about yourself..."
                className="min-h-[100px]"
              />
              {errors.aboutMe && (
                <p className="text-sm text-red-500">{errors.aboutMe.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interests & Values */}
        <Card>
          <CardHeader>
            <CardTitle>Interests & Values</CardTitle>
            <CardDescription>Share your interests and values to help find compatible matches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interest Tags */}
            <div className="space-y-3">
              <Label>Your Interests (Select as many as you like)</Label>
              {INTEREST_CATEGORIES.map((category) => (
                <div key={category.category} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{category.category}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {category.interests.map((interest) => (
                      <div key={interest.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`interest-${interest.value}`}
                          checked={selectedInterestTags.includes(interest.value)}
                          onCheckedChange={() => toggleInterestTag(interest.value)}
                        />
                        <Label htmlFor={`interest-${interest.value}`} className="cursor-pointer text-sm">
                          {interest.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Political Leaning */}
            <div className="space-y-2">
              <Label htmlFor="politicalLeaning">Political Leaning</Label>
              <Select
                value={watch('politicalLeaning') || ''}
                onValueChange={(value) => setValue('politicalLeaning', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select political leaning" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROGRESSIVE">Progressive</SelectItem>
                  <SelectItem value="LIBERAL">Liberal</SelectItem>
                  <SelectItem value="MODERATE">Moderate</SelectItem>
                  <SelectItem value="CONSERVATIVE">Conservative</SelectItem>
                  <SelectItem value="APOLITICAL">Apolitical</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Relationship Timeline */}
              <div className="space-y-2">
                <Label htmlFor="relationshipTimeline">Relationship Timeline</Label>
                <Select
                  value={watch('relationshipTimeline') || ''}
                  onValueChange={(value) => setValue('relationshipTimeline', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASAP">As soon as possible</SelectItem>
                    <SelectItem value="3_6_MONTHS">3-6 months</SelectItem>
                    <SelectItem value="6_12_MONTHS">6-12 months</SelectItem>
                    <SelectItem value="1_2_YEARS">1-2 years</SelectItem>
                    <SelectItem value="TAKE_TIME">Taking my time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Want Children */}
              <div className="space-y-2">
                <Label htmlFor="wantChildren">Want Children?</Label>
                <Select
                  value={watch('wantChildren') || ''}
                  onValueChange={(value) => setValue('wantChildren', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YES">Yes</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                    <SelectItem value="OPEN">Open to discussion</SelectItem>
                    <SelectItem value="ALREADY_HAVE">Already have children</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Living Arrangement */}
              <div className="space-y-2">
                <Label htmlFor="livingArrangementPreference">Living Arrangement Preference</Label>
                <Select
                  value={watch('livingArrangementPreference') || ''}
                  onValueChange={(value) => setValue('livingArrangementPreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUCLEAR">Nuclear family</SelectItem>
                    <SelectItem value="WITH_PARENTS">With parents</SelectItem>
                    <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                    <SelectItem value="PARENTS_NEARBY">Parents nearby</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Communication Style */}
              <div className="space-y-2">
                <Label htmlFor="communicationStyle">Communication Style</Label>
                <Select
                  value={watch('communicationStyle') || ''}
                  onValueChange={(value) => setValue('communicationStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIRECT">Direct & straightforward</SelectItem>
                    <SelectItem value="THOUGHTFUL">Thoughtful & reflective</SelectItem>
                    <SelectItem value="EXPRESSIVE">Expressive & emotive</SelectItem>
                    <SelectItem value="RESERVED">Reserved & private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Social Values (multi-select) */}
            <div className="space-y-2">
              <Label>Social Values (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['FAMILY_FIRST', 'CAREER_DRIVEN', 'ADVENTURE_SEEKER', 'HOMEBODY', 'SOCIAL_BUTTERFLY', 'SPIRITUALLY_INCLINED'].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`social-${value}`}
                      checked={selectedSocialValues.includes(value)}
                      onCheckedChange={() => toggleSocialValue(value)}
                    />
                    <Label htmlFor={`social-${value}`} className="cursor-pointer text-sm">
                      {value.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekend Preference (multi-select) */}
            <div className="space-y-2">
              <Label>Weekend Preference (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['OUTDOOR_ACTIVITIES', 'QUIET_RELAXATION', 'SOCIAL_EVENTS', 'CULTURAL_OUTINGS', 'SPORTS', 'FAMILY_TIME'].map((pref) => (
                  <div key={pref} className="flex items-center space-x-2">
                    <Checkbox
                      id={`weekend-${pref}`}
                      checked={selectedWeekendPreference.includes(pref)}
                      onCheckedChange={() => toggleWeekendPreference(pref)}
                    />
                    <Label htmlFor={`weekend-${pref}`} className="cursor-pointer text-sm">
                      {pref.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kerala Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Kerala Connection</CardTitle>
            <CardDescription>Your connection to Kerala and Malayalam culture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Home District */}
              <div className="space-y-2">
                <Label htmlFor="homeDistrict">Home District in Kerala</Label>
                <Select
                  value={watch('homeDistrict') || ''}
                  onValueChange={(value) => setValue('homeDistrict', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {KERALA_DISTRICTS.map((district) => (
                      <SelectItem key={district.value} value={district.value}>
                        {district.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Diaspora Location */}
              <div className="space-y-2">
                <Label htmlFor="diasporaLocation">Diaspora Location (if applicable)</Label>
                <Select
                  value={watch('diasporaLocation') || ''}
                  onValueChange={(value) => setValue('diasporaLocation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIASPORA_LOCATIONS.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kerala Connection */}
              <div className="space-y-2">
                <Label htmlFor="keralaConnection">Kerala Connection Strength</Label>
                <Select
                  value={watch('keralaConnection') || ''}
                  onValueChange={(value) => setValue('keralaConnection', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select connection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERY_STRONG">Very Strong - Visit regularly, deeply connected</SelectItem>
                    <SelectItem value="MODERATE">Moderate - Visit occasionally, stay connected</SelectItem>
                    <SelectItem value="WEAK">Weak - Rarely visit, minimal connection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language Preference */}
              <div className="space-y-2">
                <Label htmlFor="languagePreference">Malayalam Language Preference</Label>
                <Select
                  value={watch('languagePreference') || ''}
                  onValueChange={(value) => setValue('languagePreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLUENT">Fluent speaker</SelectItem>
                    <SelectItem value="CONVERSATIONAL">Conversational</SelectItem>
                    <SelectItem value="BASIC">Basic understanding</SelectItem>
                    <SelectItem value="LEARNING">Currently learning</SelectItem>
                    <SelectItem value="NONE">Don&apos;t speak Malayalam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Relocation Flexibility */}
              <div className="space-y-2">
                <Label htmlFor="relocationFlexibility">Relocation Flexibility</Label>
                <Select
                  value={watch('relocationFlexibility') || ''}
                  onValueChange={(value) => setValue('relocationFlexibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select flexibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREFER_KERALA">Prefer to stay in Kerala</SelectItem>
                    <SelectItem value="OPEN_INDIA">Open to anywhere in India</SelectItem>
                    <SelectItem value="OPEN_GULF">Open to Gulf countries</SelectItem>
                    <SelectItem value="OPEN_WEST">Open to Western countries</SelectItem>
                    <SelectItem value="FULLY_FLEXIBLE">Fully flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physical Attributes */}
        <Card>
          <CardHeader>
            <CardTitle>Physical Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  {...register('height', { valueAsNumber: true })}
                  placeholder="165"
                />
                {height && (
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(height / 30.48)}'{Math.round((height % 30.48) / 2.54)}"
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyType">Body Type</Label>
                <Select
                  value={watch('bodyType') || ''}
                  onValueChange={(value) => setValue('bodyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SLIM">Slim</SelectItem>
                    <SelectItem value="ATHLETIC">Athletic</SelectItem>
                    <SelectItem value="AVERAGE">Average</SelectItem>
                    <SelectItem value="CURVY">Heavyset</SelectItem>
                    <SelectItem value="PLUS_SIZE">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complexion">Complexion</Label>
                <Select
                  value={watch('complexion') || ''}
                  onValueChange={(value) => setValue('complexion', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Wheatish">Wheatish</SelectItem>
                    <SelectItem value="Dusky">Dusky</SelectItem>
                    <SelectItem value="Dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Languages Spoken</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INDIAN_LANGUAGES.map((language) => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${language}`}
                      checked={selectedLanguages.includes(language)}
                      onCheckedChange={() => toggleLanguage(language)}
                    />
                    <Label htmlFor={`lang-${language}`} className="cursor-pointer text-sm">
                      {language}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education & Career */}
        <Card>
          <CardHeader>
            <CardTitle>Education & Career</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="educationLevel">Education Level</Label>
                <Select
                  value={watch('educationLevel') || ''}
                  onValueChange={(value) => setValue('educationLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                    <SelectItem value="ASSOCIATE">Diploma</SelectItem>
                    <SelectItem value="BACHELOR">Bachelor's Degree</SelectItem>
                    <SelectItem value="MASTER">Master's Degree</SelectItem>
                    <SelectItem value="DOCTORATE">Doctorate</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional Degree</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  {...register('fieldOfStudy')}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  {...register('occupation')}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incomeRange">Income Range (INR)</Label>
                <Select
                  value={watch('incomeRange') || ''}
                  onValueChange={(value) => setValue('incomeRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BELOW_3_LAKHS">Below 3 Lakhs</SelectItem>
                    <SelectItem value="THREE_TO_FIVE_LAKHS">3-5 Lakhs</SelectItem>
                    <SelectItem value="FIVE_TO_SEVEN_LAKHS">5-7 Lakhs</SelectItem>
                    <SelectItem value="SEVEN_TO_TEN_LAKHS">7-10 Lakhs</SelectItem>
                    <SelectItem value="TEN_TO_FIFTEEN_LAKHS">10-15 Lakhs</SelectItem>
                    <SelectItem value="ABOVE_THIRTY_LAKHS">30+ Lakhs</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Background */}
        <Card>
          <CardHeader>
            <CardTitle>Family Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentsOccupation">Parents Occupation</Label>
                <Input
                  id="parentsOccupation"
                  {...register('parentsOccupation')}
                  placeholder="Father: ..., Mother: ..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siblingsCount">Number of Siblings</Label>
                <Input
                  id="siblingsCount"
                  type="number"
                  {...register('siblingsCount', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthOrder">Birth Order</Label>
                <Select
                  value={watch('birthOrder') || ''}
                  onValueChange={(value) => setValue('birthOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Only child">Only child</SelectItem>
                    <SelectItem value="Eldest">Eldest</SelectItem>
                    <SelectItem value="Middle">Middle</SelectItem>
                    <SelectItem value="Youngest">Youngest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyType">Family Type</Label>
                <Select
                  value={watch('familyType') || ''}
                  onValueChange={(value) => setValue('familyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUCLEAR">Nuclear</SelectItem>
                    <SelectItem value="JOINT">Joint</SelectItem>
                    <SelectItem value="SINGLE_PARENT">Extended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyValues">Family Values</Label>
                <Select
                  value={watch('familyValues') || ''}
                  onValueChange={(value) => setValue('familyValues', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select values" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Traditional">Traditional</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Liberal">Liberal</SelectItem>
                    <SelectItem value="Progressive">Progressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle */}
        <Card>
          <CardHeader>
            <CardTitle>Lifestyle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drinking">Drinking</Label>
                <Select
                  value={watch('drinking') || ''}
                  onValueChange={(value) => setValue('drinking', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Never">Never</SelectItem>
                    <SelectItem value="Socially">Socially</SelectItem>
                    <SelectItem value="Regularly">Regularly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smoking">Smoking</Label>
                <Select
                  value={watch('smoking') || ''}
                  onValueChange={(value) => setValue('smoking', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Never">Never</SelectItem>
                    <SelectItem value="Occasionally">Occasionally</SelectItem>
                    <SelectItem value="Regularly">Regularly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietPreference">Diet</Label>
                <Select
                  value={watch('dietPreference') || ''}
                  onValueChange={(value) => setValue('dietPreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                    <SelectItem value="Non-vegetarian">Non-vegetarian</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hobbies">Hobbies & Interests</Label>
              <Textarea
                id="hobbies"
                {...register('hobbies')}
                placeholder="Reading, Music, Sports..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Your city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="Your state"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register('country')}
                  placeholder="India"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="openToRelocate"
                checked={openToRelocate}
                onCheckedChange={(checked) => setValue('openToRelocate', checked as boolean)}
              />
              <Label htmlFor="openToRelocate" className="cursor-pointer">
                Open to relocate
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
