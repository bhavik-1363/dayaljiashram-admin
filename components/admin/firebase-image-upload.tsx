"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { app } from "@/lib/firebase/firebase"

interface FirebaseImageUploadProps {
  value: string
  onChange: (value: string | File) => void
  folder?: string
  maxSizeInMB?: number
  className?: string
  shape?: "square" | "circle"
  width?: number
  height?: number
}

export function FirebaseImageUpload({
  value,
  onChange,
  folder = "uploads",
  maxSizeInMB = 5,
  className,
  shape = "circle",
  width = 100,
  height = 100,
}: FirebaseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024 // Convert MB to bytes

  const handleFileChange = useCallback(
    async (file: File) => {
      if (!file) return

      // Check file size
      if (file.size > maxSizeInBytes) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${maxSizeInMB}MB`,
          variant: "destructive",
        })
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        })
        return
      }

      try {
        // Pass the File object to the parent component
        onChange(file)

        // If we want to handle the upload here instead of in the parent:
        // await uploadToFirebase(file)
      } catch (error) {
        console.error("Error handling file:", error)
        toast({
          title: "Upload failed",
          description: "There was a problem uploading your image.",
          variant: "destructive",
        })
      }
    },
    [maxSizeInBytes, maxSizeInMB, onChange, toast],
  )

  const uploadToFirebase = async (file: File): Promise<string> => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const storage = getStorage(app)
      const fileName = `${Date.now()}-${file.name}`
      const storageRef = ref(storage, `${folder}/${fileName}`)

      const uploadTask = uploadBytesResumable(storageRef, file)

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setUploadProgress(progress)
          },
          (error) => {
            console.error("Upload error:", error)
            setIsUploading(false)
            reject(error)
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            setIsUploading(false)
            setUploadProgress(0)
            resolve(downloadURL)
          },
        )
      })
    } catch (error) {
      console.error("Firebase upload error:", error)
      setIsUploading(false)
      throw error
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChange(e.dataTransfer.files[0])
      }
    },
    [handleFileChange],
  )

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileChange(e.target.files[0])
      }
    },
    [handleFileChange],
  )

  const handleRemoveImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange("")
    },
    [onChange],
  )

  const containerClasses = cn(
    "relative flex items-center justify-center border-2 border-dashed rounded-md transition-all",
    {
      "border-primary bg-primary/5": dragActive,
      "border-input hover:border-primary": !dragActive,
      "rounded-full": shape === "circle",
    },
    className,
  )

  return (
    <div
      className={containerClasses}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={handleButtonClick}
      style={{ width: width, height: height }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        aria-label="Upload image"
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
        </div>
      ) : value ? (
        <div className="relative w-full h-full">
          {shape === "circle" ? (
            <Avatar className="w-full h-full">
              <AvatarImage src={value || "/placeholder.svg"} alt="Profile" className="object-cover" />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={value || "/placeholder.svg"}
                alt="Uploaded image"
                fill
                className="object-cover rounded-md"
                sizes={`${Math.max(width, height)}px`}
              />
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove image</span>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <Label className="text-sm text-muted-foreground cursor-pointer">Drag & drop or click to upload</Label>
        </div>
      )}
    </div>
  )
}
