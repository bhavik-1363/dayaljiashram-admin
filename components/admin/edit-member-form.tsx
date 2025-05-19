"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AchievementList } from "@/components/admin/achievement-list"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageUpload } from "./image-upload"
import { getMembersService } from "@/lib/firebase/services/members-service"
import { useToast } from "@/components/ui/use-toast"

// Helper function to safely format dates
const safeFormatDate = (dateValue: any): string => {
  if (!dateValue) return "Pick a date"

  // If it's a string, return it directly
  if (typeof dateValue === "string") return dateValue

  // If it's a Date object, format it safely
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return format(dateValue, "PPP")
  }

  // If it's a Firestore timestamp object
  if (typeof dateValue === "object" && dateValue !== null && "seconds" in dateValue) {
    const date = new Date(dateValue.seconds * 1000)
    return format(date, "PPP")
  }

  // For any other case, return a default message
  return "Invalid date"
}

export function EditMemberForm({ member, onSubmit, onCancel, fields = [] }) {
  const [formData, setFormData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (member) {
      // Make a deep copy to avoid reference issues
      setFormData({ ...member })
    }
  }, [member])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // const handleImageChange = (url) => {
  //   // Use empty string instead of undefined for imageUrl
  //   setFormData((prev) => ({ ...prev, imageUrl: url || "" }))
  // }


    const handleImageChange = async (value: string | File) => {
      try {
        // If we received a File object, upload it to Firebase Storage
        if (value instanceof File) {
          // setIsUploadingImage(true)
  
          const membersService = getMembersService()
          const downloadURL = await membersService.uploadProfileImage(value)
  
          setFormData({
            ...formData,
            imageUrl: downloadURL,
          })
  
          toast({
            title: "Image uploaded successfully",
            description: "Profile image has been uploaded.",
          })
        } else {
          // If we received a string (URL or empty string), just update the state
          setFormData({
            ...formData,
            imageUrl: value,
          })
        }
      } catch (error) {
        console.error("Error handling image:", error)
        toast({
          title: "Upload failed",
          description: "There was a problem uploading your image.",
          variant: "destructive",
        })
      } finally {
        // setIsUploadingImage(false)
      }
    }

  const handleAchievementsChange = (achievements) => {
    setFormData((prev) => ({ ...prev, achievements: achievements || [] }))
  }

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Clean up the form data before submission
      const cleanedData = { ...formData }

      // Ensure imageUrl is never undefined
      if (cleanedData.imageUrl === undefined) {
        cleanedData.imageUrl = ""
      }

      await onSubmit(cleanedData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
          </Label>

          {field.type === "text" || field.type === "email" || field.type === "tel" ? (
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              value={formData[field.name] || ""}
              onChange={handleChange}
              required={field.required}
            />
          ) : field.type === "textarea" ? (
            <Textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              required={field.required}
            />
          ) : field.type === "image" ? (
            <ImageUpload value={formData.imageUrl} onChange={handleImageChange} folderName="committee" />
          ) : field.type === "achievements" ? (
            <AchievementList achievements={formData.achievements || []} onChange={handleAchievementsChange} />
          ) : field.type === "date" ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData[field.name] && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {safeFormatDate(formData[field.name])}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData[field.name] instanceof Date && !isNaN(formData[field.name].getTime())
                      ? formData[field.name]
                      : typeof formData[field.name] === "string" && formData[field.name]
                        ? new Date(formData[field.name])
                        : undefined
                  }
                  onSelect={(date) => handleDateChange(field.name, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      ))}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  )
}
