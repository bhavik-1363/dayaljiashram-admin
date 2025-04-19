"use client"

import type React from "react"

import { useState } from "react"
import { PageHeader } from "@/components/admin/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImagePlus, Save, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Sample data for the book bank
const initialBookBankData = {
  title: "Community Book Bank",
  description:
    "Our Book Bank provides free access to educational materials, textbooks, and literature for all community members. We maintain a diverse collection of books across various subjects and age groups. The Book Bank operates on a borrow-and-return system, allowing members to access resources they might not otherwise be able to afford.",
  contactInfo: "Librarian: Sarah Johnson\nPhone: (555) 987-6543\nEmail: bookbank@community.org",
  openingHours: "Monday-Friday: 10am-6pm, Saturday: 10am-4pm, Sunday: Closed",
  additionalInfo:
    "Books can be borrowed for up to 3 weeks. Late returns may incur a small fee. Donations of gently used books are always welcome and appreciated.",
  images: ["/grand-library-stacks.png", "/sharing-stories-community.png", "/diverse-educational-bookshelves.png"],
}

export default function BookBankPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState(initialBookBankData)
  const [dragActive, setDragActive] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Update field handler
  const updateField = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }))
      setHasChanges(true)
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
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newImages = Array.from(e.dataTransfer.files).map((file) => URL.createObjectURL(file))
      setData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }))
      setHasChanges(true)
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
      // In a real application, you would send this data to your API
      console.log("Saving book bank data:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

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

              {data.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {data.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Uploaded image ${index + 1}`}
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
