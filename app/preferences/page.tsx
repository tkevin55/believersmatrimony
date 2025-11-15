'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Loader2, Save, ArrowLeft, Heart } from 'lucide-react'

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

const ALL_INTERESTS = INTEREST_CATEGORIES.flatMap(cat => cat.interests)

const POLITICAL_LEANINGS = [
  { value: 'PROGRESSIVE', label: 'Progressive' },
  { value: 'LIBERAL', label: 'Liberal' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'CONSERVATIVE', label: 'Conservative' },
  { value: 'APOLITICAL', label: 'Apolitical' },
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

const EDUCATION_LEVELS = [
  { value: 'HIGH_SCHOOL', label: 'High School' },
  { value: 'ASSOCIATE', label: 'Diploma' },
  { value: 'BACHELOR', label: "Bachelor's Degree" },
  { value: 'MASTER', label: "Master's Degree" },
  { value: 'DOCTORATE', label: 'Doctorate' },
  { value: 'PROFESSIONAL', label: 'Professional Degree' },
]

export default function PreferencesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [ageMin, setAgeMin] = useState(21)
  const [ageMax, setAgeMax] = useState(35)
  const [heightMin, setHeightMin] = useState(152)
  const [heightMax, setHeightMax] = useState(183)
  const [educationLevels, setEducationLevels] = useState<string[]>([])
  const [preferredInterests, setPreferredInterests] = useState<string[]>([])
  const [preferredPoliticalLeanings, setPreferredPoliticalLeanings] = useState<string[]>([])
  const [preferredKeralaDistricts, setPreferredKeralaDistricts] = useState<string[]>([])
  const [okayWithDiaspora, setOkayWithDiaspora] = useState<string>('either')
  const [locations, setLocations] = useState<string[]>([])
  const [locationsInput, setLocationsInput] = useState('')
  const [incomeRange, setIncomeRange] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPreferences()
    }
  }, [status])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/preferences')
      if (!response.ok) {
        throw new Error('Failed to fetch preferences')
      }
      const data = await response.json()

      setAgeMin(data.ageMin || 21)
      setAgeMax(data.ageMax || 35)
      setHeightMin(data.heightMin || 152)
      setHeightMax(data.heightMax || 183)
      setEducationLevels(data.educationLevels || [])
      setPreferredInterests(data.preferredInterests || [])
      setPreferredPoliticalLeanings(data.preferredPoliticalLeanings || [])
      setPreferredKeralaDistricts(data.preferredKeralaDistricts || [])
      setOkayWithDiaspora(data.okayWithDiaspora || 'either')
      setLocations(data.locations || [])
      setLocationsInput((data.locations || []).join(', '))
      setIncomeRange(data.incomeRange || '')
    } catch (error) {
      console.error('Error fetching preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to load preferences',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageMin,
          ageMax,
          heightMin,
          heightMax,
          educationLevels,
          preferredInterests,
          preferredPoliticalLeanings,
          preferredKeralaDistricts,
          okayWithDiaspora,
          locations,
          incomeRange,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update preferences')
      }

      toast({
        title: 'Success',
        description: 'Partner preferences updated successfully',
      })

      router.push('/dashboard?tab=settings')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save preferences',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleEducation = (level: string) => {
    setEducationLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  const toggleInterest = (interest: string) => {
    setPreferredInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const togglePoliticalLeaning = (leaning: string) => {
    setPreferredPoliticalLeanings((prev) =>
      prev.includes(leaning) ? prev.filter((l) => l !== leaning) : [...prev, leaning]
    )
  }

  const toggleKeralaDistrict = (district: string) => {
    setPreferredKeralaDistricts((prev) =>
      prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]
    )
  }

  const handleLocationsChange = (value: string) => {
    setLocationsInput(value)
    const locationsList = value.split(',').map((l) => l.trim()).filter(Boolean)
    setLocations(locationsList)
  }

  const cmToFeetInches = (cm: number) => {
    const feet = Math.floor(cm / 30.48)
    const inches = Math.round((cm % 30.48) / 2.54)
    return `${feet}'${inches}" (${cm} cm)`
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
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Partner Preferences</h1>
            <p className="text-muted-foreground">Set your ideal partner criteria</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Age Range */}
        <Card>
          <CardHeader>
            <CardTitle>Age Range</CardTitle>
            <CardDescription>Preferred age range for your partner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Minimum: {ageMin} years</span>
                <span>Maximum: {ageMax} years</span>
              </div>
              <Slider
                min={18}
                max={60}
                step={1}
                value={[ageMin, ageMax]}
                onValueChange={([min, max]) => {
                  setAgeMin(min)
                  setAgeMax(max)
                }}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Height Range */}
        <Card>
          <CardHeader>
            <CardTitle>Height Range</CardTitle>
            <CardDescription>Preferred height range for your partner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Min: {cmToFeetInches(heightMin)}</span>
                <span>Max: {cmToFeetInches(heightMax)}</span>
              </div>
              <Slider
                min={122}
                max={213}
                step={3}
                value={[heightMin, heightMax]}
                onValueChange={([min, max]) => {
                  setHeightMin(min)
                  setHeightMax(max)
                }}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle>Education Level</CardTitle>
            <CardDescription>Preferred education levels (select multiple)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EDUCATION_LEVELS.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edu-${level.value}`}
                    checked={educationLevels.includes(level.value)}
                    onCheckedChange={() => toggleEducation(level.value)}
                  />
                  <Label htmlFor={`edu-${level.value}`} className="cursor-pointer">
                    {level.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferred Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Interests</CardTitle>
            <CardDescription>Select interests you'd like your partner to have (min 3 recommended)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {INTEREST_CATEGORIES.map((category) => (
              <div key={category.category} className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{category.category}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {category.interests.map((interest) => (
                    <div key={interest.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pref-interest-${interest.value}`}
                        checked={preferredInterests.includes(interest.value)}
                        onCheckedChange={() => toggleInterest(interest.value)}
                      />
                      <Label htmlFor={`pref-interest-${interest.value}`} className="cursor-pointer text-sm">
                        {interest.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preferred Political Leanings */}
        <Card>
          <CardHeader>
            <CardTitle>Political Leaning Preferences</CardTitle>
            <CardDescription>Select political leanings you're comfortable with (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {POLITICAL_LEANINGS.map((leaning) => (
                <div key={leaning.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pol-${leaning.value}`}
                    checked={preferredPoliticalLeanings.includes(leaning.value)}
                    onCheckedChange={() => togglePoliticalLeaning(leaning.value)}
                  />
                  <Label htmlFor={`pol-${leaning.value}`} className="cursor-pointer">
                    {leaning.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kerala Connection Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Kerala District Preferences</CardTitle>
            <CardDescription>Preferred home districts in Kerala (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {KERALA_DISTRICTS.map((district) => (
                <div key={district.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dist-${district.value}`}
                    checked={preferredKeralaDistricts.includes(district.value)}
                    onCheckedChange={() => toggleKeralaDistrict(district.value)}
                  />
                  <Label htmlFor={`dist-${district.value}`} className="cursor-pointer text-sm">
                    {district.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Diaspora Preference */}
        <Card>
          <CardHeader>
            <CardTitle>Diaspora Preference</CardTitle>
            <CardDescription>Are you open to partners living outside Kerala?</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={okayWithDiaspora} onValueChange={setOkayWithDiaspora}>
              <SelectTrigger>
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Only Kerala residents</SelectItem>
                <SelectItem value="yes">Only diaspora (Gulf, US, etc.)</SelectItem>
                <SelectItem value="either">Open to both Kerala and diaspora</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Locations</CardTitle>
            <CardDescription>Cities or states where you'd like your partner to be from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locations">Locations (comma separated)</Label>
              <Input
                id="locations"
                value={locationsInput}
                onChange={(e) => handleLocationsChange(e.target.value)}
                placeholder="e.g., Mumbai, Bangalore, Chennai"
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple locations with commas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Income Range */}
        <Card>
          <CardHeader>
            <CardTitle>Income Expectation</CardTitle>
            <CardDescription>Preferred income range (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={incomeRange} onValueChange={setIncomeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select income range (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No preference</SelectItem>
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
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
