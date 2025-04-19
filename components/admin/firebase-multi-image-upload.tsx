"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { uploadFile, generateFilePath } from "@/lib/firebase/storage"

interface FirebaseMultiImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  folder?: string
  maxImages?: number
  maxSizeInMB?: number
}

export function FirebaseMultiImageUpload({
  images,
  onChange,
  folder = "facility-images",
  maxImages = 5,
  maxSizeInMB = 5,
}: FirebaseMultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if adding these files would exceed the maximum
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload a maximum of ${maxImages} images.`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const newImageUrls: string[] = []
    const totalFiles = files.length
    let processedFiles = 0

    try {
      for (const file of Array.from(files)) {
        // Check file size
        if (file.size > maxSizeInBytes) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than ${maxSizeInMB}MB.`,
            variant: "destructive",
          })
          continue
        }

        // Check file type
        const acceptedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if (!acceptedImageTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported image format.`,
            variant: "destructive",
          })
          continue
        }

        try {
          // Upload to Firebase Storage
          const filePath = generateFilePath(folder, file.name)
          const downloadURL = await uploadFile(filePath, file)

          // Add to new images array
          newImageUrls.push(downloadURL)
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}.`,
            variant: "destructive",
          })
        }

        // Update progress
        processedFiles++
        setUploadProgress(Math.round((processedFiles / totalFiles) * 100))
      }

      // Update the parent component with all image URLs
      onChange([...images, ...newImageUrls])

      if (newImageUrls.length > 0) {
        toast({
          title: "Images uploaded",
          description: `Successfully uploaded ${newImageUrls.length} image(s).`,
        })
      }
    } catch (error) {
      console.error("Error processing images:", error)
      toast({
        title: "Error uploading images",
        description: "There was a problem processing your images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative">
            <Card className="overflow-hidden w-24 h-24">
              <CardContent className="p-0">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </CardContent>
            </Card>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => removeImage(index)}
              disabled={isUploading}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
        ))}

        {images.length < maxImages && (
          <Card className="w-24 h-24 flex items-center justify-center border-dashed">
            <CardContent className="p-0 flex items-center justify-center w-full h-full">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs mt-1">{uploadProgress}%</span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                </label>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {images.length} of {maxImages} images
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Images
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isUploading || images.length >= maxImages}
          />
        </Button>
      </div>
    </div>
  )
}
