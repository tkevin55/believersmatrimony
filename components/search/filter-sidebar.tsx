'use client'

import React, { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export interface SearchFilters {
  ageMin: number
  ageMax: number
  heightMin: number
  heightMax: number
  interestTags: string[]
  politicalLeanings: string[]
  keralaDistricts: string[]
  locations: string[]
  educationLevels: string[]
  occupation: string
  incomeRange: string
  drinking: string
  smoking: string
  withPhotoOnly: boolean
  verifiedOnly: boolean
  onlineOnly: boolean
}

interface FilterSidebarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onReset: () => void
}

// Kaapi Connect Interest Tags
const INTEREST_TAGS = [
  { value: 'music', label: 'Music' },
  { value: 'movies', label: 'Movies' },
  { value: 'reading', label: 'Reading' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'travel', label: 'Travel' },
  { value: 'photography', label: 'Photography' },
  { value: 'sports', label: 'Sports' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'art', label: 'Art' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'dancing', label: 'Dancing' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'writing', label: 'Writing' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'tech', label: 'Technology' },
]

// Political Leaning Options (Kaapi Connect)
const POLITICAL_LEANINGS = [
  { value: 'PROGRESSIVE', label: 'Progressive' },
  { value: 'LIBERAL', label: 'Liberal' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'CONSERVATIVE', label: 'Conservative' },
  { value: 'APOLITICAL', label: 'Apolitical' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
]

// Kerala Districts (Kaapi Connect)
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
  { value: 'ASSOCIATE', label: 'Associate Degree' },
  { value: 'BACHELOR', label: 'Bachelor\'s Degree' },
  { value: 'MASTER', label: 'Master\'s Degree' },
  { value: 'DOCTORATE', label: 'Doctorate' },
  { value: 'PROFESSIONAL', label: 'Professional Degree' },
]

const INCOME_RANGES = [
  { value: 'below_25k', label: 'Below $25,000' },
  { value: '25k_50k', label: '$25,000 - $50,000' },
  { value: '50k_75k', label: '$50,000 - $75,000' },
  { value: '75k_100k', label: '$75,000 - $100,000' },
  { value: '100k_150k', label: '$100,000 - $150,000' },
  { value: 'above_150k', label: 'Above $150,000' },
]

const LIFESTYLE_OPTIONS = [
  { value: 'ALL', label: 'Any' },
  { value: 'never', label: 'Never' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'socially', label: 'Socially' },
  { value: 'regularly', label: 'Regularly' },
]

export function FilterSidebar({ filters, onFiltersChange, onReset }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    age: true,
    height: true,
    interests: true,
    politics: false,
    kerala: false,
    location: false,
    education: false,
    occupation: false,
    income: false,
    lifestyle: false,
    special: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleInterestTag = (tag: string) => {
    const newTags = filters.interestTags.includes(tag)
      ? filters.interestTags.filter((t) => t !== tag)
      : [...filters.interestTags, tag]
    updateFilters({ interestTags: newTags })
  }

  const togglePoliticalLeaning = (leaning: string) => {
    const newLeanings = filters.politicalLeanings.includes(leaning)
      ? filters.politicalLeanings.filter((l) => l !== leaning)
      : [...filters.politicalLeanings, leaning]
    updateFilters({ politicalLeanings: newLeanings })
  }

  const toggleKeralaDistrict = (district: string) => {
    const newDistricts = filters.keralaDistricts.includes(district)
      ? filters.keralaDistricts.filter((d) => d !== district)
      : [...filters.keralaDistricts, district]
    updateFilters({ keralaDistricts: newDistricts })
  }

  const toggleEducationLevel = (level: string) => {
    const newLevels = filters.educationLevels.includes(level)
      ? filters.educationLevels.filter((l) => l !== level)
      : [...filters.educationLevels, level]
    updateFilters({ educationLevels: newLevels })
  }

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string
    sectionKey: string
    children: React.ReactNode
  }) => (
    <div className="border-b pb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="font-semibold text-sm">{title}</h3>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {expandedSections[sectionKey] && <div className="mt-4 space-y-4">{children}</div>}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset All
        </Button>
      </div>

      <div className="space-y-4">
        {/* Age Range */}
        <FilterSection title="Age Range" sectionKey="age">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{filters.ageMin} years</span>
              <span>{filters.ageMax} years</span>
            </div>
            <Slider
              min={18}
              max={80}
              step={1}
              value={[filters.ageMin, filters.ageMax]}
              onValueChange={([min, max]) => updateFilters({ ageMin: min, ageMax: max })}
              className="w-full"
            />
          </div>
        </FilterSection>

        {/* Height Range */}
        <FilterSection title="Height Range" sectionKey="height">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{filters.heightMin} cm</span>
              <span>{filters.heightMax} cm</span>
            </div>
            <Slider
              min={140}
              max={220}
              step={1}
              value={[filters.heightMin, filters.heightMax]}
              onValueChange={([min, max]) => updateFilters({ heightMin: min, heightMax: max })}
              className="w-full"
            />
          </div>
        </FilterSection>

        {/* Interests & Hobbies (Kaapi Connect) */}
        <FilterSection title="Interests & Hobbies" sectionKey="interests">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {INTEREST_TAGS.map((interest) => (
              <div key={interest.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`interest-${interest.value}`}
                  checked={filters.interestTags.includes(interest.value)}
                  onCheckedChange={() => toggleInterestTag(interest.value)}
                />
                <Label
                  htmlFor={`interest-${interest.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {interest.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Political Leaning (Kaapi Connect) */}
        <FilterSection title="Political Leaning" sectionKey="politics">
          <div className="space-y-2">
            {POLITICAL_LEANINGS.map((leaning) => (
              <div key={leaning.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`politics-${leaning.value}`}
                  checked={filters.politicalLeanings.includes(leaning.value)}
                  onCheckedChange={() => togglePoliticalLeaning(leaning.value)}
                />
                <Label
                  htmlFor={`politics-${leaning.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {leaning.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Kerala District (Kaapi Connect) */}
        <FilterSection title="Kerala District" sectionKey="kerala">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {KERALA_DISTRICTS.map((district) => (
              <div key={district.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`district-${district.value}`}
                  checked={filters.keralaDistricts.includes(district.value)}
                  onCheckedChange={() => toggleKeralaDistrict(district.value)}
                />
                <Label
                  htmlFor={`district-${district.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {district.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Location */}
        <FilterSection title="Location" sectionKey="location">
          <div className="space-y-2">
            <Input
              placeholder="Enter city or state"
              value={filters.locations.join(', ')}
              onChange={(e) => {
                const locations = e.target.value
                  .split(',')
                  .map((l) => l.trim())
                  .filter((l) => l.length > 0)
                updateFilters({ locations })
              }}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple locations with commas
            </p>
          </div>
        </FilterSection>

        {/* Education Level */}
        <FilterSection title="Education Level" sectionKey="education">
          <div className="space-y-2">
            {EDUCATION_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`edu-${level.value}`}
                  checked={filters.educationLevels.includes(level.value)}
                  onCheckedChange={() => toggleEducationLevel(level.value)}
                />
                <Label
                  htmlFor={`edu-${level.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {level.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Occupation */}
        <FilterSection title="Occupation" sectionKey="occupation">
          <Input
            placeholder="e.g., Engineer, Teacher"
            value={filters.occupation}
            onChange={(e) => updateFilters({ occupation: e.target.value })}
          />
        </FilterSection>

        {/* Income Range */}
        <FilterSection title="Income Range" sectionKey="income">
          <Select
            value={filters.incomeRange}
            onValueChange={(value) => updateFilters({ incomeRange: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select income range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Any</SelectItem>
              {INCOME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        {/* Lifestyle */}
        <FilterSection title="Lifestyle" sectionKey="lifestyle">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Drinking</Label>
              <Select
                value={filters.drinking}
                onValueChange={(value) => updateFilters({ drinking: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {LIFESTYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Smoking</Label>
              <Select
                value={filters.smoking}
                onValueChange={(value) => updateFilters({ smoking: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {LIFESTYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FilterSection>

        {/* Special Filters */}
        <FilterSection title="Special Filters" sectionKey="special">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="with-photo" className="text-sm font-normal">
                With Photo Only
              </Label>
              <Switch
                id="with-photo"
                checked={filters.withPhotoOnly}
                onCheckedChange={(checked) => updateFilters({ withPhotoOnly: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="verified" className="text-sm font-normal">
                Verified Profiles Only
              </Label>
              <Switch
                id="verified"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) => updateFilters({ verifiedOnly: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="online" className="text-sm font-normal">
                Online Now
              </Label>
              <Switch
                id="online"
                checked={filters.onlineOnly}
                onCheckedChange={(checked) => updateFilters({ onlineOnly: checked })}
              />
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  )
}
