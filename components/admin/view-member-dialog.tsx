"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Member } from "@/components/admin/columns/member-columns"

interface ViewMemberDialogProps {
  member: Member
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper function to format dates from various formats
const formatDateValue = (dateValue: any): string => {
  if (!dateValue) return "Not specified"

  // Handle Firestore Timestamp objects
  if (typeof dateValue === "object" && dateValue !== null && "seconds" in dateValue) {
    return new Date(dateValue.seconds * 1000).toLocaleDateString()
  }

  // Handle ISO strings or other date formats
  try {
    return new Date(dateValue).toLocaleDateString()
  } catch (error) {
    console.error("Error formatting date:", error)
    return String(dateValue) || "Invalid date"
  }
}

export function ViewMemberDialog({ member, open, onOpenChange }: ViewMemberDialogProps) {
  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n?.[0] || "")
      .join("")
  }

  const renderAddress = (address: any) => {
    if (!address) return "No address provided"

    const parts = [
      address.homeNo,
      address.address1,
      address.address2,
      address.landmark && `Near ${address.landmark}`,
      address.area,
      address.postOffice,
      address.city,
      address.taluka && `Taluka: ${address.taluka}`,
      address.district && `District: ${address.district}`,
      address.pincode && `PIN: ${address.pincode}`,
    ].filter(Boolean)

    return parts.join(", ") || "No address details provided"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{member.name}</h2>
              <p className="text-muted-foreground">{member.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    member.status === "active" ? "default" : member.status === "inactive" ? "secondary" : "outline"
                  }
                >
                  {member.status || "No status"}
                </Badge>
                {member.role && <Badge variant="outline">{member.role}</Badge>}
              </div>
            </div>
          </div>

          <Tabs defaultValue="contact">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
            </TabsList>

            <TabsContent value="contact" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Membership Number</h3>
                  <p>{member.membership_no || "Not assigned"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Join Date</h3>
                  <p>{formatDateValue(member.joinDate)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Mobile</h3>
                  <p>{member.mobile || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Phone Number</h3>
                  <p>{member.phoneNo || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                  <p>{member.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Date of Birth</h3>
                  <p>{formatDateValue(member.dateOfBirth)}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4 pt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Postal Address</h3>
                  <p className="text-muted-foreground">{renderAddress(member.postal_address)}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Residential Address</h3>
                  <p className="text-muted-foreground">{renderAddress(member.residential_address)}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 pt-4">
              <div>
                <h3 className="font-medium mb-2">Remarks</h3>
                <p className="text-muted-foreground">{member.remarks || "No remarks"}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
