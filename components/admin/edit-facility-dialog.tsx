"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FacilityImageUpload } from "./facility-image-upload"

interface EditFacilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  facility: {
    id: string
    name: string
    type: string
    description: string
    location?: string
    images: string[]
    [key: string]: any
  }
  onSuccess: () => void
}

export function EditFacilityDialog({ open, onOpenChange, facility, onSuccess }: EditFacilityDialogProps) {
  const [name, setName] = useState(facility.name)
  const [description, setDescription] = useState(facility.description)
  const [type, setType] = useState(facility.type)
  const [location, setLocation] = useState(facility.location || "")
  const [images, setImages] = useState<string[]>(facility.images || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form when facility changes
  useEffect(() => {
    setName(facility.name)
    setDescription(facility.description)
    setType(facility.type)
    setLocation(facility.location || "")
    setImages(facility.images || [])
  }, [facility])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, you would submit to an API here
      console.log({ id: facility.id, name, description, type, location, images })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating facility:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Facility</DialogTitle>
          <DialogDescription>Update the facility details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Facility Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter facility name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Facility Type</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hostels">Hostels</SelectItem>
                  <SelectItem value="book-bank">Book Bank</SelectItem>
                  <SelectItem value="gym">Gym</SelectItem>
                  <SelectItem value="astrology">Astrology</SelectItem>
                  <SelectItem value="party-plots">Party Plots</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter facility location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter facility description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Facility Images</Label>
            <FacilityImageUpload images={images} onChange={setImages} maxImages={5} />
          </div>

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
