"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon, ImageIcon, Upload } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { NewsEvent } from "@/components/admin/columns/news-event-columns"
import { uploadNewsEventMedia } from "@/lib/firebase/storage"
import { Progress } from "@/components/ui/progress"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface EditNewsEventDialogProps {
  newsEvent: NewsEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateNewsEvent?: (updatedNewsEvent: NewsEvent) => Promise<boolean>
}

export function EditNewsEventDialog({ newsEvent, open, onOpenChange, onUpdateNewsEvent }: EditNewsEventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "news" as "news" | "event",
    category: "",
    location: "",
    publishDate: new Date(),
    eventDate: undefined as Date | undefined,
    author: "",
    status: "draft" as "published" | "draft" | "archived",
    shortDescription: "",
    fullDescription: "",
  })
  const [mediaFiles, setMediaFiles] = useState<
    Array<{
      id: string
      type: "image" | "video"
      url: string
      file?: File
      thumbnail?: string
      uploading?: boolean
      progress?: number
      error?: string
      isNew?: boolean
    }>
  >([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form data when newsEvent changes
  useEffect(() => {
    if (newsEvent && open) {
      setFormData({
        title: newsEvent.title || "",
        type: newsEvent.type || "news",
        category: newsEvent.category || "",
        location: newsEvent.location || "",
        publishDate: newsEvent.publishDate ? new Date(newsEvent.publishDate) : new Date(),
        eventDate: newsEvent.eventDate ? new Date(newsEvent.eventDate) : undefined,
        author: newsEvent.author || "",
        status: newsEvent.status || "draft",
        shortDescription: newsEvent.shortDescription || "",
        fullDescription: newsEvent.fullDescription || "",
      })

      // Initialize media files
      if (newsEvent.media && newsEvent.media.length > 0) {
        setMediaFiles(
          newsEvent.media.map((media) => ({
            ...media,
            isNew: false,
          })),
        )
      } else {
        setMediaFiles([])
      }
    }
  }, [newsEvent, open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: date }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length < 2) {
      newErrors.title = "Title must be at least 2 characters"
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author is required"
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required"
    } else if (formData.shortDescription.length < 10) {
      newErrors.shortDescription = "Short description must be at least 10 characters"
    } else if (formData.shortDescription.length > 200) {
      newErrors.shortDescription = "Short description must not exceed 200 characters"
    }

    if (!formData.fullDescription.trim()) {
      newErrors.fullDescription = "Full description is required"
    } else if (formData.fullDescription.length < 50) {
      newErrors.fullDescription = "Full description must be at least 50 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadMedia = async () => {
    // Only upload new media files that have a file property
    const newMediaWithFiles = mediaFiles.filter((media) => media.isNew && media.file)

    if (newMediaWithFiles.length === 0) {
      // If no new files to upload, return the current media files
      return mediaFiles.map(({ id, type, url, thumbnail }) => ({
        id,
        type,
        url,
        thumbnail,
      }))
    }

    // Update all new media with files to show uploading state
    setMediaFiles((prev) =>
      prev.map((media) => (media.isNew && media.file ? { ...media, uploading: true, progress: 0 } : media)),
    )

    const uploadPromises = newMediaWithFiles.map(async (media) => {
      if (!media.file) return media

      try {
        const path = `news_events/${Date.now()}_${media.file.name}`

        // Upload the file to Firebase Storage
        const url = await uploadNewsEventMedia(path, media.file, (progress) => {
          // Update progress for this specific file
          setMediaFiles((prev) => prev.map((m) => (m.id === media.id ? { ...m, progress } : m)))
        })

        // Return the updated media object with the Firebase Storage URL
        return {
          id: media.id,
          type: media.type,
          url: url,
          thumbnail: media.type === "image" ? url : undefined,
        }
      } catch (error) {
        console.error(`Error uploading file ${media.file.name}:`, error)

        // Update the media object with the error
        setMediaFiles((prev) =>
          prev.map((m) => (m.id === media.id ? { ...m, uploading: false, error: "Failed to upload file" } : m)),
        )

        // Return the original media object without the file
        return {
          id: media.id,
          type: media.type,
          url: media.url,
          thumbnail: media.thumbnail,
          error: "Failed to upload",
        }
      }
    })

    // Get existing media files that don't need to be uploaded
    const existingMedia = mediaFiles
      .filter((media) => !media.isNew)
      .map(({ id, type, url, thumbnail }) => ({
        id,
        type,
        url,
        thumbnail,
      }))

    // Wait for all uploads to complete
    const uploadedNewMedia = await Promise.all(uploadPromises)

    // Combine existing media with newly uploaded media
    const allMedia = [...existingMedia, ...uploadedNewMedia]

    // Return only the data needed for Firestore (id, type, url, thumbnail)
    return allMedia
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !newsEvent || !onUpdateNewsEvent) {
      return
    }

    setIsSubmitting(true)

    try {
      // Upload any new media files first
      const updatedMedia = await uploadMedia()

      // Format dates for submission
      const publishDateFormatted = formData.publishDate ? format(formData.publishDate, "yyyy-MM-dd") : ""

      // Only format eventDate if it exists, otherwise set to null (not undefined)
      const eventDateFormatted = formData.eventDate ? format(formData.eventDate, "yyyy-MM-dd") : null

      // Create updated news event object
      const updatedNewsEvent: NewsEvent = {
        ...newsEvent,
        title: formData.title,
        type: formData.type,
        category: formData.category,
        location: formData.location,
        publishDate: publishDateFormatted,
        eventDate: eventDateFormatted,
        author: formData.author,
        status: formData.status,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        media: updatedMedia,
      }

      // Call the update callback
      const success = await onUpdateNewsEvent(updatedNewsEvent)

      if (success) {
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error updating news event:", error)
      toast({
        title: "Error",
        description: "There was a problem updating the news/event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Process each file
    Array.from(files).forEach((file) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB limit.`,
          variant: "destructive",
        })
        return
      }

      // Create a unique ID for the file
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Determine file type
      const fileType = file.type.startsWith("image/") ? "image" : "video"

      // Create object URL for preview
      const fileUrl = URL.createObjectURL(file)

      // Add to media files
      setMediaFiles((prev) => [
        ...prev,
        {
          id: fileId,
          type: fileType,
          url: fileUrl,
          file: file,
          thumbnail: fileType === "image" ? fileUrl : undefined,
          isNew: true,
        },
      ])
    })

    // Reset the input
    event.target.value = ""
  }

  const removeMedia = (id: string) => {
    setMediaFiles((prev) => {
      const mediaToRemove = prev.find((file) => file.id === id)

      // Revoke the object URL to prevent memory leaks
      if (mediaToRemove && mediaToRemove.isNew && mediaToRemove.url.startsWith("blob:")) {
        URL.revokeObjectURL(mediaToRemove.url)
      }

      return prev.filter((file) => file.id !== id)
    })
  }

  if (!newsEvent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {newsEvent.type === "news" ? "News" : "Event"}</DialogTitle>
          <DialogDescription>Update information for {newsEvent.title}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title" className={errors.title ? "text-destructive" : ""}>
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="news">News</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className={errors.category ? "text-destructive" : ""}>
                    Category
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Enter category"
                    className={errors.category ? "border-destructive" : ""}
                  />
                  {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                </div>
                
                <div className="space-y-2">
                   <Label htmlFor="location" className={errors.location ? "text-destructive" : ""}>
                   Location
                   </Label>
                   <Input
                     id="location"
                     name="location"
                     value={formData.location}
                     onChange={handleInputChange}
                     placeholder="Enter location"
                     className={errors.location ? "border-destructive" : ""}
                   />
                   {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                 </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.publishDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.publishDate ? format(formData.publishDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.publishDate}
                        onSelect={(date) => handleDateChange("publishDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-muted-foreground">When this item will be published.</p>
                </div>

                {formData.type === "event" && (
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.eventDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.eventDate ? format(formData.eventDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.eventDate}
                          onSelect={(date) => handleDateChange("eventDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-muted-foreground">The date when the event will take place.</p>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="author" className={errors.author ? "text-destructive" : ""}>
                    Author
                  </Label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Enter author name"
                    className={errors.author ? "border-destructive" : ""}
                  />
                  {errors.author && <p className="text-sm text-destructive">{errors.author}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="shortDescription" className={errors.shortDescription ? "text-destructive" : ""}>
                  Short Description
                </Label>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Enter a brief summary (max 200 characters)"
                  className={cn("resize-none h-20", errors.shortDescription ? "border-destructive" : "")}
                />
                <div className="flex justify-between">
                  <p className={cn("text-sm", errors.shortDescription ? "text-destructive" : "text-muted-foreground")}>
                    A brief summary that will appear in listings and previews.
                  </p>
                  <p className="text-sm text-muted-foreground">{formData.shortDescription.length}/200</p>
                </div>
                {errors.shortDescription && <p className="text-sm text-destructive">{errors.shortDescription}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription" className={errors.fullDescription ? "text-destructive" : ""}>
                  Full Description
                </Label>
                <Textarea
                  id="fullDescription"
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  placeholder="Enter the full content"
                  className={cn("min-h-[200px]", errors.fullDescription ? "border-destructive" : "")}
                />
                <p className={cn("text-sm", errors.fullDescription ? "text-destructive" : "text-muted-foreground")}>
                  The complete content of the {formData.type === "news" ? "news article" : "event description"}.
                </p>
                {errors.fullDescription && <p className="text-sm text-destructive">{errors.fullDescription}</p>}
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-medium">Media Files</h3>
                  <div className="ml-auto">
                    <label htmlFor="media-upload-edit" className="cursor-pointer">
                      <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium">
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                      </div>
                      <input
                        id="media-upload-edit"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="sr-only"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                </div>

                {mediaFiles.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                      <p>No media files uploaded</p>
                      <p className="text-xs">Upload images or videos to include with this {formData.type}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {mediaFiles.map((file) => (
                      <Card key={file.id} className="overflow-hidden">
                        <div className="relative aspect-video bg-muted">
                          {file.type === "image" ? (
                            <img src={file.url || "/placeholder.svg"} alt="" className="object-cover w-full h-full" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <video src={file.url} className="max-h-full max-w-full" controls />
                            </div>
                          )}
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeMedia(file.id)}
                            type="button"
                          >
                            <span className="sr-only">Remove</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </Button>

                          {file.uploading && (
                            <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-1">
                              <Progress value={file.progress} className="h-2" />
                              <p className="text-xs text-center mt-1">Uploading: {file.progress}%</p>
                            </div>
                          )}

                          {file.error && (
                            <div className="absolute bottom-0 left-0 right-0 bg-destructive/80 p-1">
                              <p className="text-xs text-white text-center">{file.error}</p>
                            </div>
                          )}

                          {file.isNew && (
                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                              New
                            </div>
                          )}
                        </div>
                        <CardContent className="p-2">
                          <p className="text-xs truncate">
                            {file.type === "image" ? "Image" : "Video"} {file.id.split("_")[1] || "existing"}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Upload images or videos related to this {formData.type === "news" ? "news article" : "event"}. Maximum
                  file size: 5MB.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
