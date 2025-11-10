'use client'

import { useState } from 'react'
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
  denominations: string[]
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

const DENOMINATIONS = [
  { value: 'BAPTIST', label: 'Baptist' },
  { value: 'METHODIST', label: 'Methodist' },
  { value: 'PRESBYTERIAN', label: 'Presbyterian' },
  { value: 'PENTECOSTAL', label: 'Pentecostal' },
  { value: 'NON_DENOMINATIONAL', label: 'Non-Denominational' },
  { value: 'LUTHERAN', label: 'Lutheran' },
  { value: 'ANGLICAN', label: 'Anglican' },
  { value: 'EPISCOPAL', label: 'Episcopal' },
  { value: 'REFORMED', label: 'Reformed' },
  { value: 'EVANGELICAL', label: 'Evangelical' },
  { value: 'OTHER', label: 'Other' },
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
  { value: '', label: 'Any' },
  { value: 'never', label: 'Never' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'socially', label: 'Socially' },
  { value: 'regularly', label: 'Regularly' },
]

export function FilterSidebar({ filters, onFiltersChange, onReset }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    age: true,
    height: true,
    denomination: true,
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

  const toggleDenomination = (denomination: string) => {
    const newDenominations = filters.denominations.includes(denomination)
      ? filters.denominations.filter((d) => d !== denomination)
      : [...filters.denominations, denomination]
    updateFilters({ denominations: newDenominations })
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

        {/* Denomination */}
        <FilterSection title="Denomination" sectionKey="denomination">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {DENOMINATIONS.map((denom) => (
              <div key={denom.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`denom-${denom.value}`}
                  checked={filters.denominations.includes(denom.value)}
                  onCheckedChange={() => toggleDenomination(denom.value)}
                />
                <Label
                  htmlFor={`denom-${denom.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {denom.label}
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
              <SelectItem value="">Any</SelectItem>
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
