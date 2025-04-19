"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MediaUpload } from "@/components/admin/media-upload"
import { TagsInput } from "@/components/admin/tags-input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { uploadGalleryMedia } from "@/lib/firebase/services/gallery-service"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function AddGalleryItemDialog({ open, onOpenChange, onSave, categories = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subCategory: "",
    tags: [],
    date: new Date().toISOString().split("T")[0],
    media: [],
  })
  const [availableSubCategories, setAvailableSubCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [filesToUpload, setFilesToUpload] = useState([])
  const { toast } = useToast()

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: "",
        description: "",
        category: "",
        subCategory: "",
        tags: [],
        date: new Date().toISOString().split("T")[0],
        media: [],
      })
      setAvailableSubCategories([])
      setUploadProgress({})
      setFilesToUpload([])
      setIsSubmitting(false)
    }
  }, [open])

  // Handle file uploads when filesToUpload changes
  useEffect(() => {
    const uploadFiles = async () => {
      if (filesToUpload.length === 0) return

      setIsSubmitting(true)
      const uploadPromises = filesToUpload.map(async (file, index) => {
        try {
          // Track progress for this file
          setUploadProgress((prev) => ({
            ...prev,
            [index]: 0,
          }))

          // Upload to Firebase Storage
          const result = await uploadGalleryMedia(file, (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [index]: progress,
            }))
          })

          // Return media object with URL and type
          return {
            url: result.url,
            path: result.path,
            type: file.type.startsWith("image/") ? "image" : "video",
            name: file.name,
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error)
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}. ${error.message}`,
            variant: "destructive",
          })
          return null
        }
      })

      // Wait for all uploads to complete
      const uploadedMedia = await Promise.all(uploadPromises)

      // Filter out any failed uploads
      const validMedia = uploadedMedia.filter((media) => media !== null)

      // Update form data with uploaded media
      setFormData((prev) => ({
        ...prev,
        media: [...prev.media, ...validMedia],
      }))

      setIsSubmitting(false)
      setFilesToUpload([])
    }

    if (filesToUpload.length > 0) {
      uploadFiles()
    }
  }, [filesToUpload, toast])

  const handleChange = (field, value) => {
    if (field === "category") {
      // Find the selected category
      const selectedCategory = categories.find((cat) => cat.name === value)

      setFormData((prev) => ({
        ...prev,
        category: value,
        subCategory: "",
      }))

      // Set available sub-categories based on the selected category
      if (selectedCategory && selectedCategory.subCategories) {
        setAvailableSubCategories(selectedCategory.subCategories)
      } else {
        setAvailableSubCategories([])
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleMediaChange = (files) => {
    // If files is an array of File objects, queue them for upload
    if (files.length > 0 && files[0] instanceof File) {
      setFilesToUpload(files)
    } else {
      // If files is already an array of media objects, just update the state
      setFormData((prev) => ({
        ...prev,
        media: files,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.date) {
      toast({
        title: "Validation Error",
        description: "Date is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving gallery item:", error)
      toast({
        title: "Error",
        description: "Failed to save gallery item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogChange = (newOpen) => {
    if (!isSubmitting && filesToUpload.length === 0) {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Gallery Item</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="add-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="add-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="add-subCategory">Sub-category</Label>
                  <Select
                    value={formData.subCategory}
                    onValueChange={(value) => handleChange("subCategory", value)}
                    disabled={!formData.category || isSubmitting || availableSubCategories.length === 0}
                  >
                    <SelectTrigger id="add-subCategory">
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubCategories.map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.name}>
                          {subCategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="add-date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="add-tags">Tags</Label>
                <TagsInput
                  value={formData.tags || []}
                  onChange={(tags) => handleChange("tags", tags)}
                  placeholder="Add tags..."
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label>Media</Label>
                <MediaUpload
                  value={formData.media || []}
                  onChange={handleMediaChange}
                  maxFiles={10}
                  acceptedTypes={["image/*", "video/*"]}
                  disabled={isSubmitting}
                  uploadProgress={uploadProgress}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || filesToUpload.length > 0}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
