"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/admin/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImagePlus, Loader2, Save, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type Gym,
  getGymData,
  updateGymData,
  uploadGymImage,
  type UploadProgress,
} from "@/lib/firebase/services/gym-service"
import { Progress } from "@/components/ui/progress"

export default function GymPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<Gym>({
    title: "",
    description: "",
    contactInfo: "",
    openingHours: "",
    additionalInfo: "",
    images: [],
  })
  const [dragActive, setDragActive] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({})

  // Fetch gym data on component mount
  useEffect(() => {
    async function fetchGymData() {
      try {
        const gymData = await getGymData()
        setData(gymData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching gym data:", error)
        toast({
          title: "Error",
          description: "Failed to load gym information. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchGymData()
  }, [])

  // Update field handler
  const updateField = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      await uploadFiles(files)
    }
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle drop event
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      await uploadFiles(files)
    }
  }

  // Upload files
  const uploadFiles = async (files: File[]) => {
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed.",
          variant: "destructive",
        })
        continue
      }

      const fileId = `upload_${Date.now()}_${file.name}`
      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: { progress: 0 },
      }))

      try {
        const imageUrl = await uploadGymImage(file, (progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: progress,
          }))
        })

        // Add the new image URL to the data
        setData((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }))
        setHasChanges(true)

        // Remove progress indicator after a delay
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 2000)
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Upload failed",
          description: "There was an error uploading the image. Please try again.",
          variant: "destructive",
        })

        setUploadProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[fileId]
          return newProgress
        })
      }
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...data.images]
    newImages.splice(index, 1)
    setData((prev) => ({ ...prev, images: newImages }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await updateGymData(data)
      setHasChanges(false)
      toast({
        title: "Changes saved",
        description: "The gym information has been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving gym data:", error)
      toast({
        title: "Error",
        description: "There was an error saving the changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading gym information...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gym"
        description="Manage community gym information and images"
        action={
          <Button onClick={handleSave} disabled={isSubmitting || !hasChanges}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Facility Title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the facility and its features..."
                  className="min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Textarea
                  id="contactInfo"
                  value={data.contactInfo}
                  onChange={(e) => updateField("contactInfo", e.target.value)}
                  placeholder="Contact person, phone number, email..."
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openingHours">Opening Hours</Label>
                <Input
                  id="openingHours"
                  value={data.openingHours}
                  onChange={(e) => updateField("openingHours", e.target.value)}
                  placeholder="e.g., Mon-Fri: 9am-5pm, Sat: 10am-2pm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={data.additionalInfo}
                  onChange={(e) => updateField("additionalInfo", e.target.value)}
                  placeholder="Any additional information or special instructions..."
                  className="min-h-20"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Images</Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max 5MB each)</p>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      Select Files
                    </Button>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-3">
                  <Label>Upload Progress</Label>
                  {Object.entries(uploadProgress).map(([id, { progress }]) => (
                    <div key={id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{id.split("_").slice(2).join("_")}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}

              {data.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {data.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Gym image ${index + 1}`}
                          className="h-32 w-full object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}