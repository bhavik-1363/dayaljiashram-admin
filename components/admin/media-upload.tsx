"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileVideo } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

export function MediaUpload({
  value = [],
  onChange,
  maxFiles = 5,
  acceptedTypes = ["image/*"],
  disabled = false,
  uploadProgress = {},
}) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0] && !disabled) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0] && !disabled) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    const newFiles = Array.from(files).slice(0, maxFiles - (value?.length || 0))
    onChange(newFiles)
  }

  const handleRemove = (index) => {
    if (disabled) return
    const newValue = [...value]
    newValue.splice(index, 1)
    onChange(newValue)
  }

  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current.click()
    }
  }

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : []

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        )}
        onDragEnter={disabled ? null : handleDrag}
        onDragLeave={disabled ? null : handleDrag}
        onDragOver={disabled ? null : handleDrag}
        onDrop={disabled ? null : handleDrop}
        onClick={disabled ? null : openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept={acceptedTypes.join(",")}
          className="hidden"
          disabled={disabled}
        />
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          {disabled ? "Media upload is disabled during submission" : "Drag & drop files here, or click to select files"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {acceptedTypes.includes("image/*") && acceptedTypes.includes("video/*")
            ? "Supports images and videos"
            : acceptedTypes.includes("image/*")
              ? "Supports images"
              : "Supports videos"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Maximum {maxFiles} file{maxFiles !== 1 ? "s" : ""}
        </p>
      </div>

      {safeValue.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {safeValue.map((media, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative aspect-square">
                {media.type === "image" ? (
                  <img
                    src={media.url || "/placeholder.svg"}
                    alt={media.name || `Media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <FileVideo className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                {!disabled && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(index)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}

                {/* Show upload progress if available */}
                {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-1">
                    <Progress value={uploadProgress[index]} className="h-2" />
                    <p className="text-xs text-center mt-1">{Math.round(uploadProgress[index])}%</p>
                  </div>
                )}
              </div>
              <CardContent className="p-2">
                <p className="text-xs truncate">{media.name || `Media ${index + 1}`}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
