"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Edit } from 'lucide-react'
import Link from 'next/link'

interface ProfileSection {
  name: string
  fields: { label: string; value: any; required?: boolean }[]
}

interface ProfileCompletionProps {
  profile: any
  photos: any[]
}

export function ProfileCompletion({ profile, photos }: ProfileCompletionProps) {
  // Define profile sections with their fields
  const sections: ProfileSection[] = [
    {
      name: 'Basic Information',
      fields: [
        { label: 'Date of Birth', value: profile.dateOfBirth, required: true },
        { label: 'Gender', value: profile.gender, required: true },
        { label: 'About Me', value: profile.aboutMe, required: true },
        { label: 'Profile Photo', value: photos.length > 0, required: true },
      ]
    },
    {
      name: 'Faith Background',
      fields: [
        { label: 'Denomination', value: profile.denomination, required: true },
        { label: 'Church Name', value: profile.churchName },
        { label: 'Years as Believer', value: profile.yearsAsBeliever },
        { label: 'Baptized', value: profile.isBaptized },
        { label: 'Church Involvement', value: profile.churchInvolvementLevel },
      ]
    },
    {
      name: 'Physical Attributes',
      fields: [
        { label: 'Height', value: profile.height, required: true },
      ]
    },
    {
      name: 'Education & Career',
      fields: [
        { label: 'Education Level', value: profile.educationLevel, required: true },
        { label: 'Field of Study', value: profile.fieldOfStudy },
        { label: 'Occupation', value: profile.occupation, required: true },
        { label: 'Income Range', value: profile.incomeRange },
      ]
    },
    {
      name: 'Family Background',
      fields: [
        { label: 'Parents Occupation', value: profile.parentsOccupation },
        { label: 'Siblings Count', value: profile.siblingsCount },
        { label: 'Family Type', value: profile.familyType },
        { label: 'Family Values', value: profile.familyValues },
      ]
    },
    {
      name: 'Lifestyle',
      fields: [
        { label: 'Drinking', value: profile.drinking },
        { label: 'Smoking', value: profile.smoking },
        { label: 'Diet Preference', value: profile.dietPreference },
        { label: 'Hobbies', value: profile.hobbies },
      ]
    },
    {
      name: 'Location',
      fields: [
        { label: 'City', value: profile.city, required: true },
        { label: 'State', value: profile.state, required: true },
        { label: 'Country', value: profile.country, required: true },
        { label: 'Open to Relocate', value: profile.openToRelocate !== null },
      ]
    }
  ]

  // Calculate completion
  const allFields = sections.flatMap(s => s.fields)
  const totalFields = allFields.length
  const filledFields = allFields.filter(f => {
    const value = f.value
    return value !== null && value !== undefined && value !== '' && value !== false
  }).length

  const completionPercentage = Math.round((filledFields / totalFields) * 100)

  // Get incomplete required fields
  const incompleteRequired = sections
    .map(section => ({
      section: section.name,
      fields: section.fields.filter(f => f.required && !f.value)
    }))
    .filter(s => s.fields.length > 0)

  // Get incomplete optional fields
  const incompleteOptional = sections
    .map(section => ({
      section: section.name,
      fields: section.fields.filter(f => !f.required && !f.value)
    }))
    .filter(s => s.fields.length > 0)

  const isComplete = completionPercentage === 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Profile Completion
              {isComplete && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Complete your profile to increase your visibility
            </CardDescription>
          </div>
          <Link href="/profile/settings">
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {filledFields} of {totalFields} fields
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          <p className="text-2xl font-bold text-center">{completionPercentage}%</p>
        </div>

        {/* Incomplete required fields */}
        {incompleteRequired.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-red-600">Required Fields</h4>
              <Badge variant="destructive" className="text-xs">
                {incompleteRequired.reduce((acc, s) => acc + s.fields.length, 0)} missing
              </Badge>
            </div>
            <div className="space-y-2">
              {incompleteRequired.map((section) => (
                <div key={section.section} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {section.section}
                  </p>
                  <ul className="space-y-1 ml-4">
                    {section.fields.map((field) => (
                      <li key={field.label} className="flex items-center gap-2 text-sm">
                        <Circle className="h-3 w-3 text-red-500" />
                        <span>{field.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incomplete optional fields */}
        {incompleteOptional.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-muted-foreground">
                Optional Fields
              </h4>
              <Badge variant="secondary" className="text-xs">
                {incompleteOptional.reduce((acc, s) => acc + s.fields.length, 0)} remaining
              </Badge>
            </div>
            <details className="group">
              <summary className="cursor-pointer text-sm text-primary hover:underline">
                Show optional fields
              </summary>
              <div className="space-y-2 mt-2">
                {incompleteOptional.map((section) => (
                  <div key={section.section} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {section.section}
                    </p>
                    <ul className="space-y-1 ml-4">
                      {section.fields.map((field) => (
                        <li key={field.label} className="flex items-center gap-2 text-sm">
                          <Circle className="h-3 w-3 text-muted-foreground" />
                          <span>{field.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Completion message */}
        {isComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-green-900">
                  Profile Complete!
                </h4>
                <p className="text-sm text-green-700">
                  Your profile is fully complete and visible to potential matches.
                  Keep your information up to date for the best experience.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        {!isComplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">
              Why complete your profile?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Increases visibility in search results</li>
              <li>• Helps find better matches</li>
              <li>• Builds trust with potential partners</li>
              <li>• Shows you're serious about finding a match</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
