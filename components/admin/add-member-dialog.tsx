"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/admin/image-upload"
import type { Address } from "@/components/admin/columns/member-columns"
import { getMembersService } from "@/lib/firebase/services/members-service"
import { useToast } from "@/components/ui/use-toast"

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (member: any) => Promise<boolean>
}

// Helper function to validate date strings
const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export function AddMemberDialog({ open, onOpenChange, onSubmit }: AddMemberDialogProps) {
  const emptyAddress: Address = {
    homeNo: "",
    address1: "",
    address2: "",
    landmark: "",
    area: "",
    postOffice: "",
    city: "",
    taluka: "",
    district: "",
    pincode: "",
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",

    joinDate: "",
    role: "Member",
    status: "active" as "active" | "inactive" | "pending",

    membership_no: "",
    mobile: "",
    phoneNo: "",
    dateOfBirth: "",
    remarks: "",

    postal_address: { ...emptyAddress },
    residential_address: { ...emptyAddress },
  })

  const [sameAsPostal, setSameAsPostal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const { toast } = useToast()

  // Update residential address when sameAsPostal changes
  useEffect(() => {
    if (sameAsPostal) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        residential_address: { ...prevFormData.postal_address },
      }))
    }
  }, [sameAsPostal])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".")

      // If updating postal address and sameAsPostal is checked, update residential too
      if (parent === "postal_address" && sameAsPostal) {
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent as keyof typeof formData],
            [child]: value,
          },
          residential_address: {
            ...formData.residential_address,
            [child]: value,
          },
        })
      } else {
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent as keyof typeof formData],
            [child]: value,
          },
        })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleDateChange = (date: Date | undefined, fieldName: string) => {
    if (date) {
      setFormData({
        ...formData,
        [fieldName]: format(date, "yyyy-MM-dd"),
      })
    } else {
      setFormData({
        ...formData,
        [fieldName]: null,
      })
    }
  }

  const handleImageChange = async (value: string | File) => {
    try {
      // If we received a File object, upload it to Firebase Storage
      if (value instanceof File) {
        setIsUploadingImage(true)

        const membersService = getMembersService()
        const downloadURL = await membersService.uploadProfileImage(value)

        setFormData({
          ...formData,
          avatar: downloadURL,
        })

        toast({
          title: "Image uploaded successfully",
          description: "Your profile image has been uploaded.",
        })
      } else {
        // If we received a string (URL or empty string), just update the state
        setFormData({
          ...formData,
          avatar: value,
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
      setIsUploadingImage(false)
    }
  }

  // Update the handleSubmit function to better handle date validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create a clean copy of the form data for submission
      const memberData = { ...formData }

      // Validate dates before submission
      if (memberData.joinDate) {
        if (isValidDate(memberData.joinDate)) {
          memberData.joinDate = new Date(memberData.joinDate).toISOString()
        } else {
          console.warn("Invalid join date detected, using current date instead")
          memberData.joinDate = new Date().toISOString()
        }
      } else {
        memberData.joinDate = new Date().toISOString()
      }

      if (memberData.dateOfBirth) {
        if (isValidDate(memberData.dateOfBirth)) {
          memberData.dateOfBirth = new Date(memberData.dateOfBirth).toISOString()
        } else {
          console.warn("Invalid date of birth detected, removing from submission")
          delete memberData.dateOfBirth
        }
      }

      // Set profile image
      memberData.profileImage = memberData.avatar

      console.log("Submitting member data:", memberData)

      // Submit the data
      const success = await onSubmit(memberData)

      if (success) {
        // Reset form
        setFormData({
          name: "",
          email: "",
          avatar: "",
          joinDate: "",
          role: "Member",
          status: "active",
          membership_no: "",
          mobile: "",
          phoneNo: "",
          dateOfBirth: "",
          remarks: "",
          postal_address: { ...emptyAddress },
          residential_address: { ...emptyAddress },
        })
        setSameAsPostal(false)
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error adding member",
        description: "There was a problem adding the member. Please check the date fields and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isProcessing = isSubmitting || isUploadingImage

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isProcessing && onOpenChange(newOpen)}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <ImageUpload value={formData.avatar} onChange={handleImageChange} />

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="postal">Postal Address</TabsTrigger>
              <TabsTrigger value="residential">Residential Address</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="membership_no">Membership Number</Label>
                  <Input
                    id="membership_no"
                    name="membership_no"
                    value={formData.membership_no}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNo">Phone Number</Label>
                  <Input id="phoneNo" name="phoneNo" value={formData.phoneNo} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dateOfBirth && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateOfBirth && isValidDate(formData.dateOfBirth)
                          ? format(new Date(formData.dateOfBirth), "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.dateOfBirth && isValidDate(formData.dateOfBirth)
                            ? new Date(formData.dateOfBirth)
                            : undefined
                        }
                        onSelect={(date) => handleDateChange(date, "dateOfBirth")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.joinDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.joinDate && isValidDate(formData.joinDate)
                          ? format(new Date(formData.joinDate), "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.joinDate && isValidDate(formData.joinDate) ? new Date(formData.joinDate) : undefined
                        }
                        onSelect={(date) => handleDateChange(date, "joinDate")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    name="role"
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange(value, "role")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Contributor">Contributor</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange(value, "status")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="postal" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_address.homeNo">Home No.</Label>
                  <Input
                    id="postal_address.homeNo"
                    name="postal_address.homeNo"
                    value={formData.postal_address.homeNo}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_address.address1">Address Line 1</Label>
                  <Input
                    id="postal_address.address1"
                    name="postal_address.address1"
                    value={formData.postal_address.address1}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_address.address2">Address Line 2</Label>
                  <Input
                    id="postal_address.address2"
                    name="postal_address.address2"
                    value={formData.postal_address.address2}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_address.landmark">Landmark</Label>
                  <Input
                    id="postal_address.landmark"
                    name="postal_address.landmark"
                    value={formData.postal_address.landmark}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_address.area">Area</Label>
                  <Input
                    id="postal_address.area"
                    name="postal_address.area"
                    value={formData.postal_address.area}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_address.postOffice">Post Office</Label>
                  <Input
                    id="postal_address.postOffice"
                    name="postal_address.postOffice"
                    value={formData.postal_address.postOffice}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_address.city">City</Label>
                  <Input
                    id="postal_address.city"
                    name="postal_address.city"
                    value={formData.postal_address.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_address.taluka">Taluka</Label>
                  <Input
                    id="postal_address.taluka"
                    name="postal_address.taluka"
                    value={formData.postal_address.taluka}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_address.district">District</Label>
                  <Input
                    id="postal_address.district"
                    name="postal_address.district"
                    value={formData.postal_address.district}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_address.pincode">Pincode</Label>
                  <Input
                    id="postal_address.pincode"
                    name="postal_address.pincode"
                    value={formData.postal_address.pincode}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2 flex items-center space-x-2 pt-4">
                  <Checkbox
                    id="same-address"
                    checked={sameAsPostal}
                    onCheckedChange={(checked) => setSameAsPostal(checked === true)}
                  />
                  <Label htmlFor="same-address" className="font-medium">
                    Residential address is same as postal address
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="residential" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="residential_address.homeNo">Home No.</Label>
                  <Input
                    id="residential_address.homeNo"
                    name="residential_address.homeNo"
                    value={formData.residential_address.homeNo}
                    onChange={handleChange}
                    disabled={sameAsPostal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residential_address.address1">Address Line 1</Label>
                  <Input
                    id="residential_address.address1"
                    name="residential_address.address1"
                    value={formData.residential_address.address1}
                    onChange={handleChange}
                    disabled={sameAsPostal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residential_address.address2">Address Line 2</Label>
                  <Input
                    id="residential_address.address2"
                    name="residential_address.address2"
                    value={formData.residential_address.address2}
                    onChange={handleChange}
                    disabled={sameAsPostal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residential_address.landmark">Landmark</Label>
                  <Input
                    id="residential_address.landmark"
                    name="residential_address.landmark"
                    value={formData.residential_address.landmark}
                    onChange={handleChange}
                    disabled={sameAsPostal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residential_address.area">Area</Label>
                  <Input
                    id="residential_address.area"
                    name="residential_address.area"
                    value={formData.residential_address.area}
                    onChange={handleChange}
                    disabled={sameAsPostal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residential_address.city">City</Label>
                  <Input
                    id="residential_address.city"
                    name="residential_address.city"
                    value={formData.residential_address.city}
                    onChange={handleChange}
                    disabled={sameAsPostal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residential_address.taluka">Taluka</Label>
                  <Input
                    id="residential_address.taluka"
                    name="residential_address.taluka"
                    value={formData.residential_address.taluka}
                    onChange={handleChange}
                    disabled={sameAsPostal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residential_address.district">District</Label>
                  <Input
                    id="residential_address.district"
                    name="residential_address.district"
                    value={formData.residential_address.district}
                    onChange={handleChange}
                    disabled={sameAsPostal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residential_address.pincode">Pincode</Label>
                  <Input
                    id="residential_address.pincode"
                    name="residential_address.pincode"
                    value={formData.residential_address.pincode}
                    onChange={handleChange}
                    disabled={sameAsPostal}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingImage ? "Uploading Image..." : "Adding Member..."}
                </>
              ) : (
                "Add Member"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
