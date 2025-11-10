'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

interface DualRangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
  label?: string
  description?: string
  markers?: number[]
  markerLabels?: { [key: number]: string }
  className?: string
}

export function DualRangeSlider({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  formatValue,
  label,
  description,
  markers,
  markerLabels,
  className,
}: DualRangeSliderProps) {
  const [minValue, maxValue] = value

  const displayFormat = formatValue || ((val) => val.toString())

  return (
    <div className={cn('space-y-6', className)}>
      {/* Large Display */}
      <div className="bg-primary/5 rounded-lg p-6 text-center">
        <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
          {displayFormat(minValue)} - {displayFormat(maxValue)}
        </div>
        {description && (
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
        )}
      </div>

      {/* Labels Above Slider */}
      <div className="flex justify-between items-start">
        <div className="text-center flex-1">
          <div className="text-xs text-muted-foreground mb-1 font-medium">Minimum</div>
          <div className="text-lg md:text-xl font-bold text-foreground">
            {displayFormat(minValue)}
          </div>
        </div>
        <div className="w-8"></div>
        <div className="text-center flex-1">
          <div className="text-xs text-muted-foreground mb-1 font-medium">Maximum</div>
          <div className="text-lg md:text-xl font-bold text-foreground">
            {displayFormat(maxValue)}
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="px-2">
        <SliderPrimitive.Root
          className="relative flex w-full touch-none select-none items-center py-4"
          min={min}
          max={max}
          step={step}
          value={value}
          onValueChange={onValueChange}
          minStepsBetweenThumbs={1}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:h-6 hover:w-6 hover:shadow-lg active:h-7 active:w-7"
            aria-label="Minimum value"
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block">
              <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                {displayFormat(minValue)}
              </div>
            </div>
          </SliderPrimitive.Thumb>
          <SliderPrimitive.Thumb
            className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:h-6 hover:w-6 hover:shadow-lg active:h-7 active:w-7"
            aria-label="Maximum value"
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block">
              <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                {displayFormat(maxValue)}
              </div>
            </div>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>

      {/* Markers */}
      {markers && markers.length > 0 && (
        <div className="relative px-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            {markers.map((marker) => (
              <span key={marker} className="text-center">
                {markerLabels && markerLabels[marker] ? markerLabels[marker] : marker}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
