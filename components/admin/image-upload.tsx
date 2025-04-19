"use client"

import { FirebaseImageUpload } from "@/components/admin/firebase-image-upload"

interface ImageUploadProps {
  value: string
  onChange: (value: string | File) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  return (
    <FirebaseImageUpload
      value={value}
      onChange={onChange}
      folder="member-profiles"
      maxSizeInMB={5}
      className={className}
    />
  )
}
