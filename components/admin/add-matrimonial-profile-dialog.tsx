"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"

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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Trash2, Upload, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { uploadProfileImage } from "@/lib/firebase/storage"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ACCEPTED_PDF_TYPES = ["application/pdf"]
const MAX_IMAGES = 5

interface AddMatrimonialProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddProfile?: (profile: any) => void
}

export function AddMatrimonialProfileDialog({ open, onOpenChange, onAddProfile }: AddMatrimonialProfileDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [bioData, setBioData] = useState<File | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [hobbies, setHobbies] = useState<string[]>([])
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() - 25)))
  const [gender, setGender] = useState<string>("male")
  const [religion, setReligion] = useState<string>("Hindu")
  const [diet, setDiet] = useState<string>("Vegetarian")
  const [maritalStatus, setMaritalStatus] = useState<string>("Never Married")
  const [motherTongue, setMotherTongue] = useState<string>("Hindi")
  const [familyType, setFamilyType] = useState<string>("Nuclear Family")
  const [familyStatus, setFamilyStatus] = useState<string>("Middle Class")
  const [status, setStatus] = useState<string>("active")
  const [verified, setVerified] = useState<boolean>(false)
  const [hasUploadedPdf, setHasUploadedPdf] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // Calculate age from date of birth
      const today = new Date()
      const birthDate = dateOfBirth
      const age = today.getFullYear() - birthDate.getFullYear()

      // Upload profile images to Firebase Storage
      let uploadedImageUrl = ""
      if (images.length > 0) {
        // Upload the first image as the profile image
        const mainImage = images[0]
        uploadedImageUrl = await uploadProfileImage(
          mainImage,
          `matrimonial_profiles/${Date.now()}_${mainImage.name}`,
          (progress) => {
            setUploadProgress(progress)
          },
        )
      }

      // Create the profile object with cleaned data (no undefined values)
      const newProfile: Record<string, any> = {
        name: data.name,
        age,
        gender,
        location: data.location,
        profession: data.profession,
        education: data.education,
        about: data.about,
        email: data.email,
        phone: data.phone,
        height: Number.parseInt(data.height),
        income: Number.parseInt(data.income),
        religion,
        diet,
        maritalStatus,
        motherTongue,
        hobbies,
        familyType,
        fatherName: data.fatherName || "",
        motherName: data.motherName || "",
        familyStatus,
        fatherOccupation: data.fatherOccupation || "",
        motherOccupation: data.motherOccupation || "",
        siblings: data.siblings || "",
        familyInfo: data.familyInfo || "",
        partnerInfo: data.partnerInfo || "",
        verified,
        hasUploadedPdf,
        status,
        createdAt: new Date().toISOString().split("T")[0],
      }

      // Only add imageUrl if it's not empty
      if (uploadedImageUrl) {
        newProfile.imageUrl = uploadedImageUrl
      }

      // Add alternatePhone only if it exists
      if (data.alternatePhone) {
        newProfile.alternatePhone = data.alternatePhone
      }

      // Call the onAddProfile callback
      if (onAddProfile) {
        await onAddProfile(newProfile)
      }

      toast({
        title: "Profile added successfully",
        description: `${data.name}'s profile has been added.`,
      })

      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding profile:", error)
      toast({
        title: "Error adding profile",
        description: "There was an error adding the profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const resetForm = () => {
    reset()
    setImages([])
    setBioData(null)
    setImageUrls([])
    setHobbies([])
    setDateOfBirth(new Date(new Date().setFullYear(new Date().getFullYear() - 25)))
    setGender("male")
    setReligion("Hindu")
    setDiet("Vegetarian")
    setMaritalStatus("Never Married")
    setMotherTongue("Hindi")
    setFamilyType("Nuclear Family")
    setFamilyStatus("Middle Class")
    setStatus("active")
    setVerified(false)
    setHasUploadedPdf(false)
    setUploadProgress(0)

    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (pdfInputRef.current) pdfInputRef.current.value = ""
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: File[] = []
    const newImageUrls: string[] = []

    Array.from(files).forEach((file) => {
      if (images.length + newImages.length >= MAX_IMAGES) return

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive",
        })
        return
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format.`,
          variant: "destructive",
        })
        return
      }

      newImages.push(file)
      newImageUrls.push(URL.createObjectURL(file))
    })

    setImages([...images, ...newImages])
    setImageUrls([...imageUrls, ...newImageUrls])
  }

  const handleBioDataUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `${file.name} is larger than 5MB.`,
        variant: "destructive",
      })
      return
    }

    if (!ACCEPTED_PDF_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a PDF file.`,
        variant: "destructive",
      })
      return
    }

    setBioData(file)
    setHasUploadedPdf(true)
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    const newImageUrls = [...imageUrls]
    newImages.splice(index, 1)
    newImageUrls.splice(index, 1)
    setImages(newImages)
    setImageUrls(newImageUrls)
  }

  const removeBioData = () => {
    setBioData(null)
    setHasUploadedPdf(false)
    if (pdfInputRef.current) pdfInputRef.current.value = ""
  }

  const addHobby = (hobby: string) => {
    if (hobby.trim() !== "" && !hobbies.includes(hobby.trim())) {
      setHobbies([...hobbies, hobby.trim()])
      return true
    }
    return false
  }

  const removeHobby = (index: number) => {
    const newHobbies = [...hobbies]
    newHobbies.splice(index, 1)
    setHobbies(newHobbies)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm()
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Matrimonial Profile</DialogTitle>
          <DialogDescription>Fill in the details to create a new matrimonial profile.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="family">Family</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm font-medium">Profile Images (Max 5)</h3>
                  <div className="flex flex-wrap gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={url || "/placeholder.svg"} alt={`Profile image ${index + 1}`} />
                          <AvatarFallback>IMG</AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {images.length < MAX_IMAGES && (
                      <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-300 hover:border-gray-400">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                          onChange={handleImageUpload}
                          multiple
                        />
                        <Upload className="h-6 w-6 text-gray-400" />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload up to 5 images. Each image should be less than 5MB.
                  </p>
                </div>

                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm font-medium">Bio-Data (PDF)</h3>
                  {bioData ? (
                    <div className="flex items-center justify-between rounded-md border border-gray-200 p-2">
                      <span className="text-sm">{bioData.name}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={removeBioData}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 p-4 hover:border-gray-400">
                      <input
                        ref={pdfInputRef}
                        type="file"
                        className="hidden"
                        accept={ACCEPTED_PDF_TYPES.join(",")}
                        onChange={handleBioDataUpload}
                      />
                      <div className="flex flex-col items-center">
                        <Upload className="mb-2 h-6 w-6 text-gray-400" />
                        <span className="text-sm text-gray-500">Upload PDF (Max 5MB)</span>
                      </div>
                    </label>
                  )}
                </div>

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message as string}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !dateOfBirth && "text-muted-foreground")}
                        >
                          {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateOfBirth}
                          onSelect={(date) => date && setDateOfBirth(date)}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    {...register("location", { required: "Location is required" })}
                  />
                  {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message as string}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      placeholder="Enter profession"
                      {...register("profession", { required: "Profession is required" })}
                    />
                    {errors.profession && (
                      <p className="text-sm text-red-500 mt-1">{errors.profession.message as string}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      placeholder="Enter education"
                      {...register("education", { required: "Education is required" })}
                    />
                    {errors.education && (
                      <p className="text-sm text-red-500 mt-1">{errors.education.message as string}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="about">About</Label>
                  <Textarea
                    id="about"
                    placeholder="Enter a brief description about the person"
                    className="min-h-[120px]"
                    {...register("about", {
                      required: "About is required",
                      minLength: { value: 10, message: "About must be at least 10 characters" },
                      maxLength: { value: 500, message: "About must be less than 500 characters" },
                    })}
                  />
                  {errors.about && <p className="text-sm text-red-500 mt-1">{errors.about.message as string}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Write a brief description about the person, their interests, and what they are looking for.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 pt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
                      })}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message as string}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      {...register("phone", {
                        required: "Phone number is required",
                        minLength: { value: 10, message: "Phone number must be at least 10 characters" },
                      })}
                    />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message as string}</p>}
                  </div>

                  <div>
                    <Label htmlFor="alternatePhone">Alternate Phone (Optional)</Label>
                    <Input
                      id="alternatePhone"
                      placeholder="Enter alternate phone number"
                      {...register("alternatePhone")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal" className="space-y-4 pt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="Enter height in cm"
                        {...register("height", {
                          required: "Height is required",
                          min: { value: 100, message: "Height must be at least 100 cm" },
                        })}
                      />
                      {errors.height && <p className="text-sm text-red-500 mt-1">{errors.height.message as string}</p>}
                    </div>

                    <div>
                      <Label htmlFor="income">Annual Income</Label>
                      <Input
                        id="income"
                        type="number"
                        placeholder="Enter annual income"
                        {...register("income", {
                          required: "Income is required",
                          min: { value: 0, message: "Income cannot be negative" },
                        })}
                      />
                      {errors.income && <p className="text-sm text-red-500 mt-1">{errors.income.message as string}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="religion">Religion</Label>
                      <select
                        id="religion"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={religion}
                        onChange={(e) => setReligion(e.target.value)}
                      >
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Jain">Jain</option>
                        <option value="Buddhist">Buddhist</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="diet">Diet</Label>
                      <select
                        id="diet"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={diet}
                        onChange={(e) => setDiet(e.target.value)}
                      >
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Non-Vegetarian">Non-Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Halal">Halal</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <select
                        id="maritalStatus"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                      >
                        <option value="Never Married">Never Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="motherTongue">Mother Tongue</Label>
                      <select
                        id="motherTongue"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={motherTongue}
                        onChange={(e) => setMotherTongue(e.target.value)}
                      >
                        <option value="Hindi">Hindi</option>
                        <option value="Gujarati">Gujarati</option>
                        <option value="Punjabi">Punjabi</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Malayalam">Malayalam</option>
                        <option value="Marathi">Marathi</option>
                        <option value="Bengali">Bengali</option>
                        <option value="Urdu">Urdu</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hobbies">Hobbies & Interests</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        {hobbies.map((hobby, index) => (
                          <Badge key={index} className="px-3 py-1 text-sm">
                            {hobby}
                            <button type="button" className="ml-2 text-xs" onClick={() => removeHobby(index)}>
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id="hobby-input"
                          placeholder="Add a hobby or interest"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              const input = e.currentTarget
                              if (addHobby(input.value)) {
                                input.value = ""
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.getElementById("hobby-input") as HTMLInputElement
                            if (addHobby(input.value)) {
                              input.value = ""
                            }
                            input.focus()
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Press Enter or click Add to add a hobby. Click on a hobby to remove it.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="family" className="space-y-4 pt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="familyType">Family Type</Label>
                      <select
                        id="familyType"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={familyType}
                        onChange={(e) => setFamilyType(e.target.value)}
                      >
                        <option value="Joint Family">Joint Family</option>
                        <option value="Nuclear Family">Nuclear Family</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="fatherName">Father's Name</Label>
                      <Input id="fatherName" placeholder="Enter father's name" {...register("fatherName")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="motherName">Mother's Name</Label>
                      <Input id="motherName" placeholder="Enter mother's name" {...register("motherName")} />
                    </div>

                    <div>
                      <Label htmlFor="familyStatus">Family Status</Label>
                      <select
                        id="familyStatus"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={familyStatus}
                        onChange={(e) => setFamilyStatus(e.target.value)}
                      >
                        <option value="Middle Class">Middle Class</option>
                        <option value="Upper Middle Class">Upper Middle Class</option>
                        <option value="Rich">Rich</option>
                        <option value="Affluent">Affluent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fatherOccupation">Father's Occupation</Label>
                    <Input
                      id="fatherOccupation"
                      placeholder="Enter father's occupation"
                      {...register("fatherOccupation")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="motherOccupation">Mother's Occupation</Label>
                    <Input
                      id="motherOccupation"
                      placeholder="Enter mother's occupation"
                      {...register("motherOccupation")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="siblings">Siblings</Label>
                    <Input id="siblings" placeholder="Enter siblings information" {...register("siblings")} />
                    <p className="text-xs text-muted-foreground mt-1">
                      E.g., "1 elder brother, 1 younger sister" or "No siblings"
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="familyInfo">Family Information</Label>
                    <Textarea
                      id="familyInfo"
                      placeholder="Enter additional family information"
                      className="min-h-[80px]"
                      {...register("familyInfo")}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Additional details about your family background, values, and traditions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 pt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-sm font-medium mb-2">Partner Preferences</h3>

                  <div>
                    <Label htmlFor="partnerInfo">Partner Information</Label>
                    <Textarea
                      id="partnerInfo"
                      placeholder="Describe your ideal partner and preferences"
                      className="min-h-[150px]"
                      {...register("partnerInfo")}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Describe your ideal partner including preferences for age, height, education, profession,
                      religion, diet, marital status, location, and any other specific requirements.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-sm font-medium mb-2">Profile Status</h3>
                  <div>
                    <Label htmlFor="status">Profile Status</Label>
                    <select
                      id="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="featured">Featured</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Set the visibility status of this profile.</p>
                  </div>

                  <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox
                      id="verified"
                      checked={verified}
                      onCheckedChange={(checked) => setVerified(checked as boolean)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="verified">Verified Profile</Label>
                      <p className="text-xs text-muted-foreground">
                        Mark this profile as verified if identity has been confirmed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {isSubmitting && uploadProgress > 0 && (
            <div className="w-full">
              <div className="text-sm mb-1">Uploading profile image: {uploadProgress}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
