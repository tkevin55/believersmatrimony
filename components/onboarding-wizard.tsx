'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { Loader2, ChevronLeft, ChevronRight, Upload, X, GripVertical, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Indian cities for autocomplete
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
  'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
  'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar',
  'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah',
  'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur',
  'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad', 'Mysore', 'Tiruchirappalli',
  'Bareilly', 'Tiruppur', 'Moradabad', 'Thiruvananthapuram', 'Bhubaneswar', 'Dehradun',
  'Kochi', 'Kozhikode', 'Thrissur', 'Kannur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kottayam',
  'Malappuram', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad', 'Ernakulam'
]

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
]

const INDIAN_LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi',
  'Gujarati', 'Punjabi', 'Odia', 'Urdu', 'Assamese', 'Konkani', 'Manipuri', 'Nepali',
  'Sanskrit', 'Kashmiri', 'Sindhi', 'Dogri', 'Maithili', 'Santali', 'Bodo'
]

// Kaapi Connect - Kerala Districts
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

// Kaapi Connect - Interest Tags (categorized)
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

const ALL_INTERESTS = INTEREST_CATEGORIES.flatMap(cat => cat.interests)

// Validation schemas for each step
const step1Schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE'], { required_error: 'Gender is required' }),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  countryCode: z.string().default('+91'),
})

const step2Schema = z.object({
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  openToRelocate: z.enum(['yes', 'no'], { required_error: 'Please select an option' }),
  homeDistrict: z.string().optional(),
  diasporaLocation: z.string().optional(),
  keralaConnection: z.string().optional(),
  languagePreference: z.string().optional(),
  relocationFlexibility: z.string().optional(),
})

const step3Schema = z.object({
  interestTags: z.array(z.string()).min(5, 'Select at least 5 interests'),
})

const step4Schema = z.object({
  photos: z.array(z.object({
    data: z.string(),
    order: z.number(),
    isPrimary: z.boolean(),
  })).min(3, 'You must upload at least 3 photos to continue').max(8, 'Maximum 8 photos allowed'),
})

const step5Schema = z.object({
  height: z.number().min(122, 'Height is required').max(213, 'Height is required'),
  bodyType: z.string().min(1, 'Body type is required'),
  complexion: z.string().optional(),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
})

const step6Schema = z.object({
  educationLevel: z.string().min(1, 'Education level is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  occupation: z.string().min(1, 'Occupation is required'),
  company: z.string().optional(),
  incomeRange: z.string().min(1, 'Income range is required'),
})

const step7Schema = z.object({
  fatherOccupation: z.string().min(1, 'Father\'s occupation is required'),
  motherOccupation: z.string().min(1, 'Mother\'s occupation is required'),
  siblingsCount: z.number().min(0, 'Number of siblings is required').max(10),
  birthOrder: z.string().min(1, 'Birth order is required'),
  familyType: z.string().min(1, 'Family type is required'),
  familyValues: z.string().min(1, 'Family values is required'),
})

const step8Schema = z.object({
  // Lifestyle
  drinking: z.string().min(1, 'Drinking habit is required'),
  smoking: z.string().min(1, 'Smoking habit is required'),
  diet: z.string().min(1, 'Diet preference is required'),
  // Values & lifestyle
  politicalLeaning: z.string().min(1, 'Political leaning is required'),
  socialValues: z.array(z.string()).optional(),
  relationshipTimeline: z.string().optional(),
  wantChildren: z.string().optional(),
  livingArrangementPreference: z.string().optional(),
  weekendPreference: z.array(z.string()).optional(),
  communicationStyle: z.string().optional(),
  // Partner preferences
  partnerAgeMin: z.number().min(18).max(60),
  partnerAgeMax: z.number().min(18).max(60),
  partnerHeightMin: z.number().min(122).max(213),
  partnerHeightMax: z.number().min(122).max(213),
  partnerMinEducation: z.string().min(1, 'Partner education preference is required'),
  preferredInterests: z.array(z.string()).min(3, 'Select at least 3 preferred interests'),
  preferredPoliticalLeanings: z.array(z.string()).optional(),
  preferredKeralaDistricts: z.array(z.string()).optional(),
  okayWithDiaspora: z.enum(['yes', 'no', 'either']).optional(),
  partnerLocations: z.array(z.string()).optional(),
  partnerIncomeExpectation: z.string().optional(),
})

// Combined schema for all steps
const fullSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
  ...step6Schema.shape,
  ...step7Schema.shape,
  ...step8Schema.shape,
})

type FormData = z.infer<typeof fullSchema>

interface OnboardingWizardProps {
  userId: string
  initialName?: string
}

interface PhotoFile {
  data: string
  order: number
  isPrimary: boolean
}

export default function OnboardingWizard({ userId, initialName }: OnboardingWizardProps) {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialName || '',
      countryCode: '+91',
      country: 'India',
      openToRelocate: 'no',
      height: 165, // Default height (5'5" / 165cm)
      bodyType: 'AVERAGE',
      siblingsCount: 0,
      familyType: 'NUCLEAR',
      partnerAgeMin: 25,
      partnerAgeMax: 35,
      partnerHeightMin: 152,
      partnerHeightMax: 183,
      photos: [],
      languages: [],
      interestTags: [],
      socialValues: [],
      weekendPreference: [],
      preferredInterests: [],
      preferredPoliticalLeanings: [],
      preferredKeralaDistricts: [],
      partnerLocations: [],
    },
  })

  const totalSteps = 8

  // Handle photo upload
  const onDrop = (acceptedFiles: File[]) => {
    const currentPhotoCount = photos.length
    if (currentPhotoCount + acceptedFiles.length > 8) {
      toast({
        title: 'Too many photos',
        description: 'You can upload a maximum of 8 photos',
      })
      return
    }

    acceptedFiles.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 5MB`,
        })
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const newPhoto: PhotoFile = {
          data: reader.result as string,
          order: photos.length,
          isPrimary: photos.length === 0, // First photo is primary by default
        }
        const updatedPhotos = [...photos, newPhoto]
        setPhotos(updatedPhotos)
        setValue('photos', updatedPhotos)
      }
      reader.readAsDataURL(file)
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: true,
  })

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index).map((photo, i) => ({
      ...photo,
      order: i,
      isPrimary: i === 0 && photos.length > 1 ? true : photo.isPrimary,
    }))
    setPhotos(updatedPhotos)
    setValue('photos', updatedPhotos)
  }

  const setPrimaryPhoto = (index: number) => {
    const updatedPhotos = photos.map((photo, i) => ({
      ...photo,
      isPrimary: i === index,
    }))
    setPhotos(updatedPhotos)
    setValue('photos', updatedPhotos)
  }

  const handleDragStart = (index: number) => {
    setDraggedPhotoIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedPhotoIndex === null || draggedPhotoIndex === index) return

    const updatedPhotos = [...photos]
    const draggedPhoto = updatedPhotos[draggedPhotoIndex]
    updatedPhotos.splice(draggedPhotoIndex, 1)
    updatedPhotos.splice(index, 0, draggedPhoto)

    // Update orders
    const reorderedPhotos = updatedPhotos.map((photo, i) => ({
      ...photo,
      order: i,
    }))

    setPhotos(reorderedPhotos)
    setValue('photos', reorderedPhotos)
    setDraggedPhotoIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedPhotoIndex(null)
  }

  // Save progress after each step
  const saveProgress = async (stepData: any) => {
    setIsSavingProgress(true)
    try {
      const response = await fetch('/api/onboarding/progress', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          step: currentStep,
          data: stepData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save progress')
      }
    } catch (error) {
      console.error('Error saving progress:', error)
      toast({
        title: 'Warning',
        description: 'Progress was not saved. Please continue.',
      })
    } finally {
      setIsSavingProgress(false)
    }
  }

  const nextStep = async () => {
    let isValid = false
    let stepData: any = {}

    // Validate current step
    switch (currentStep) {
      case 1:
        isValid = await trigger(['name', 'dateOfBirth', 'gender', 'phoneNumber', 'countryCode'])
        if (isValid) {
          // Check age >= 18
          const birthDate = new Date(watch('dateOfBirth'))
          const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          if (age < 18) {
            toast({
              title: 'Age Restriction',
              description: 'You must be at least 18 years old to register',
            })
            return
          }
          stepData = {
            name: watch('name'),
            dateOfBirth: watch('dateOfBirth'),
            gender: watch('gender'),
            phoneNumber: watch('phoneNumber'),
            countryCode: watch('countryCode'),
          }
        }
        break
      case 2:
        isValid = await trigger(['city', 'state', 'country', 'openToRelocate'])
        if (isValid) {
          stepData = {
            city: watch('city'),
            state: watch('state'),
            country: watch('country'),
            openToRelocate: watch('openToRelocate'),
            homeDistrict: watch('homeDistrict'),
            diasporaLocation: watch('diasporaLocation'),
            keralaConnection: watch('keralaConnection'),
            languagePreference: watch('languagePreference'),
            relocationFlexibility: watch('relocationFlexibility'),
          }
        }
        break
      case 3:
        isValid = await trigger(['interestTags'])
        if (isValid) {
          stepData = {
            interestTags: watch('interestTags'),
          }
        }
        break
      case 4:
        isValid = await trigger(['photos'])
        if (isValid) {
          stepData = {
            photos: watch('photos'),
          }
        }
        break
      case 5:
        isValid = await trigger(['height', 'bodyType', 'languages'])
        if (isValid) {
          stepData = {
            height: watch('height'),
            bodyType: watch('bodyType'),
            complexion: watch('complexion'),
            languages: watch('languages'),
          }
        }
        break
      case 6:
        isValid = await trigger(['educationLevel', 'fieldOfStudy', 'occupation', 'incomeRange'])
        if (isValid) {
          stepData = {
            educationLevel: watch('educationLevel'),
            fieldOfStudy: watch('fieldOfStudy'),
            occupation: watch('occupation'),
            company: watch('company'),
            incomeRange: watch('incomeRange'),
          }
        }
        break
      case 7:
        isValid = await trigger(['fatherOccupation', 'motherOccupation', 'siblingsCount', 'birthOrder', 'familyType', 'familyValues'])
        if (isValid) {
          stepData = {
            fatherOccupation: watch('fatherOccupation'),
            motherOccupation: watch('motherOccupation'),
            siblingsCount: watch('siblingsCount'),
            birthOrder: watch('birthOrder'),
            familyType: watch('familyType'),
            familyValues: watch('familyValues'),
          }
        }
        break
      case 8:
        // Don't move to next step from step 8, this will be handled by submit
        return
      default:
        break
    }

    if (!isValid) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly',
      })
      return
    }

    // Save progress
    await saveProgress(stepData)

    // Move to next step
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onSubmit = async (data: FormData) => {
    // Validate step 8 fields
    const isValid = await trigger([
      'drinking', 'smoking', 'diet', 'politicalLeaning', 'partnerAgeMin', 'partnerAgeMax',
      'partnerHeightMin', 'partnerHeightMax', 'partnerMinEducation', 'preferredInterests'
    ])

    if (!isValid) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...data,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Onboarding error:', error)

        // Show detailed error information
        const errorMessage = error.details || error.error || 'Failed to complete onboarding'
        const errorHint = error.hint ? `\n${error.hint}` : ''

        throw new Error(errorMessage + errorHint)
      }

      console.log('Onboarding completed successfully, updating session...')

      toast({
        title: 'Success!',
        description: 'Your profile has been completed successfully. Redirecting...',
      })

      // Update the session to reflect onboarding completion
      console.log('Updating session with new onboarding status...')
      await updateSession({ onboardingCompleted: true })

      // Wait a moment to ensure session is updated
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('Redirecting to discover page...')
      // Use router push instead of window.location
      router.push('/discover')
      router.refresh()
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Height conversion helper
  const cmToFeetInches = (cm: number) => {
    const feet = Math.floor(cm / 30.48)
    const inches = Math.round((cm % 30.48) / 2.54)
    return `${feet}'${inches}" (${cm} cm)`
  }

  // Generate height options
  const heightOptions: { value: number; label: string }[] = []
  for (let cm = 122; cm <= 213; cm += 3) {
    heightOptions.push({ value: cm, label: cmToFeetInches(cm) })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Basic Information</h2>
              <p className="text-muted-foreground">Let's start with your basic details</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter your full name"
                  className={cn(errors.name && 'border-red-500')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  max={new Date().toISOString().split('T')[0]}
                  className={cn(errors.dateOfBirth && 'border-red-500')}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                )}
                <p className="text-sm text-muted-foreground">You must be at least 18 years old</p>
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="MALE"
                      {...register('gender')}
                      className="w-4 h-4"
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="FEMALE"
                      {...register('gender')}
                      className="w-4 h-4"
                    />
                    <span>Female</span>
                  </label>
                </div>
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <div className="flex gap-2">
                  <Select
                    value={watch('countryCode')}
                    onValueChange={(value) => setValue('countryCode', value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+971">🇦🇪 +971</SelectItem>
                      <SelectItem value="+65">🇸🇬 +65</SelectItem>
                      <SelectItem value="+61">🇦🇺 +61</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phoneNumber"
                    {...register('phoneNumber')}
                    placeholder="Enter phone number"
                    className={cn('flex-1', errors.phoneNumber && 'border-red-500')}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Location & Kerala Connection</h2>
              <p className="text-muted-foreground">Tell us where you are and your connection to Kerala</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">Current City *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  list="cities"
                  placeholder="Select or type your city"
                  className={cn(errors.city && 'border-red-500')}
                />
                <datalist id="cities">
                  {INDIAN_CITIES.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Select
                  value={watch('state') || ''}
                  onValueChange={(value) => setValue('state', value, { shouldValidate: true })}
                >
                  <SelectTrigger className={cn(errors.state && 'border-red-500')}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={watch('country')}
                  onValueChange={(value) => setValue('country', value, { shouldValidate: true })}
                >
                  <SelectTrigger className={cn(errors.country && 'border-red-500')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="UAE">UAE</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country.message}</p>
                )}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                <h3 className="font-semibold text-blue-900">Kerala Connection (Optional)</h3>

                <div className="space-y-2">
                  <Label htmlFor="homeDistrict">Home District</Label>
                  <Select
                    value={watch('homeDistrict') || ''}
                    onValueChange={(value) => setValue('homeDistrict', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select home district" />
                    </SelectTrigger>
                    <SelectContent>
                      {KERALA_DISTRICTS.map((district) => (
                        <SelectItem key={district.value} value={district.value}>
                          {district.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Which Kerala district do you identify with?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diasporaLocation">Diaspora Location</Label>
                  <Select
                    value={watch('diasporaLocation') || 'NONE'}
                    onValueChange={(value) => setValue('diasporaLocation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select diaspora location" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIASPORA_LOCATIONS.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Are you part of the Kerala diaspora?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keralaConnection">Kerala Connection Strength</Label>
                  <Select
                    value={watch('keralaConnection') || ''}
                    onValueChange={(value) => setValue('keralaConnection', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select connection strength" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VERY_STRONG">Very Strong</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="WEAK">Weak</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">How connected do you feel to Kerala culture?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languagePreference">Language Preference</Label>
                  <Select
                    value={watch('languagePreference') || ''}
                    onValueChange={(value) => setValue('languagePreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALAYALAM_ONLY">Malayalam only</SelectItem>
                      <SelectItem value="MALAYALAM_PREFERRED">Malayalam preferred</SelectItem>
                      <SelectItem value="BILINGUAL">Bilingual (Malayalam & English)</SelectItem>
                      <SelectItem value="ENGLISH_PREFERRED">English preferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Open to Relocate? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="yes"
                      {...register('openToRelocate')}
                      className="w-4 h-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="no"
                      {...register('openToRelocate')}
                      className="w-4 h-4"
                    />
                    <span>No</span>
                  </label>
                </div>
                {errors.openToRelocate && (
                  <p className="text-sm text-red-500">{errors.openToRelocate.message}</p>
                )}
              </div>

              {watch('openToRelocate') === 'yes' && (
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
                      <SelectItem value="READY_TO_MOVE">Ready to move anywhere</SelectItem>
                      <SelectItem value="PREFER_CURRENT_CITY">Prefer current city</SelectItem>
                      <SelectItem value="KERALA_ONLY">Kerala only</SelectItem>
                      <SelectItem value="INTERNATIONAL_OK">International OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Interests & Hobbies</h2>
              <p className="text-muted-foreground">Select at least 5 interests that describe you</p>
            </div>

            <div className="space-y-6">
              {INTEREST_CATEGORIES.map((category) => (
                <div key={category.category} className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {category.category}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {category.interests.map((interest) => (
                      <label
                        key={interest.value}
                        className={cn(
                          "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors",
                          watch('interestTags')?.includes(interest.value)
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-primary/50'
                        )}
                      >
                        <Checkbox
                          checked={watch('interestTags')?.includes(interest.value)}
                          onCheckedChange={(checked) => {
                            const currentTags = watch('interestTags') || []
                            if (checked) {
                              setValue('interestTags', [...currentTags, interest.value], { shouldValidate: true })
                            } else {
                              setValue('interestTags', currentTags.filter(t => t !== interest.value), { shouldValidate: true })
                            }
                          }}
                        />
                        <span className="text-sm">{interest.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <span className="font-medium">
                    {watch('interestTags')?.length || 0} interests selected
                  </span>
                </div>
                {(watch('interestTags')?.length || 0) < 5 && (
                  <span className="text-sm text-red-500">
                    Select at least 5
                  </span>
                )}
              </div>

              {errors.interestTags && (
                <p className="text-sm text-red-500">{errors.interestTags.message}</p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Upload Photos</h2>
              <p className="text-muted-foreground">Upload at least 3 photos (maximum 8)</p>
            </div>

            <div className="space-y-4">
              {photos.length < 8 && (
                <div
                  {...getRootProps()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
                    photos.length < 3 && errors.photos && 'border-red-500'
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {isDragActive ? 'Drop photos here' : 'Drag & drop photos here'}
                      </p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, JPEG, PNG, WebP (max 5MB per photo)
                    </p>
                  </div>
                </div>
              )}

              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'relative group rounded-lg overflow-hidden border-2 transition-all cursor-move',
                        photo.isPrimary ? 'border-primary ring-2 ring-primary' : 'border-muted'
                      )}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={photo.data}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removePhoto(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {!photo.isPrimary && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setPrimaryPhoto(index)}
                              className="h-8 text-xs px-2"
                            >
                              Set Primary
                            </Button>
                          )}
                        </div>
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs cursor-move">
                          <GripVertical className="h-3 w-3" />
                        </div>
                        {photo.isPrimary && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                            Primary
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  <span className="font-medium">
                    {photos.length} of 8 photos uploaded
                  </span>
                </div>
                {photos.length < 3 && (
                  <span className="text-sm text-red-500">
                    Minimum 3 photos required
                  </span>
                )}
              </div>

              {errors.photos && (
                <p className="text-sm text-red-500">{errors.photos.message}</p>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tips for great photos:</strong>
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                  <li>Use clear, recent photos</li>
                  <li>Include at least one close-up face photo</li>
                  <li>Show your personality and interests</li>
                  <li>Ensure good lighting</li>
                  <li>Avoid group photos or heavy filters</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Physical Attributes</h2>
              <p className="text-muted-foreground">Help us with your physical characteristics</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height *</Label>
                <Select
                  value={watch('height')?.toString() || ''}
                  onValueChange={(value) => setValue('height', parseInt(value), { shouldValidate: true })}
                >
                  <SelectTrigger className={cn(errors.height && 'border-red-500')}>
                    <SelectValue placeholder="Select height" />
                  </SelectTrigger>
                  <SelectContent>
                    {heightOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.height && (
                  <p className="text-sm text-red-500">{errors.height.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyType">Body Type *</Label>
                <Select
                  value={watch('bodyType')}
                  onValueChange={(value) => setValue('bodyType', value, { shouldValidate: true })}
                >
                  <SelectTrigger className={cn(errors.bodyType && 'border-red-500')}>
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
                {errors.bodyType && (
                  <p className="text-sm text-red-500">{errors.bodyType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="complexion">Complexion (Optional)</Label>
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
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Languages Spoken *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-4 border rounded-lg">
                  {INDIAN_LANGUAGES.map((language) => (
                    <label key={language} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={watch('languages')?.includes(language)}
                        onCheckedChange={(checked) => {
                          const currentLanguages = watch('languages') || []
                          if (checked) {
                            setValue('languages', [...currentLanguages, language], { shouldValidate: true })
                          } else {
                            setValue('languages', currentLanguages.filter(l => l !== language), { shouldValidate: true })
                          }
                        }}
                      />
                      <span className="text-sm">{language}</span>
                    </label>
                  ))}
                </div>
                {errors.languages && (
                  <p className="text-sm text-red-500">{errors.languages.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Education & Career</h2>
              <p className="text-muted-foreground">Tell us about your education and profession</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="educationLevel">Highest Education *</Label>
                <Select
                  value={watch('educationLevel') || ''}
                  onValueChange={(value) => setValue('educationLevel', value, { shouldValidate: true })}
                >
                  <SelectTrigger className={cn(errors.educationLevel && 'border-red-500')}>
                    <SelectValue placeholder="Select education level" />
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
                {errors.educationLevel && (
                  <p className="text-sm text-red-500">{errors.educationLevel.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                <Input
                  id="fieldOfStudy"
                  {...register('fieldOfStudy')}
                  placeholder="e.g., Computer Science, Medicine, Business"
                  className={cn(errors.fieldOfStudy && 'border-red-500')}
                />
                {errors.fieldOfStudy && (
                  <p className="text-sm text-red-500">{errors.fieldOfStudy.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Current Occupation *</Label>
                <Input
                  id="occupation"
                  {...register('occupation')}
                  placeholder="e.g., Software Engineer, Doctor, Teacher"
                  className={cn(errors.occupation && 'border-red-500')}
                />
                {errors.occupation && (
                  <p className="text-sm text-red-500">{errors.occupation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company/Organization (Optional)</Label>
                <Input
                  id="company"
                  {...register('company')}
                  placeholder="Enter your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incomeRange">Annual Income (INR) *</Label>
                <Select
                  value={watch('incomeRange') || ''}
                  onValueChange={(value) => setValue('incomeRange', value, { shouldValidate: true })}
                >
                  <SelectTrigger className={cn(errors.incomeRange && 'border-red-500')}>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BELOW_3_LAKHS">Below 3 Lakhs</SelectItem>
                    <SelectItem value="THREE_TO_FIVE_LAKHS">3-5 Lakhs</SelectItem>
                    <SelectItem value="FIVE_TO_SEVEN_LAKHS">5-7 Lakhs</SelectItem>
                    <SelectItem value="SEVEN_TO_TEN_LAKHS">7-10 Lakhs</SelectItem>
                    <SelectItem value="TEN_TO_FIFTEEN_LAKHS">10-15 Lakhs</SelectItem>
                    <SelectItem value="FIFTEEN_TO_TWENTY_LAKHS">15-20 Lakhs</SelectItem>
                    <SelectItem value="TWENTY_TO_THIRTY_LAKHS">20-30 Lakhs</SelectItem>
                    <SelectItem value="ABOVE_THIRTY_LAKHS">30+ Lakhs</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {errors.incomeRange && (
                  <p className="text-sm text-red-500">{errors.incomeRange.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Family Background</h2>
              <p className="text-muted-foreground">Tell us about your family</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fatherOccupation">Father's Occupation *</Label>
                <Input
                  id="fatherOccupation"
                  {...register('fatherOccupation')}
                  placeholder="Enter father's occupation"
                  className={cn(errors.fatherOccupation && 'border-red-500')}
                />
                {errors.fatherOccupation && (
                  <p className="text-sm text-red-500">{errors.fatherOccupation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherOccupation">Mother's Occupation *</Label>
                <Input
                  id="motherOccupation"
                  {...register('motherOccupation')}
                  placeholder="Enter mother's occupation"
                  className={cn(errors.motherOccupation && 'border-red-500')}
                />
                {errors.motherOccupation && (
                  <p className="text-sm text-red-500">{errors.motherOccupation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="siblingsCount">Number of Siblings *</Label>
                <Select
                  value={watch('siblingsCount')?.toString() || '0'}
                  onValueChange={(value) => setValue('siblingsCount', parseInt(value), { shouldValidate: true })}
                >
                  <SelectTrigger className={cn(errors.siblingsCount && 'border-red-500')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.siblingsCount && (
                  <p className="text-sm text-red-500">{errors.siblingsCount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthOrder">Your Birth Order *</Label>
                <Select
                  value={watch('birthOrder') || ''}
                  onValueChange={(value) => setValue('birthOrder', value, { shouldValidate: true })}
                >
                  <SelectTrigger className={cn(errors.birthOrder && 'border-red-500')}>
                    <SelectValue placeholder="Select birth order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Only child">Only child</SelectItem>
                    <SelectItem value="Eldest">Eldest</SelectItem>
                    <SelectItem value="Middle">Middle</SelectItem>
                    <SelectItem value="Youngest">Youngest</SelectItem>
                  </SelectContent>
                </Select>
                {errors.birthOrder && (
                  <p className="text-sm text-red-500">{errors.birthOrder.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyType">Family Type *</Label>
                <Select
                  value={watch('familyType')}
                  onValueChange={(value) => setValue('familyType', value, { shouldValidate: true })}
                >
                  <SelectTrigger className={cn(errors.familyType && 'border-red-500')}>
                    <SelectValue placeholder="Select family type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUCLEAR">Nuclear</SelectItem>
                    <SelectItem value="JOINT">Joint</SelectItem>
                    <SelectItem value="SINGLE_PARENT">Extended</SelectItem>
                  </SelectContent>
                </Select>
                {errors.familyType && (
                  <p className="text-sm text-red-500">{errors.familyType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyValues">Family Values *</Label>
                <Select
                  value={watch('familyValues') || ''}
                  onValueChange={(value) => setValue('familyValues', value, { shouldValidate: true })}
                >
                  <SelectTrigger className={cn(errors.familyValues && 'border-red-500')}>
                    <SelectValue placeholder="Select family values" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Traditional">Traditional</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Liberal">Liberal</SelectItem>
                    <SelectItem value="Progressive">Progressive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.familyValues && (
                  <p className="text-sm text-red-500">{errors.familyValues.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Values, Lifestyle & Partner Preferences</h2>
              <p className="text-muted-foreground">Final step - tell us about your values and partner preferences</p>
            </div>

            <div className="space-y-6">
              {/* Your Lifestyle */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Lifestyle</h3>

                <div className="space-y-2">
                  <Label htmlFor="drinking">Drinking *</Label>
                  <Select
                    value={watch('drinking') || ''}
                    onValueChange={(value) => setValue('drinking', value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={cn(errors.drinking && 'border-red-500')}>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never">Never</SelectItem>
                      <SelectItem value="Socially">Socially</SelectItem>
                      <SelectItem value="Regularly">Regularly</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.drinking && (
                    <p className="text-sm text-red-500">{errors.drinking.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smoking">Smoking *</Label>
                  <Select
                    value={watch('smoking') || ''}
                    onValueChange={(value) => setValue('smoking', value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={cn(errors.smoking && 'border-red-500')}>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never">Never</SelectItem>
                      <SelectItem value="Occasionally">Occasionally</SelectItem>
                      <SelectItem value="Regularly">Regularly</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.smoking && (
                    <p className="text-sm text-red-500">{errors.smoking.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diet">Diet *</Label>
                  <Select
                    value={watch('diet') || ''}
                    onValueChange={(value) => setValue('diet', value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={cn(errors.diet && 'border-red-500')}>
                      <SelectValue placeholder="Select diet preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                      <SelectItem value="Non-vegetarian">Non-vegetarian</SelectItem>
                      <SelectItem value="Vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.diet && (
                    <p className="text-sm text-red-500">{errors.diet.message}</p>
                  )}
                </div>
              </div>

              {/* Values & Personality */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Your Values & Personality</h3>

                <div className="space-y-2">
                  <Label htmlFor="politicalLeaning">Political Leaning *</Label>
                  <Select
                    value={watch('politicalLeaning') || ''}
                    onValueChange={(value) => setValue('politicalLeaning', value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={cn(errors.politicalLeaning && 'border-red-500')}>
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
                  {errors.politicalLeaning && (
                    <p className="text-sm text-red-500">{errors.politicalLeaning.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Social Values (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Feminist', 'Egalitarian', 'Family-oriented', 'Career-focused', 'Spiritual', 'Environmentalist'].map((value) => (
                      <label
                        key={value}
                        className={cn(
                          "flex items-center gap-2 p-2 border rounded cursor-pointer",
                          watch('socialValues')?.includes(value.toLowerCase())
                            ? 'border-primary bg-primary/10'
                            : 'border-muted'
                        )}
                      >
                        <Checkbox
                          checked={watch('socialValues')?.includes(value.toLowerCase())}
                          onCheckedChange={(checked) => {
                            const current = watch('socialValues') || []
                            if (checked) {
                              setValue('socialValues', [...current, value.toLowerCase()])
                            } else {
                              setValue('socialValues', current.filter(v => v !== value.toLowerCase()))
                            }
                          }}
                        />
                        <span className="text-sm">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationshipTimeline">Relationship Timeline (Optional)</Label>
                  <Select
                    value={watch('relationshipTimeline') || ''}
                    onValueChange={(value) => setValue('relationshipTimeline', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASUAL_TO_SERIOUS">Casual to serious</SelectItem>
                      <SelectItem value="LIFE_PARTNER_SOON">Life partner soon</SelectItem>
                      <SelectItem value="OPEN_TO_FLOW">Open to flow</SelectItem>
                      <SelectItem value="NO_RUSH">No rush</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wantChildren">Want Children? (Optional)</Label>
                  <Select
                    value={watch('wantChildren') || ''}
                    onValueChange={(value) => setValue('wantChildren', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">Yes</SelectItem>
                      <SelectItem value="NO">No</SelectItem>
                      <SelectItem value="UNDECIDED">Undecided</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="livingArrangementPreference">Living Arrangement Preference (Optional)</Label>
                  <Select
                    value={watch('livingArrangementPreference') || ''}
                    onValueChange={(value) => setValue('livingArrangementPreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NUCLEAR">Nuclear family</SelectItem>
                      <SelectItem value="EXTENDED_OK">Extended family OK</SelectItem>
                      <SelectItem value="EITHER">Either works</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Weekend Preferences (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Outdoors', 'Stay in', 'Friends', 'Family time'].map((pref) => (
                      <label
                        key={pref}
                        className={cn(
                          "flex items-center gap-2 p-2 border rounded cursor-pointer",
                          watch('weekendPreference')?.includes(pref.toUpperCase().replace(' ', '_'))
                            ? 'border-primary bg-primary/10'
                            : 'border-muted'
                        )}
                      >
                        <Checkbox
                          checked={watch('weekendPreference')?.includes(pref.toUpperCase().replace(' ', '_'))}
                          onCheckedChange={(checked) => {
                            const current = watch('weekendPreference') || []
                            const value = pref.toUpperCase().replace(' ', '_')
                            if (checked) {
                              setValue('weekendPreference', [...current, value])
                            } else {
                              setValue('weekendPreference', current.filter(p => p !== value))
                            }
                          }}
                        />
                        <span className="text-sm">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communicationStyle">Communication Style (Optional)</Label>
                  <Select
                    value={watch('communicationStyle') || ''}
                    onValueChange={(value) => setValue('communicationStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VERY_EXPRESSIVE">Very expressive</SelectItem>
                      <SelectItem value="BALANCED">Balanced</SelectItem>
                      <SelectItem value="QUIET">Quiet & reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Partner Preferences */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Partner Preferences</h3>

                <div className="space-y-2">
                  <Label>Age Range * ({watch('partnerAgeMin')} - {watch('partnerAgeMax')} years)</Label>
                  <Slider
                    min={18}
                    max={60}
                    step={1}
                    value={[watch('partnerAgeMin'), watch('partnerAgeMax')]}
                    onValueChange={([min, max]) => {
                      setValue('partnerAgeMin', min, { shouldValidate: true })
                      setValue('partnerAgeMax', max, { shouldValidate: true })
                    }}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Height Preference * ({cmToFeetInches(watch('partnerHeightMin'))} - {cmToFeetInches(watch('partnerHeightMax'))})</Label>
                  <Slider
                    min={122}
                    max={213}
                    step={3}
                    value={[watch('partnerHeightMin'), watch('partnerHeightMax')]}
                    onValueChange={([min, max]) => {
                      setValue('partnerHeightMin', min, { shouldValidate: true })
                      setValue('partnerHeightMax', max, { shouldValidate: true })
                    }}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnerMinEducation">Minimum Education *</Label>
                  <Select
                    value={watch('partnerMinEducation') || ''}
                    onValueChange={(value) => setValue('partnerMinEducation', value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={cn(errors.partnerMinEducation && 'border-red-500')}>
                      <SelectValue placeholder="Select minimum education" />
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
                  {errors.partnerMinEducation && (
                    <p className="text-sm text-red-500">{errors.partnerMinEducation.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Preferred Interests * (Select at least 3)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-4 border rounded-lg">
                    {ALL_INTERESTS.map((interest) => (
                      <label
                        key={interest.value}
                        className={cn(
                          "flex items-center gap-2 p-2 border rounded cursor-pointer",
                          watch('preferredInterests')?.includes(interest.value)
                            ? 'border-primary bg-primary/10'
                            : 'border-muted'
                        )}
                      >
                        <Checkbox
                          checked={watch('preferredInterests')?.includes(interest.value)}
                          onCheckedChange={(checked) => {
                            const current = watch('preferredInterests') || []
                            if (checked) {
                              setValue('preferredInterests', [...current, interest.value], { shouldValidate: true })
                            } else {
                              setValue('preferredInterests', current.filter(i => i !== interest.value), { shouldValidate: true })
                            }
                          }}
                        />
                        <span className="text-sm">{interest.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {watch('preferredInterests')?.length || 0} interests selected
                    </span>
                    {(watch('preferredInterests')?.length || 0) < 3 && (
                      <span className="text-sm text-red-500">Select at least 3</span>
                    )}
                  </div>
                  {errors.preferredInterests && (
                    <p className="text-sm text-red-500">{errors.preferredInterests.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Preferred Political Leanings (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['PROGRESSIVE', 'LIBERAL', 'MODERATE', 'CONSERVATIVE'].map((lean) => (
                      <label
                        key={lean}
                        className={cn(
                          "flex items-center gap-2 p-2 border rounded cursor-pointer",
                          watch('preferredPoliticalLeanings')?.includes(lean)
                            ? 'border-primary bg-primary/10'
                            : 'border-muted'
                        )}
                      >
                        <Checkbox
                          checked={watch('preferredPoliticalLeanings')?.includes(lean)}
                          onCheckedChange={(checked) => {
                            const current = watch('preferredPoliticalLeanings') || []
                            if (checked) {
                              setValue('preferredPoliticalLeanings', [...current, lean])
                            } else {
                              setValue('preferredPoliticalLeanings', current.filter(l => l !== lean))
                            }
                          }}
                        />
                        <span className="text-sm capitalize">{lean.toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Kerala Districts (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg">
                    {KERALA_DISTRICTS.map((district) => (
                      <label
                        key={district.value}
                        className={cn(
                          "flex items-center gap-2 p-2 border rounded cursor-pointer",
                          watch('preferredKeralaDistricts')?.includes(district.value)
                            ? 'border-primary bg-primary/10'
                            : 'border-muted'
                        )}
                      >
                        <Checkbox
                          checked={watch('preferredKeralaDistricts')?.includes(district.value)}
                          onCheckedChange={(checked) => {
                            const current = watch('preferredKeralaDistricts') || []
                            if (checked) {
                              setValue('preferredKeralaDistricts', [...current, district.value])
                            } else {
                              setValue('preferredKeralaDistricts', current.filter(d => d !== district.value))
                            }
                          }}
                        />
                        <span className="text-sm">{district.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="okayWithDiaspora">Okay with Partner in Diaspora? (Optional)</Label>
                  <Select
                    value={watch('okayWithDiaspora') || ''}
                    onValueChange={(value) => setValue('okayWithDiaspora', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="either">Either is fine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnerLocations">Preferred Locations (Optional)</Label>
                  <Input
                    id="partnerLocations"
                    placeholder="e.g., Kochi, Bangalore, Chennai (comma separated)"
                    onChange={(e) => {
                      const locations = e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                      setValue('partnerLocations', locations)
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnerIncomeExpectation">Income Expectation (Optional)</Label>
                  <Select
                    value={watch('partnerIncomeExpectation') || ''}
                    onValueChange={(value) => setValue('partnerIncomeExpectation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select income expectation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BELOW_3_LAKHS">Below 3 Lakhs</SelectItem>
                      <SelectItem value="THREE_TO_FIVE_LAKHS">3-5 Lakhs</SelectItem>
                      <SelectItem value="FIVE_TO_SEVEN_LAKHS">5-7 Lakhs</SelectItem>
                      <SelectItem value="SEVEN_TO_TEN_LAKHS">7-10 Lakhs</SelectItem>
                      <SelectItem value="TEN_TO_FIFTEEN_LAKHS">10-15 Lakhs</SelectItem>
                      <SelectItem value="FIFTEEN_TO_TWENTY_LAKHS">15-20 Lakhs</SelectItem>
                      <SelectItem value="TWENTY_TO_THIRTY_LAKHS">20-30 Lakhs</SelectItem>
                      <SelectItem value="ABOVE_THIRTY_LAKHS">30+ Lakhs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="space-y-3">
          <CardTitle className="text-center">Step {currentStep} of {totalSteps}</CardTitle>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {renderStep()}

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting || isSavingProgress}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting || isSavingProgress || (currentStep === 4 && photos.length < 3)}
              >
                {isSavingProgress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  'Complete My Profile'
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
