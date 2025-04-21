"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Venue } from "@/components/admin/columns/venue-columns"
import { ImageIcon, PlusCircle, Trash2, Upload, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "../ui/progress"
import { toast } from "../ui/use-toast"
import { uploadNewsEventMedia } from "@/lib/firebase/storage"

interface EditVenueDialogProps {
  venue: Venue
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateVenue?: (venue: Venue) => void
}
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function EditVenueDialog({ venue, open, onOpenChange, onUpdateVenue }: EditVenueDialogProps) {
  const [formData, setFormData] = useState<Venue>({ ...venue })
  const [newEventType, setNewEventType] = useState("")
  const [newAmenity, setNewAmenity] = useState("")

  // For venue rules
  const [newRuleTitle, setNewRuleTitle] = useState("")
  const [newRuleDescription, setNewRuleDescription] = useState("")

  // For provided items
  const [selectedCategory, setSelectedCategory] = useState("")
  const [newItemName, setNewItemName] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newCategory, setNewCategory] = useState("")
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
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      // Initialize media files
      if (venue.media && venue.media.length > 0) {
        setMediaFiles(
          venue.media.map((media) => ({
            ...media,
            isNew: false,
          })),
        )
      } else {
        setMediaFiles([])
      }
    }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [name]: value,
      },
    }))
  }

  // Event Types Management
  const addEventType = () => {
    if (newEventType.trim() === "") return
    setFormData((prev) => ({
      ...prev,
      eventTypes: [...(prev.eventTypes || []), newEventType.trim()],
    }))
    setNewEventType("")
  }

  const removeEventType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes?.filter((_, i) => i !== index) || [],
    }))
  }

  // Amenities Management
  const addAmenity = () => {
    if (newAmenity.trim() === "") return
    setFormData((prev) => ({
      ...prev,
      amenities: [...(prev.amenities || []), newAmenity.trim()],
    }))
    setNewAmenity("")
  }

  const removeAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.filter((_, i) => i !== index) || [],
    }))
  }

  // Venue Rules Management
  const addVenueRule = () => {
    if (newRuleTitle.trim() === "" || newRuleDescription.trim() === "") return
    setFormData((prev) => ({
      ...prev,
      venueRules: [
        ...(prev.venueRules || []),
        {
          title: newRuleTitle.trim(),
          description: newRuleDescription.trim(),
        },
      ],
    }))
    setNewRuleTitle("")
    setNewRuleDescription("")
  }

  const removeVenueRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      venueRules: prev.venueRules?.filter((_, i) => i !== index) || [],
    }))
  }

  // Provided Items Management
  const addCategory = () => {
    if (newCategory.trim() === "") return
    setFormData((prev) => ({
      ...prev,
      providedItems: [
        ...(prev.providedItems || []),
        {
          category: newCategory.trim(),
          items: [],
        },
      ],
    }))
    setNewCategory("")
    setSelectedCategory(newCategory.trim())
  }

  const addItem = () => {
    if (selectedCategory === "" || newItemName.trim() === "") return

    setFormData((prev) => {
      const updatedItems = [...(prev.providedItems || [])]
      const categoryIndex = updatedItems.findIndex((cat) => cat.category === selectedCategory)

      if (categoryIndex !== -1) {
        updatedItems[categoryIndex] = {
          ...updatedItems[categoryIndex],
          items: [
            ...updatedItems[categoryIndex].items,
            {
              name: newItemName.trim(),
              quantity: newItemQuantity,
              description: newItemDescription.trim(),
            },
          ],
        }
      }

      return {
        ...prev,
        providedItems: updatedItems,
      }
    })

    setNewItemName("")
    setNewItemQuantity(1)
    setNewItemDescription("")
  }

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    setFormData((prev) => {
      const updatedItems = [...(prev.providedItems || [])]

      if (categoryIndex !== -1) {
        updatedItems[categoryIndex] = {
          ...updatedItems[categoryIndex],
          items: updatedItems[categoryIndex].items.filter((_, i) => i !== itemIndex),
        }
      }

      return {
        ...prev,
        providedItems: updatedItems,
      }
    })
  }

  const removeCategory = (index: number) => {
    setFormData((prev) => {
      const updatedProvidedItems = prev.providedItems?.filter((_, i) => i !== index) || []
      const updatedFormData = {
        ...prev,
        providedItems: updatedProvidedItems,
      }

      if (prev.providedItems?.[index]?.category === selectedCategory) {
        setSelectedCategory("")
      }

      return updatedFormData
    })
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
          const path = `venue/${Date.now()}_${media.file.name}`
  
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

    // Upload any new media files first
    const updatedMedia = await uploadMedia()

    // Call the onUpdateVenue callback if provided
    if (onUpdateVenue) {
      const venueData = {
        ...formData,
        media : updatedMedia
      }
      onUpdateVenue(venueData)
    }

    // Close the dialog
    onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Venue: {venue.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="items">Provided Items</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <div className="mt-4 overflow-y-auto max-h-[60vh] pr-1">
              <TabsContent value="basic" className="space-y-4 p-1">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Venue Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input id="capacity" name="capacity" value={formData.capacity} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacityRange">Size Category</Label>
                      <Select
                        value={formData.capacityRange}
                        onValueChange={(value) => handleSelectChange("capacityRange", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Area</Label>
                      <Input id="area" name="area" value={formData.area} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" name="price" value={formData.price} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4 p-1">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      type="email"
                    />
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Person</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Name</Label>
                      <Input
                        id="contactName"
                        name="name"
                        value={formData.contactInfo.name}
                        onChange={handleContactInfoChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactPersonPhone">Phone</Label>
                        <Input
                          id="contactPersonPhone"
                          name="phone"
                          value={formData.contactInfo.phone}
                          onChange={handleContactInfoChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPersonEmail">Email</Label>
                        <Input
                          id="contactPersonEmail"
                          name="email"
                          value={formData.contactInfo.email}
                          onChange={handleContactInfoChange}
                          type="email"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="space-y-6 p-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {formData.eventTypes &&
                        formData.eventTypes.map((type, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {type}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full"
                              onClick={() => removeEventType(index)}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </Badge>
                        ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add event type"
                        value={newEventType}
                        onChange={(e) => setNewEventType(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addEventType} size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities &&
                        formData.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {amenity}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full"
                              onClick={() => removeAmenity(index)}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </Badge>
                        ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add amenity"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addAmenity} size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Venue Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.venueRules &&
                      formData.venueRules.map((rule, index) => (
                        <div key={index} className="border p-3 rounded-md relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => removeVenueRule(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Remove rule</span>
                          </Button>

                          <div className="pr-8">
                            <h4 className="font-medium">{rule.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                          </div>
                        </div>
                      ))}

                    <div className="space-y-3 border-t pt-3">
                      <div className="space-y-2">
                        <Label htmlFor="newRuleTitle">Rule Title</Label>
                        <Input
                          id="newRuleTitle"
                          placeholder="e.g., No outside food"
                          value={newRuleTitle}
                          onChange={(e) => setNewRuleTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newRuleDescription">Rule Description</Label>
                        <Textarea
                          id="newRuleDescription"
                          placeholder="Provide details about this rule"
                          value={newRuleDescription}
                          onChange={(e) => setNewRuleDescription(e.target.value)}
                          rows={2}
                        />
                      </div>

                      <Button type="button" onClick={addVenueRule} className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Rule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="space-y-6 p-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {formData.providedItems &&
                          formData.providedItems.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <Button
                                variant={selectedCategory === category.category ? "secondary" : "ghost"}
                                className="w-full justify-start text-left"
                                onClick={() => setSelectedCategory(category.category)}
                              >
                                {category.category}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeCategory(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove category</span>
                              </Button>
                            </div>
                          ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="New category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="button" onClick={addCategory} size="sm">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>{selectedCategory ? `Items in ${selectedCategory}` : "Select a category"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedCategory ? (
                        <>
                          <div className="space-y-3">
                            {formData.providedItems &&
                              formData.providedItems
                                .find((cat) => cat.category === selectedCategory)
                                ?.items.map((item, itemIndex) => {
                                  const categoryIndex =
                                    formData.providedItems?.findIndex((cat) => cat.category === selectedCategory) || 0

                                  return (
                                    <div key={itemIndex} className="border p-3 rounded-md relative">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={() => removeItem(categoryIndex, itemIndex)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Remove item</span>
                                      </Button>

                                      <div className="pr-8">
                                        <div className="flex justify-between">
                                          <h4 className="font-medium">{item.name}</h4>
                                          <span className="text-sm bg-muted px-2 py-1 rounded-md">
                                            Qty: {item.quantity}
                                          </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                          </div>

                          <div className="space-y-3 border-t pt-3">
                            <div className="space-y-2">
                              <Label htmlFor="newItemName">Item Name</Label>
                              <Input
                                id="newItemName"
                                placeholder="e.g., Tables"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="newItemQuantity">Quantity</Label>
                                <Input
                                  id="newItemQuantity"
                                  type="number"
                                  min="1"
                                  value={newItemQuantity}
                                  onChange={(e) => setNewItemQuantity(Number.parseInt(e.target.value) || 1)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="newItemDescription">Description</Label>
                              <Textarea
                                id="newItemDescription"
                                placeholder="Provide details about this item"
                                value={newItemDescription}
                                onChange={(e) => setNewItemDescription(e.target.value)}
                                rows={2}
                              />
                            </div>

                            <Button type="button" onClick={addItem} className="w-full">
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add Item
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <p className="text-muted-foreground mb-4">
                            Select a category from the left or create a new one
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                      <p className="text-xs">Upload images or videos to include with this venue</p>
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
                  Upload images or videos related to this venue. Maximum
                  file size: 5MB.
                </p>
              </div>
            </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
