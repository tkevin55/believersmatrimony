"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PHOTOS = 8
const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp']
}

interface Photo {
  id: string
  url: string
  isPrimary: boolean
  order: number
}

interface PhotoUploadProps {
  photos: Photo[]
  onPhotosChange: (photos: Photo[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = MAX_PHOTOS }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Convert image file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Handle file upload
  const handleUpload = async (acceptedFiles: File[]) => {
    setError('')

    if (photos.length + acceptedFiles.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`)
      return
    }

    setUploading(true)
    const uploadedPhotos: Photo[] = []

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        setUploadProgress(`Uploading ${i + 1} of ${acceptedFiles.length}...`)

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`)
        }

        // Convert to base64
        const base64 = await fileToBase64(file)

        // Upload to API
        const response = await fetch('/api/profile/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: base64, // In production, you'd upload to Cloudinary first
            isPrimary: photos.length === 0 && i === 0 // First photo is primary
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to upload photo')
        }

        const { photo } = await response.json()
        uploadedPhotos.push(photo)
      }

      // Update photos list
      onPhotosChange([...photos, ...uploadedPhotos])
      setUploadProgress('')
    } catch (err: any) {
      setError(err.message || 'Failed to upload photos')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  // Handle photo deletion
  const handleDelete = async (photoId: string) => {
    try {
      const response = await fetch(`/api/profile/photos?photoId=${photoId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete photo')
      }

      // Remove photo from list
      onPhotosChange(photos.filter(p => p.id !== photoId))
    } catch (err: any) {
      setError(err.message || 'Failed to delete photo')
      console.error('Delete error:', err)
    }
  }

  // Handle setting primary photo
  const handleSetPrimary = async (photoId: string) => {
    try {
      const response = await fetch('/api/profile/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId,
          order: photos.find(p => p.id === photoId)?.order || 0,
          isPrimary: true
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to set primary photo')
      }

      // Update photos list
      onPhotosChange(photos.map(p => ({
        ...p,
        isPrimary: p.id === photoId
      })))
    } catch (err: any) {
      setError(err.message || 'Failed to set primary photo')
      console.error('Set primary error:', err)
    }
  }

  // React dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleUpload(acceptedFiles)
  }, [photos])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: uploading || photos.length >= maxPhotos
  })

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {uploadProgress}
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="relative group overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={photo.url}
                alt="Profile photo"
                className="object-cover w-full h-full"
              />

              {/* Primary badge */}
              {photo.isPrimary && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" />
                  Primary
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.isPrimary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetPrimary(photo.id)}
                    className="text-xs"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Set Primary
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(photo.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Upload dropzone */}
        {photos.length < maxPhotos && (
          <div
            {...getRootProps()}
            className={cn(
              "aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors",
              "flex flex-col items-center justify-center gap-2 p-4 text-center",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <Upload className={cn(
              "h-8 w-8",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
            <div className="text-xs text-muted-foreground">
              {isDragActive ? (
                <p>Drop photos here</p>
              ) : (
                <>
                  <p className="font-medium">Click to upload</p>
                  <p className="mt-1">or drag and drop</p>
                  <p className="mt-1">Max 5MB per photo</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photo count */}
      <p className="text-sm text-muted-foreground text-center">
        {photos.length} of {maxPhotos} photos uploaded
      </p>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
        <p>• Your primary photo will be displayed on your profile card</p>
        <p>• Upload up to {maxPhotos} photos to showcase yourself</p>
        <p>• Accepted formats: JPG, PNG, WebP (max 5MB each)</p>
        <p>• Drag photos to reorder (coming soon)</p>
      </div>
    </div>
  )
}
