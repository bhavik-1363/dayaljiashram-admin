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
import { ImagePlus, Save, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type BookBank,
  getBookBank,
  updateBookBank,
  uploadBookBankImage,
} from "@/lib/firebase/services/book-bank-service"
import { Progress } from "@/components/ui/progress"

export default function BookBankPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookBank, setBookBank] = useState<BookBank | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  // Fetch book bank data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getBookBank()
        setBookBank(data)
        setHasChanges(false)
      } catch (error) {
        console.error("Error fetching book bank data:", error)
        toast({
          title: "Error",
          description: "Failed to load book bank information. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update field handler
  const updateField = (field: string, value: string) => {
    if (!bookBank) return

    setBookBank((prev) => {
      if (!prev) return prev
      return { ...prev, [field]: value }
    })
    setHasChanges(true)
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (!bookBank || !e.target.files || e.target.files.length === 0) return

    const files = Array.from(e.target.files)

    for (const file of files) {
      const fileId = `upload_${Date.now()}_${file.name}`
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

      try {
        const imageUrl = await uploadBookBankImage(file, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
        })

        setBookBank((prev) => {
          if (!prev) return prev
          return { ...prev, images: [...prev.images, imageUrl] }
        })

        setHasChanges(true)

        // Remove progress after completion
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 1000)
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        })

        // Remove progress on error
        setUploadProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[fileId]
          return newProgress
        })
      }
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

    if (!bookBank || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return

    const files = Array.from(e.dataTransfer.files)

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue

      const fileId = `upload_${Date.now()}_${file.name}`
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

      try {
        const imageUrl = await uploadBookBankImage(file, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
        })

        setBookBank((prev) => {
          if (!prev) return prev
          return { ...prev, images: [...prev.images, imageUrl] }
        })

        setHasChanges(true)

        // Remove progress after completion
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 1000)
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        })

        // Remove progress on error
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
    if (!bookBank) return

    const newImages = [...bookBank.images]
    newImages.splice(index, 1)

    setBookBank((prev) => {
      if (!prev) return prev
      return { ...prev, images: newImages }
    })

    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!bookBank) return

    setIsSubmitting(true)
    try {
      await updateBookBank(bookBank)

      setHasChanges(false)
      toast({
        title: "Changes saved",
        description: "The book bank information has been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving book bank data:", error)
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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading book bank information...</span>
      </div>
    )
  }

  if (!bookBank) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg text-red-500">Failed to load book bank information.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Bank"
        description="Manage community book bank information and images"
        action={
          <Button onClick={handleSave} disabled={isSubmitting || !hasChanges}>
            <Save className="mr-2 h-4 w-4" />
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
                  value={bookBank.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Facility Title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={bookBank.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the facility and its features..."
                  className="min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Textarea
                  id="contactInfo"
                  value={bookBank.contactInfo}
                  onChange={(e) => updateField("contactInfo", e.target.value)}
                  placeholder="Contact person, phone number, email..."
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openingHours">Opening Hours</Label>
                <Input
                  id="openingHours"
                  value={bookBank.openingHours}
                  onChange={(e) => updateField("openingHours", e.target.value)}
                  placeholder="e.g., Mon-Fri: 9am-5pm, Sat: 10am-2pm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={bookBank.additionalInfo}
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

              {/* Upload Progress Indicators */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-3">
                  {Object.entries(uploadProgress).map(([fileId, progress]) => (
                    <div key={fileId} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{fileId.split("_").slice(2).join("_")}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}

              {bookBank.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {bookBank.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Book bank image ${index + 1}`}
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
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}