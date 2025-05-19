"use client"

import { FirebaseImageUpload } from "@/components/admin/firebase-image-upload"

interface ImageUploadProps {
  value: string
  onChange: (value: string | File) => void
  className?: string
  folderName?: string
}

export function ImageUpload({ value, onChange, className, folderName = "member-profiles" }: ImageUploadProps) {
  return (
    <FirebaseImageUpload value={value} onChange={onChange} folder={folderName} maxSizeInMB={5} className={className} />
  )
}
