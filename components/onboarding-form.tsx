'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

const onboardingSchema = z.object({
  // Basic Info
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  aboutMe: z.string().optional(),

  // Location
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  district: z.string().optional(),
  openToRelocate: z.boolean(),

  // Faith
  denomination: z.enum(['BAPTIST', 'METHODIST', 'PRESBYTERIAN', 'PENTECOSTAL', 'NON_DENOMINATIONAL', 'LUTHERAN', 'ANGLICAN', 'EPISCOPAL', 'REFORMED', 'EVANGELICAL', 'OTHER']),
  churchName: z.string().optional(),
  yearsAsBeliever: z.number().min(0).optional(),
  isBaptized: z.boolean(),

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
  familyType: z.enum(['NUCLEAR', 'JOINT', 'SINGLE_PARENT']).optional(),
  familyValues: z.string().optional(),

  // Lifestyle
  drinking: z.string().optional(),
  smoking: z.string().optional(),
  dietPreference: z.string().optional(),
  hobbies: z.string().optional(),

  // Partner Preferences
  ageMin: z.number().min(18).max(100),
  ageMax: z.number().min(18).max(100),
  heightMin: z.number().min(100).max(250),
  heightMax: z.number().min(100).max(250),
  preferredDenominations: z.array(z.string()),
  preferredLocations: z.array(z.string()),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

interface OnboardingFormProps {
  userId: string
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      gender: 'MALE',
      openToRelocate: false,
      denomination: 'NON_DENOMINATIONAL',
      isBaptized: false,
      height: 170,
      bodyType: 'AVERAGE',
      educationLevel: 'BACHELOR',
      familyType: 'NUCLEAR',
      siblingsCount: 0,
      yearsAsBeliever: 0,
      ageMin: 25,
      ageMax: 35,
      heightMin: 150,
      heightMax: 190,
      preferredDenominations: [],
      preferredLocations: [],
      drinking: 'Never',
      smoking: 'Never',
    },
  })

  const totalSteps = 8

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true)

    try {
      // Calculate age from date of birth
      const birthDate = new Date(data.dateOfBirth)
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

      if (age < 18) {
        toast({
          title: 'Error',
          description: 'You must be at least 18 years old to register',
        })
        setIsSubmitting(false)
        return
      }

      // Create profile and partner preferences
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profile: {
            dateOfBirth: new Date(data.dateOfBirth),
            gender: data.gender,
            aboutMe: data.aboutMe,
            district: data.district,
            state: data.state,
            country: data.country,
            openToRelocate: data.openToRelocate,
            denomination: data.denomination,
            churchName: data.churchName,
            yearsAsBeliever: data.yearsAsBeliever,
            isBaptized: data.isBaptized,
            height: data.height,
            bodyType: data.bodyType,
            educationLevel: data.educationLevel,
            fieldOfStudy: data.fieldOfStudy,
            occupation: data.occupation,
            incomeRange: data.incomeRange,
            parentsOccupation: data.parentsOccupation,
            siblingsCount: data.siblingsCount,
            familyType: data.familyType,
            familyValues: data.familyValues,
            drinking: data.drinking,
            smoking: data.smoking,
            dietPreference: data.dietPreference,
            hobbies: data.hobbies,
          },
          partnerPreferences: {
            ageMin: data.ageMin,
            ageMax: data.ageMax,
            heightMin: data.heightMin,
            heightMax: data.heightMax,
            denominations: data.preferredDenominations,
            locations: data.preferredLocations,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save profile')
      }

      toast({
        title: 'Success',
        description: 'Profile completed successfully!',
      })

      router.push('/discover')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
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
            <div className="space-y-2">
              <Label htmlFor="aboutMe">About Me (Optional)</Label>
              <textarea
                id="aboutMe"
                {...register('aboutMe')}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        )

      case 2:
        const selectedCountry = watch('country')
        const isIndia = selectedCountry === 'India'

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Location</h2>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={watch('country')}
                onValueChange={(value) => {
                  setValue('country', value)
                  // Clear state and district when country changes
                  if (value !== 'India') {
                    setValue('state', '')
                    setValue('district', '')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="New Zealand">New Zealand</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                  <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                  <SelectItem value="Qatar">Qatar</SelectItem>
                  <SelectItem value="Kuwait">Kuwait</SelectItem>
                  <SelectItem value="Bahrain">Bahrain</SelectItem>
                  <SelectItem value="Oman">Oman</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Netherlands">Netherlands</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Ireland">Ireland</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-destructive">{errors.country.message}</p>
              )}
            </div>
            {isIndia && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={watch('state') || ''}
                    onValueChange={(value) => setValue('state', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                      <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                      <SelectItem value="Assam">Assam</SelectItem>
                      <SelectItem value="Bihar">Bihar</SelectItem>
                      <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                      <SelectItem value="Goa">Goa</SelectItem>
                      <SelectItem value="Gujarat">Gujarat</SelectItem>
                      <SelectItem value="Haryana">Haryana</SelectItem>
                      <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                      <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                      <SelectItem value="Karnataka">Karnataka</SelectItem>
                      <SelectItem value="Kerala">Kerala</SelectItem>
                      <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="Manipur">Manipur</SelectItem>
                      <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                      <SelectItem value="Mizoram">Mizoram</SelectItem>
                      <SelectItem value="Nagaland">Nagaland</SelectItem>
                      <SelectItem value="Odisha">Odisha</SelectItem>
                      <SelectItem value="Punjab">Punjab</SelectItem>
                      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="Sikkim">Sikkim</SelectItem>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Telangana">Telangana</SelectItem>
                      <SelectItem value="Tripura">Tripura</SelectItem>
                      <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                      <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                      <SelectItem value="West Bengal">West Bengal</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Puducherry">Puducherry</SelectItem>
                      <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                      <SelectItem value="Jammu and Kashmir">Jammu and Kashmir</SelectItem>
                      <SelectItem value="Ladakh">Ladakh</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-sm text-destructive">{errors.state.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District/City</Label>
                  <Input id="district" {...register('district')} placeholder="Mumbai" />
                  {errors.district && (
                    <p className="text-sm text-destructive">{errors.district.message}</p>
                  )}
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="openToRelocate">Open to relocate?</Label>
              <Switch
                id="openToRelocate"
                checked={watch('openToRelocate')}
                onCheckedChange={(checked) => setValue('openToRelocate', checked)}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Faith Background</h2>
            <div className="space-y-2">
              <Label htmlFor="denomination">Denomination</Label>
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
              <Label htmlFor="churchName">Church Name (Optional)</Label>
              <Input id="churchName" {...register('churchName')} placeholder="First Baptist Church" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsAsBeliever">Years as a Believer</Label>
              <Input
                id="yearsAsBeliever"
                type="number"
                {...register('yearsAsBeliever', { valueAsNumber: true })}
                min="0"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isBaptized">Are you baptized?</Label>
              <Switch
                id="isBaptized"
                checked={watch('isBaptized')}
                onCheckedChange={(checked) => setValue('isBaptized', checked)}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Physical Attributes</h2>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm): {watch('height')}</Label>
              <Slider
                id="height"
                min={100}
                max={250}
                step={1}
                value={[watch('height')]}
                onValueChange={([value]) => setValue('height', value)}
              />
              <p className="text-sm text-muted-foreground">
                {Math.floor(watch('height') / 30.48)}&apos;{Math.round((watch('height') % 30.48) / 2.54)}&quot;
              </p>
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
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Photo upload will be available after completing your profile
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Education & Career</h2>
            <div className="space-y-2">
              <Label htmlFor="educationLevel">Education Level</Label>
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
              <Label htmlFor="fieldOfStudy">Field of Study (Optional)</Label>
              <Input id="fieldOfStudy" {...register('fieldOfStudy')} placeholder="Computer Science" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" {...register('occupation')} placeholder="Software Engineer" />
              {errors.occupation && (
                <p className="text-sm text-destructive">{errors.occupation.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="incomeRange">Income Range (Optional)</Label>
              <Select
                value={watch('incomeRange') || ''}
                onValueChange={(value) => setValue('incomeRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Below $30k">Below $30k</SelectItem>
                  <SelectItem value="$30k - $50k">$30k - $50k</SelectItem>
                  <SelectItem value="$50k - $75k">$50k - $75k</SelectItem>
                  <SelectItem value="$75k - $100k">$75k - $100k</SelectItem>
                  <SelectItem value="$100k - $150k">$100k - $150k</SelectItem>
                  <SelectItem value="Above $150k">Above $150k</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Family Background</h2>
            <div className="space-y-2">
              <Label htmlFor="parentsOccupation">Parents Occupation (Optional)</Label>
              <Input
                id="parentsOccupation"
                {...register('parentsOccupation')}
                placeholder="Business, Teaching"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siblingsCount">Number of Siblings</Label>
              <Input
                id="siblingsCount"
                type="number"
                {...register('siblingsCount', { valueAsNumber: true })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyType">Family Type</Label>
              <Select
                value={watch('familyType') || ''}
                onValueChange={(value) => setValue('familyType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select family type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NUCLEAR">Nuclear Family</SelectItem>
                  <SelectItem value="JOINT">Joint Family</SelectItem>
                  <SelectItem value="SINGLE_PARENT">Single Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyValues">Family Values (Optional)</Label>
              <textarea
                id="familyValues"
                {...register('familyValues')}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe your family values..."
              />
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Lifestyle</h2>
            <div className="space-y-2">
              <Label htmlFor="drinking">Drinking Habits</Label>
              <Select
                value={watch('drinking') || ''}
                onValueChange={(value) => setValue('drinking', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Never">Never</SelectItem>
                  <SelectItem value="Occasionally">Occasionally</SelectItem>
                  <SelectItem value="Socially">Socially</SelectItem>
                  <SelectItem value="Regularly">Regularly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smoking">Smoking Habits</Label>
              <Select
                value={watch('smoking') || ''}
                onValueChange={(value) => setValue('smoking', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Never">Never</SelectItem>
                  <SelectItem value="Occasionally">Occasionally</SelectItem>
                  <SelectItem value="Regularly">Regularly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietPreference">Diet Preference (Optional)</Label>
              <Select
                value={watch('dietPreference') || ''}
                onValueChange={(value) => setValue('dietPreference', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select diet preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="Vegan">Vegan</SelectItem>
                  <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="Pescatarian">Pescatarian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hobbies">Hobbies & Interests (Optional)</Label>
              <textarea
                id="hobbies"
                {...register('hobbies')}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Reading, hiking, music..."
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Partner Preferences</h2>
            <div className="space-y-2">
              <Label>Age Range: {watch('ageMin')} - {watch('ageMax')}</Label>
              <div className="pt-2">
                <Slider
                  min={18}
                  max={100}
                  step={1}
                  value={[watch('ageMin'), watch('ageMax')]}
                  onValueChange={([min, max]) => {
                    setValue('ageMin', min)
                    setValue('ageMax', max)
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Height Range (cm): {watch('heightMin')} - {watch('heightMax')}</Label>
              <div className="pt-2">
                <Slider
                  min={100}
                  max={250}
                  step={1}
                  value={[watch('heightMin'), watch('heightMax')]}
                  onValueChange={([min, max]) => {
                    setValue('heightMin', min)
                    setValue('heightMax', max)
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.floor(watch('heightMin') / 30.48)}&apos;{Math.round((watch('heightMin') % 30.48) / 2.54)}&quot; - {Math.floor(watch('heightMax') / 30.48)}&apos;{Math.round((watch('heightMax') % 30.48) / 2.54)}&quot;
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredLocations">Preferred Locations (Optional)</Label>
              <Input
                id="preferredLocations"
                placeholder="New York, Los Angeles, Chicago (comma separated)"
                onChange={(e) => {
                  const locations = e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                  setValue('preferredLocations', locations)
                }}
              />
              <p className="text-sm text-muted-foreground">
                Enter locations separated by commas
              </p>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                More preference options will be available in your settings
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle>Step {currentStep} of {totalSteps}</CardTitle>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderStep()}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
