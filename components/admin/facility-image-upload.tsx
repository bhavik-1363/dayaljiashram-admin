"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface FacilityImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function FacilityImageUpload({ images = [], onChange, maxImages = 5 }: FacilityImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && images.length < maxImages) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0 && images.length < maxImages) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const newImages = [...images]

    Array.from(files).forEach((file) => {
      if (newImages.length >= maxImages) return

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      try {
        // In a real app, you would upload the file to a server and get a URL back
        // For this demo, we'll create a placeholder URL
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result.toString())
            onChange([...newImages])
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Error processing image:", error)
        toast({
          title: "Error uploading image",
          description: "There was a problem processing your image. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          images.length >= maxImages && "opacity-50 cursor-not-allowed",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={images.length >= maxImages ? undefined : handleDrop}
        onClick={() => {
          if (images.length < maxImages) {
            document.getElementById("facility-image-upload")?.click()
          }
        }}
      >
        <input
          id="facility-image-upload"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={images.length >= maxImages}
        />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-medium text-lg">Drag & drop images here</h3>
          <p className="text-sm text-muted-foreground">or click to browse (max {maxImages} images)</p>
          {images.length >= maxImages && (
            <p className="text-sm text-destructive font-medium mt-2">Maximum number of images reached</p>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
              <img
                src={image || "/placeholder.svg"}
                alt={`Facility image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-background/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
