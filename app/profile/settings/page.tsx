"use client"

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
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { PhotoUpload } from '@/components/photo-upload'
import { Loader2, Save, Trash2, AlertTriangle, User, Heart, Briefcase, Home, MapPin, Image } from 'lucide-react'

const profileSchema = z.object({
  // Basic Info
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  aboutMe: z.string().min(50, 'About me should be at least 50 characters').max(1000),

  // Faith
  denomination: z.enum(['BAPTIST', 'METHODIST', 'PRESBYTERIAN', 'PENTECOSTAL', 'NON_DENOMINATIONAL', 'LUTHERAN', 'ANGLICAN', 'EPISCOPAL', 'REFORMED', 'EVANGELICAL', 'OTHER']),
  churchName: z.string().optional(),
  yearsAsBeliever: z.number().min(0).optional(),
  isBaptized: z.boolean(),
  churchInvolvementLevel: z.string().optional(),

  // Physical
  height: z.number().min(100).max(250),
  bodyType: z.enum(['SLIM', 'AVERAGE', 'ATHLETIC', 'CURVY', 'PLUS_SIZE']),

  // Education & Career
  educationLevel: z.enum(['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'PROFESSIONAL']),
  fieldOfStudy: z.string().optional(),
  occupation: z.string().min(1, 'Occupation is required'),
  incomeRange: z.string().optional(),

  // Family
  parentsOccupation: z.string().optional(),
  siblingsCount: z.number().min(0).optional(),
  birthOrder: z.string().optional(),
  familyType: z.enum(['NUCLEAR', 'JOINT', 'SINGLE_PARENT']).optional(),
  familyValues: z.string().optional(),

  // Lifestyle
  drinking: z.string().optional(),
  smoking: z.string().optional(),
  dietPreference: z.string().optional(),
  hobbies: z.string().optional(),

  // Location
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  openToRelocate: z.boolean(),

  // Privacy
  isVisible: z.boolean(),
  visibilityMode: z.string(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [photos, setPhotos] = useState<any[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const height = watch('height')
  const isBaptized = watch('isBaptized')
  const openToRelocate = watch('openToRelocate')
  const isVisible = watch('isVisible')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Fetch profile data
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')

      const data = await response.json()

      // Set form values
      const profile = data.profile
      reset({
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profile.gender || 'MALE',
        aboutMe: profile.aboutMe || '',
        denomination: profile.denomination || 'NON_DENOMINATIONAL',
        churchName: profile.churchName || '',
        yearsAsBeliever: profile.yearsAsBeliever || 0,
        isBaptized: profile.isBaptized || false,
        churchInvolvementLevel: profile.churchInvolvementLevel || '',
        height: profile.height || 170,
        bodyType: profile.bodyType || 'AVERAGE',
        educationLevel: profile.educationLevel || 'BACHELOR',
        fieldOfStudy: profile.fieldOfStudy || '',
        occupation: profile.occupation || '',
        incomeRange: profile.incomeRange || '',
        parentsOccupation: profile.parentsOccupation || '',
        siblingsCount: profile.siblingsCount || 0,
        birthOrder: profile.birthOrder || '',
        familyType: profile.familyType || 'NUCLEAR',
        familyValues: profile.familyValues || '',
        drinking: profile.drinking || '',
        smoking: profile.smoking || '',
        dietPreference: profile.dietPreference || '',
        hobbies: profile.hobbies || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        openToRelocate: profile.openToRelocate || false,
        isVisible: profile.isVisible ?? true,
        visibilityMode: profile.visibilityMode || 'all',
      })

      setPhotos(data.photos || [])
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile data'
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

      if (!response.ok) throw new Error('Failed to update profile')

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })

      // Refresh profile data
      await fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete account')

      toast({
        title: 'Account Deleted',
        description: 'Your account has been deleted successfully',
      })

      // Redirect to login
      router.push('/auth/login')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete account'
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information and privacy settings
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">
              <User className="h-4 w-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="faith">
              <Heart className="h-4 w-4 mr-2" />
              Faith
            </TabsTrigger>
            <TabsTrigger value="career">
              <Briefcase className="h-4 w-4 mr-2" />
              Career
            </TabsTrigger>
            <TabsTrigger value="lifestyle">
              <Home className="h-4 w-4 mr-2" />
              Lifestyle
            </TabsTrigger>
            <TabsTrigger value="photos">
              <Image className="h-4 w-4 mr-2" />
              Photos
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your personal information and location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={watch('gender')}
                      onValueChange={(value) => setValue('gender', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutMe">About Me *</Label>
                  <Textarea
                    id="aboutMe"
                    rows={5}
                    placeholder="Tell potential matches about yourself..."
                    {...register('aboutMe')}
                  />
                  {errors.aboutMe && (
                    <p className="text-sm text-red-500">{errors.aboutMe.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Height: {height} cm ({Math.floor(height / 30.48)}&apos;{Math.round(((height / 30.48) % 1) * 12)}&quot;)</Label>
                  <Slider
                    value={[height]}
                    onValueChange={([value]) => setValue('height', value)}
                    min={100}
                    max={250}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyType">Body Type</Label>
                  <Select
                    value={watch('bodyType')}
                    onValueChange={(value) => setValue('bodyType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SLIM">Slim</SelectItem>
                      <SelectItem value="AVERAGE">Average</SelectItem>
                      <SelectItem value="ATHLETIC">Athletic</SelectItem>
                      <SelectItem value="CURVY">Curvy</SelectItem>
                      <SelectItem value="PLUS_SIZE">Plus Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register('city')} />
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" {...register('state')} />
                    {errors.state && (
                      <p className="text-sm text-red-500">{errors.state.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" {...register('country')} />
                    {errors.country && (
                      <p className="text-sm text-red-500">{errors.country.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="openToRelocate"
                    checked={openToRelocate}
                    onCheckedChange={(checked) => setValue('openToRelocate', checked)}
                  />
                  <Label htmlFor="openToRelocate">Open to relocate</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faith Tab */}
          <TabsContent value="faith" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Faith Background</CardTitle>
                <CardDescription>Your spiritual journey and beliefs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="denomination">Denomination *</Label>
                  <Select
                    value={watch('denomination')}
                    onValueChange={(value) => setValue('denomination', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAPTIST">Baptist</SelectItem>
                      <SelectItem value="METHODIST">Methodist</SelectItem>
                      <SelectItem value="PRESBYTERIAN">Presbyterian</SelectItem>
                      <SelectItem value="PENTECOSTAL">Pentecostal</SelectItem>
                      <SelectItem value="NON_DENOMINATIONAL">Non-Denominational</SelectItem>
                      <SelectItem value="LUTHERAN">Lutheran</SelectItem>
                      <SelectItem value="ANGLICAN">Anglican</SelectItem>
                      <SelectItem value="EPISCOPAL">Episcopal</SelectItem>
                      <SelectItem value="REFORMED">Reformed</SelectItem>
                      <SelectItem value="EVANGELICAL">Evangelical</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="churchName">Church Name</Label>
                  <Input id="churchName" {...register('churchName')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsAsBeliever">Years as Believer</Label>
                  <Input
                    id="yearsAsBeliever"
                    type="number"
                    min="0"
                    {...register('yearsAsBeliever', { valueAsNumber: true })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isBaptized"
                    checked={isBaptized}
                    onCheckedChange={(checked) => setValue('isBaptized', checked)}
                  />
                  <Label htmlFor="isBaptized">I am baptized</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="churchInvolvementLevel">Church Involvement</Label>
                  <Select
                    value={watch('churchInvolvementLevel') || ''}
                    onValueChange={(value) => setValue('churchInvolvementLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VERY_ACTIVE">Very Active</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="OCCASIONAL">Occasional</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Career Tab */}
          <TabsContent value="career" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Education & Career</CardTitle>
                <CardDescription>Your professional background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level *</Label>
                  <Select
                    value={watch('educationLevel')}
                    onValueChange={(value) => setValue('educationLevel', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                      <SelectItem value="ASSOCIATE">Associate Degree</SelectItem>
                      <SelectItem value="BACHELOR">Bachelor&apos;s Degree</SelectItem>
                      <SelectItem value="MASTER">Master&apos;s Degree</SelectItem>
                      <SelectItem value="DOCTORATE">Doctorate</SelectItem>
                      <SelectItem value="PROFESSIONAL">Professional Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input id="fieldOfStudy" {...register('fieldOfStudy')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input id="occupation" {...register('occupation')} />
                  {errors.occupation && (
                    <p className="text-sm text-red-500">{errors.occupation.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incomeRange">Income Range</Label>
                  <Select
                    value={watch('incomeRange') || ''}
                    onValueChange={(value) => setValue('incomeRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNDER_25K">Under $25,000</SelectItem>
                      <SelectItem value="25K_50K">$25,000 - $50,000</SelectItem>
                      <SelectItem value="50K_75K">$50,000 - $75,000</SelectItem>
                      <SelectItem value="75K_100K">$75,000 - $100,000</SelectItem>
                      <SelectItem value="100K_150K">$100,000 - $150,000</SelectItem>
                      <SelectItem value="OVER_150K">Over $150,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Family Background</CardTitle>
                <CardDescription>Information about your family</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parentsOccupation">Parents Occupation</Label>
                  <Input id="parentsOccupation" {...register('parentsOccupation')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siblingsCount">Number of Siblings</Label>
                  <Input
                    id="siblingsCount"
                    type="number"
                    min="0"
                    {...register('siblingsCount', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthOrder">Birth Order</Label>
                  <Input
                    id="birthOrder"
                    placeholder="e.g., Eldest, Middle, Youngest"
                    {...register('birthOrder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="familyType">Family Type</Label>
                  <Select
                    value={watch('familyType') || ''}
                    onValueChange={(value) => setValue('familyType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NUCLEAR">Nuclear</SelectItem>
                      <SelectItem value="JOINT">Joint</SelectItem>
                      <SelectItem value="SINGLE_PARENT">Single Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="familyValues">Family Values</Label>
                  <Textarea
                    id="familyValues"
                    rows={3}
                    placeholder="Describe your family values..."
                    {...register('familyValues')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifestyle Tab */}
          <TabsContent value="lifestyle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle & Interests</CardTitle>
                <CardDescription>Your habits and hobbies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="NEVER">Never</SelectItem>
                        <SelectItem value="SOCIALLY">Socially</SelectItem>
                        <SelectItem value="OCCASIONALLY">Occasionally</SelectItem>
                        <SelectItem value="REGULARLY">Regularly</SelectItem>
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
                        <SelectItem value="NEVER">Never</SelectItem>
                        <SelectItem value="OCCASIONALLY">Occasionally</SelectItem>
                        <SelectItem value="REGULARLY">Regularly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietPreference">Diet Preference</Label>
                  <Select
                    value={watch('dietPreference') || ''}
                    onValueChange={(value) => setValue('dietPreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VEGETARIAN">Vegetarian</SelectItem>
                      <SelectItem value="VEGAN">Vegan</SelectItem>
                      <SelectItem value="NON_VEGETARIAN">Non-Vegetarian</SelectItem>
                      <SelectItem value="PESCATARIAN">Pescatarian</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hobbies">Hobbies & Interests</Label>
                  <Textarea
                    id="hobbies"
                    rows={4}
                    placeholder="What do you enjoy doing in your free time?"
                    {...register('hobbies')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVisible"
                    checked={isVisible}
                    onCheckedChange={(checked) => setValue('isVisible', checked)}
                  />
                  <Label htmlFor="isVisible">Make my profile visible</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibilityMode">Visibility Mode</Label>
                  <Select
                    value={watch('visibilityMode')}
                    onValueChange={(value) => setValue('visibilityMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Visible to all members</SelectItem>
                      <SelectItem value="matched_only">Only matched members</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Photos</CardTitle>
                <CardDescription>Upload and manage your profile photos</CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUpload
                  photos={photos}
                  onPhotosChange={setPhotos}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" type="button">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Delete Account
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? This action cannot be undone.
                  All your data, matches, and messages will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !isDirty}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
