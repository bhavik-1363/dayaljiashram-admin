"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"

export function ImageUploadField({ initialImage = "", onImageChange }) {
  const [image, setImage] = useState(initialImage)
  const [isDragging, setIsDragging] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real implementation, you would upload the file to a server
      // and get back a URL. For this demo, we'll use a placeholder.
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)
      onImageChange(imageUrl)
    }
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file) {
        // In a real implementation, you would upload the file to a server
        // and get back a URL. For this demo, we'll use a placeholder.
        const imageUrl = URL.createObjectURL(file)
        setImage(imageUrl)
        onImageChange(imageUrl)
      }
    },
    [onImageChange],
  )

  const removeImage = () => {
    setImage("")
    onImageChange("")
  }

  return (
    <div className="space-y-4">
      {image ? (
        <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
          <Image src={image || "/placeholder.svg"} alt="Member" fill className="object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center h-48 ${
            isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">Drag and drop an image, or click to select</p>
          <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={handleImageChange} />
          <label htmlFor="image-upload">
            <Button type="button" variant="secondary" size="sm" asChild>
              <span>Select Image</span>
            </Button>
          </label>
        </div>
      )}
    </div>
  )
}
