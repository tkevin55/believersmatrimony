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
import { getAllStates, getDistrictsByState } from '@/lib/indian-locations'

const profileSchema = z.object({
  aboutMe: z.string().min(50, 'About me should be at least 50 characters').max(1000).optional(),
  denomination: z.string().optional(),
  churchName: z.string().optional(),
  yearsAsBeliever: z.number().min(0).optional(),
  isBaptized: z.boolean().optional(),
  churchInvolvementLevel: z.string().optional(),
  favoriteVerseReference: z.string().optional(),
  favoriteVerseWhy: z.string().max(200).optional(),
  height: z.number().min(100).max(250).optional(),
  motherTongue: z.string().optional(),
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
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  openToRelocate: z.boolean().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const MOTHER_TONGUES = [
  { value: 'HINDI', label: 'Hindi' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'TAMIL', label: 'Tamil' },
  { value: 'TELUGU', label: 'Telugu' },
  { value: 'KANNADA', label: 'Kannada' },
  { value: 'MALAYALAM', label: 'Malayalam' },
  { value: 'MARATHI', label: 'Marathi' },
  { value: 'BENGALI', label: 'Bengali' },
  { value: 'GUJARATI', label: 'Gujarati' },
  { value: 'PUNJABI', label: 'Punjabi' },
  { value: 'URDU', label: 'Urdu' },
  { value: 'ODIA', label: 'Odia' },
  { value: 'ASSAMESE', label: 'Assamese' },
  { value: 'KONKANI', label: 'Konkani' },
  { value: 'MANIPURI', label: 'Manipuri' },
  { value: 'NEPALI', label: 'Nepali' },
  { value: 'SINDHI', label: 'Sindhi' },
  { value: 'KASHMIRI', label: 'Kashmiri' },
  { value: 'SANSKRIT', label: 'Sanskrit' },
  { value: 'OTHER', label: 'Other' },
]

const INDIAN_LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi',
  'Gujarati', 'Punjabi', 'Odia', 'Urdu', 'Assamese', 'Konkani'
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
  const isBaptized = watch('isBaptized')
  const openToRelocate = watch('openToRelocate')
  const selectedLanguages = watch('languages') || []

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
          denomination: profile.denomination || '',
          churchName: profile.churchName || '',
          yearsAsBeliever: profile.yearsAsBeliever || 0,
          isBaptized: profile.isBaptized || false,
          churchInvolvementLevel: profile.churchInvolvementLevel || '',
          favoriteVerseReference: profile.favoriteVerseReference || '',
          favoriteVerseWhy: profile.favoriteVerseWhy || '',
          height: profile.height || 165,
          motherTongue: profile.motherTongue || '',
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
          district: profile.district || '',
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

        {/* Faith Background */}
        <Card>
          <CardHeader>
            <CardTitle>Faith Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="denomination">Denomination</Label>
                <Select
                  value={watch('denomination') || ''}
                  onValueChange={(value) => setValue('denomination', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select denomination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSI">CSI (Church of South India)</SelectItem>
                    <SelectItem value="CNI">CNI (Church of North India)</SelectItem>
                    <SelectItem value="BAPTIST">Baptist</SelectItem>
                    <SelectItem value="METHODIST">Methodist</SelectItem>
                    <SelectItem value="PENTECOSTAL">Pentecostal</SelectItem>
                    <SelectItem value="AG">AG (Assemblies of God)</SelectItem>
                    <SelectItem value="IPC">IPC (Indian Pentecostal Church)</SelectItem>
                    <SelectItem value="MAR_THOMA">Mar Thoma</SelectItem>
                    <SelectItem value="SEVENTH_DAY_ADVENTIST">SDA</SelectItem>
                    <SelectItem value="BRETHREN">Brethren</SelectItem>
                    <SelectItem value="NON_DENOMINATIONAL">Non-Denominational</SelectItem>
                    <SelectItem value="EVANGELICAL">Evangelical</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="churchName">Church Name</Label>
                <Input
                  id="churchName"
                  {...register('churchName')}
                  placeholder="Your church name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsAsBeliever">Years as Believer</Label>
                <Input
                  id="yearsAsBeliever"
                  type="number"
                  {...register('yearsAsBeliever', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="churchInvolvementLevel">Church Involvement</Label>
                <Select
                  value={watch('churchInvolvementLevel') || ''}
                  onValueChange={(value) => setValue('churchInvolvementLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select involvement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR_ATTENDER">Regular Attender</SelectItem>
                    <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                    <SelectItem value="MINISTRY_LEADER">Ministry Leader</SelectItem>
                    <SelectItem value="ELDER_DEACON">Elder/Deacon</SelectItem>
                    <SelectItem value="OCCASIONAL_ATTENDER">Occasional Attender</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isBaptized"
                checked={isBaptized}
                onCheckedChange={(checked) => setValue('isBaptized', checked as boolean)}
              />
              <Label htmlFor="isBaptized" className="cursor-pointer">
                I am baptized
              </Label>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Favorite Bible Verse (Optional)</h4>
                <p className="text-sm text-muted-foreground">Share a verse that's meaningful to you</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteVerseReference">Verse Reference</Label>
                <Input
                  id="favoriteVerseReference"
                  {...register('favoriteVerseReference')}
                  placeholder="e.g., John 3:16, Philippians 4:13"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteVerseWhy">Why this verse matters to you</Label>
                <Textarea
                  id="favoriteVerseWhy"
                  {...register('favoriteVerseWhy')}
                  placeholder="Share why this verse is special to you (max 200 characters)"
                  className="min-h-[80px]"
                  maxLength={200}
                />
                {watch('favoriteVerseWhy') && (
                  <p className="text-sm text-muted-foreground text-right">
                    {watch('favoriteVerseWhy')?.length || 0}/200 characters
                  </p>
                )}
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
                <Label htmlFor="motherTongue">Mother Tongue</Label>
                <Select
                  value={watch('motherTongue') || ''}
                  onValueChange={(value) => setValue('motherTongue', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mother tongue" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOTHER_TONGUES.map((tongue) => (
                      <SelectItem key={tongue.value} value={tongue.value}>
                        {tongue.label}
                      </SelectItem>
                    ))}
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
                    <SelectItem value="Orthodox Christian">Orthodox Christian</SelectItem>
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
                <Label htmlFor="state">State</Label>
                <Select
                  value={watch('state') || ''}
                  onValueChange={(value) => {
                    setValue('state', value)
                    setValue('district', '') // Reset district when state changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {getAllStates().map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select
                  value={watch('district') || ''}
                  onValueChange={(value) => setValue('district', value)}
                  disabled={!watch('state')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={watch('state') ? "Select district" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {watch('state') && getDistrictsByState(watch('state')).map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
