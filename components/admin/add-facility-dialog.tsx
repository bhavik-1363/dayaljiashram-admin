"use client"

import type React from "react"

import { useState } from "react"
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

interface AddFacilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  facilityType?: string
  onSuccess: () => void
}

export function AddFacilityDialog({ open, onOpenChange, facilityType, onSuccess }: AddFacilityDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState(facilityType || "")
  const [location, setLocation] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, you would submit to an API here
      console.log({ name, description, type, location, images })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSuccess()
      onOpenChange(false)

      // Reset form
      setName("")
      setDescription("")
      setType(facilityType || "")
      setLocation("")
      setImages([])
    } catch (error) {
      console.error("Error adding facility:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Facility</DialogTitle>
          <DialogDescription>Fill in the details to add a new facility to the community.</DialogDescription>
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
              {isSubmitting ? "Adding..." : "Add Facility"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
