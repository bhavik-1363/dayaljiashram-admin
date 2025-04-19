"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AchievementList } from "@/components/admin/achievement-list"
import { FirebaseImageUpload } from "@/components/admin/firebase-image-upload"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function AddMemberForm({ onSubmit, onCancel, fields = [] }) {
  const [formData, setFormData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (url) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }))
  }

  const handleAchievementsChange = (achievements) => {
    setFormData((prev) => ({ ...prev, achievements }))
  }

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
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
            <FirebaseImageUpload
              folder="committee"
              onImageUploaded={handleImageChange}
              initialImage={formData[field.name] || ""}
            />
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
                  {formData[field.name] ? format(formData[field.name], "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData[field.name]}
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
