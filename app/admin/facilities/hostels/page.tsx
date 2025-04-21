"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/admin/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, Save, Upload, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  getHostelByType,
  updateOrCreateHostelByType,
  uploadHostelImage,
  type Hostel,
} from "@/lib/firebase/services/hostels-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Room type options
const roomTypeOptions = [
  { id: "single", label: "Single Occupancy" },
  { id: "double", label: "Double Occupancy" },
  { id: "triple", label: "Triple Occupancy" },
  { id: "four", label: "Four Occupancy" },
]

export default function HostelsPage() {
  const { toast } = useToast()
  const [selectedHostel, setSelectedHostel] = useState<"boys" | "girls">("boys")
  const [hostelInfo, setHostelInfo] = useState<Hostel | null>(null)
  const [newFacility, setNewFacility] = useState("")
  const [newRoomFeature, setNewRoomFeature] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // Fetch hostel data when selection changes
  useEffect(() => {
    const fetchHostelData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const hostel = await getHostelByType(selectedHostel)
        if (hostel) {
          setHostelInfo(hostel)
        } else {
          // If no hostel found, create a default one
          setHostelInfo({
            name: selectedHostel === "boys" ? "Boys Hostel" : "Girls Hostel",
            description: "",
            type: selectedHostel,
            location: "",
            facilities: [],
            roomTypes: [],
            roomFeatures: [],
            contactInfo: "",
            images: [],
            status: "active",
          })
        }
      } catch (err) {
        console.error("Error fetching hostel data:", err)
        setError("Failed to load hostel information. Please try again.")
      } finally {
        setIsLoading(false)
        setIsDirty(false)
      }
    }

    fetchHostelData()
  }, [selectedHostel])

  // Handle hostel selection change
  const handleHostelChange = (value: string) => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to switch hostels?")) {
        setSelectedHostel(value as "boys" | "girls")
      }
    } else {
      setSelectedHostel(value as "boys" | "girls")
    }
  }

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    if (!hostelInfo) return

    setHostelInfo((prev) => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
    setIsDirty(true)
  }

  // Handle room type changes
  const handleRoomTypeChange = (type: string, checked: boolean) => {
    if (!hostelInfo) return

    setHostelInfo((prev) => {
      if (!prev) return null
      return {
        ...prev,
        roomTypes: checked ? [...prev.roomTypes, type] : prev.roomTypes.filter((t) => t !== type),
      }
    })
    setIsDirty(true)
  }

  // Add new facility
  const addFacility = () => {
    if (!hostelInfo) return
    if (newFacility.trim() !== "" && !hostelInfo.facilities.includes(newFacility.trim())) {
      setHostelInfo((prev) => {
        if (!prev) return null
        return {
          ...prev,
          facilities: [...prev.facilities, newFacility.trim()],
        }
      })
      setNewFacility("")
      setIsDirty(true)
    }
  }

  // Remove facility
  const removeFacility = (facility: string) => {
    if (!hostelInfo) return

    setHostelInfo((prev) => {
      if (!prev) return null
      return {
        ...prev,
        facilities: prev.facilities.filter((f) => f !== facility),
      }
    })
    setIsDirty(true)
  }

  // Add new room feature
  const addRoomFeature = () => {
    if (!hostelInfo) return
    if (newRoomFeature.trim() !== "" && !hostelInfo.roomFeatures.includes(newRoomFeature.trim())) {
      setHostelInfo((prev) => {
        if (!prev) return null
        return {
          ...prev,
          roomFeatures: [...prev.roomFeatures, newRoomFeature.trim()],
        }
      })
      setNewRoomFeature("")
      setIsDirty(true)
    }
  }

  // Remove room feature
  const removeRoomFeature = (feature: string) => {
    if (!hostelInfo) return

    setHostelInfo((prev) => {
      if (!prev) return null
      return {
        ...prev,
        roomFeatures: prev.roomFeatures.filter((f) => f !== feature),
      }
    })
    setIsDirty(true)
  }

  // Handle save
  const handleSave = async () => {
    if (!hostelInfo) return

    setIsSaving(true)
    try {
      console.log("Saving hostel information:", hostelInfo)
      await updateOrCreateHostelByType(selectedHostel, hostelInfo)

      toast({
        title: "Success",
        description: `${hostelInfo.name} information has been updated successfully.`,
      })
      setIsDirty(false)
    } catch (error) {
      console.error("Error saving hostel:", error)
      toast({
        title: "Error",
        description: "Failed to save hostel information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle image drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle image drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImages(e.dataTransfer.files)
    }
  }

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImages(e.target.files)
    }
  }

  // Process selected images
  const handleImages = async (files: FileList) => {
    if (!hostelInfo) return

    // Convert FileList to array
    const fileArray = Array.from(files)

    // Create a copy of the current images
    const updatedImages = [...hostelInfo.images]

    // Create a new progress tracker
    const newProgress: Record<string, number> = {}

    // Process each file
    for (const file of fileArray) {
      const fileId = `${Date.now()}_${file.name}`
      newProgress[fileId] = 0

      try {
        // Update progress state
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

        // Upload the image
        const imageUrl = await uploadHostelImage(file, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
        })

        // Add the new image URL to the array
        updatedImages.push(imageUrl)

        // Remove from progress tracking
        setUploadProgress((prev) => {
          const updated = { ...prev }
          delete updated[fileId]
          return updated
        })
      } catch (error) {
        console.error(`Error uploading image ${file.name}:`, error)
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        })
      }
    }

    // Update the hostel info with the new images
    setHostelInfo((prev) => {
      if (!prev) return null
      return {
        ...prev,
        images: updatedImages,
      }
    })
    setIsDirty(true)
  }

  // Remove image
  const removeImage = (index: number) => {
    if (!hostelInfo) return

    setHostelInfo((prev) => {
      if (!prev) return null
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }
    })
    setIsDirty(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading hostel information...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!hostelInfo) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load hostel information. Please refresh the page and try again.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Hostels Management" description="Manage hostel information and facilities" />
        <div className="flex items-center gap-4">
          <Select value={selectedHostel} onValueChange={handleHostelChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select hostel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boys">Boys Hostel</SelectItem>
              <SelectItem value="girls">Girls Hostel</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="hostelName">Hostel Name</Label>
                <Input
                  id="hostelName"
                  value={hostelInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Hostel Description</Label>
                <Textarea
                  id="description"
                  value={hostelInfo.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Label>Facilities and Amenities</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {hostelInfo.facilities.map((facility) => (
                  <Badge key={facility} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                    {facility}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full"
                      onClick={() => removeFacility(facility)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add facility or amenity"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addFacility()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addFacility}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Label>Room Information</Label>

              <div>
                <h4 className="text-sm font-medium mb-2">Room Types</h4>
                <div className="grid grid-cols-2 gap-4">
                  {roomTypeOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`room-${option.id}`}
                        checked={hostelInfo.roomTypes.includes(option.id)}
                        onCheckedChange={(checked) => handleRoomTypeChange(option.id, checked === true)}
                      />
                      <label
                        htmlFor={`room-${option.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Room Features</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {hostelInfo.roomFeatures.map((feature) => (
                    <Badge key={feature} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                      {feature}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={() => removeRoomFeature(feature)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add room feature"
                    value={newRoomFeature}
                    onChange={(e) => setNewRoomFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addRoomFeature()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addRoomFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactInfo">Contact Information (Warden Details)</Label>
                <Textarea
                  id="contactInfo"
                  value={hostelInfo.contactInfo}
                  onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Enter warden name, contact number, email, and office hours"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Label>Hostel Images</Label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {hostelInfo.images.map((image, index) => (
                  <div key={index} className="relative group border rounded-md overflow-hidden aspect-video">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${hostelInfo.name} - image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Show upload progress if any */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2 mb-4">
                  {Object.entries(uploadProgress).map(([fileId, progress]) => (
                    <div key={fileId} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Uploading image...</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-1 transition-all duration-300 ease-in-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                  dragActive ? "border-primary bg-primary/5" : "border-border",
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("hostel-image-upload")?.click()}
              >
                <input
                  id="hostel-image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <h3 className="font-medium text-lg">Drag & drop images here</h3>
                  <p className="text-sm text-muted-foreground">or click to browse files</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!isDirty || isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
