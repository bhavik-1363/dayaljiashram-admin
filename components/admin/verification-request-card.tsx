"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getVerificationService, type VerificationRequest } from "@/lib/firebase/services/verification-service"
import type { Member } from "@/components/admin/columns/member-columns"

interface VerificationRequestCardProps {
  request: VerificationRequest
  member: Member
  onApprove: () => void
  onReject: () => void
}

export function VerificationRequestCard({ request, member, onApprove, onReject }: VerificationRequestCardProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleApprove = async () => {
    try {
      setIsProcessing(true)
      const verificationService = getVerificationService()
      await verificationService.approveVerificationRequest(request.id, "admin", reviewNotes)

      toast({
        title: "Changes Approved",
        description: "The member's information has been updated successfully.",
      })

      onApprove()
    } catch (error) {
      console.error("Error approving verification request:", error)
      toast({
        title: "Approval Failed",
        description: "There was an error approving the changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsProcessing(true)
      const verificationService = getVerificationService()
      await verificationService.rejectVerificationRequest(request.id, "admin", reviewNotes)

      toast({
        title: "Changes Rejected",
        description: "The verification request has been rejected.",
      })

      onReject()
    } catch (error) {
      console.error("Error rejecting verification request:", error)
      toast({
        title: "Rejection Failed",
        description: "There was an error rejecting the changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Helper function to render changes
  const renderChanges = () => {
    const changes = request.changes
    const original = request.originalData || {}

    return (
      <div className="space-y-4">
        {Object.keys(changes).map((key) => {
          const fieldKey = key as keyof Member
          const newValue = changes[fieldKey]
          const oldValue = original[fieldKey]

          // Skip rendering if the field is complex (like addresses) - we'll handle those separately
          if (typeof newValue === "object" && newValue !== null && !Array.isArray(newValue)) {
            return null
          }

          return (
            <div key={key} className="border rounded-md overflow-hidden">
              <div className="bg-muted px-4 py-2 font-medium">{key}</div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                  <div className="line-through text-muted-foreground">{oldValue?.toString() || "—"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">New Value</div>
                  <div className="font-medium">{newValue?.toString() || "—"}</div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Handle address changes separately */}
        {renderAddressChanges("postal_address", "Postal Address")}
        {renderAddressChanges("residential_address", "Residential Address")}

        {/* Handle profile image changes */}
        {renderProfileImageChange()}
      </div>
    )
  }

  // Helper function to render address changes
  const renderAddressChanges = (addressKey: "postal_address" | "residential_address", label: string) => {
    const newAddress = request.changes[addressKey]
    const oldAddress = request.originalData?.[addressKey]

    if (!newAddress || typeof newAddress !== "object") return null

    const addressFields = [
      { key: "homeNo", label: "Home No." },
      { key: "address1", label: "Address Line 1" },
      { key: "address2", label: "Address Line 2" },
      { key: "landmark", label: "Landmark" },
      { key: "area", label: "Area" },
      { key: "postOffice", label: "Post Office" },
      { key: "city", label: "City" },
      { key: "taluka", label: "Taluka" },
      { key: "district", label: "District" },
      { key: "pincode", label: "Pincode" },
    ]

    const hasChanges = addressFields.some(({ key }) => {
      const typedKey = key as keyof typeof newAddress
      return newAddress[typedKey] !== oldAddress?.[typedKey]
    })

    if (!hasChanges) return null

    return (
      <div className="border rounded-md overflow-hidden mt-4">
        <div className="bg-muted px-4 py-2 font-medium">{label}</div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2 font-medium">Field</th>
                <th className="text-left p-2 font-medium">Current Value</th>
                <th className="text-left p-2 font-medium">New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {addressFields.map(({ key, label }) => {
                const typedKey = key as keyof typeof newAddress
                const newValue = newAddress[typedKey]
                const oldValue = oldAddress?.[typedKey]

                if (newValue === oldValue) return null

                return (
                  <tr key={key} className="hover:bg-muted/50">
                    <td className="p-2 font-medium">{label}</td>
                    <td className="p-2 line-through text-muted-foreground">{oldValue || "—"}</td>
                    <td className="p-2 font-medium">{newValue || "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render profile image changes
  const renderProfileImageChange = () => {
    const newAvatar = request.changes.avatar
    const oldAvatar = request.originalData?.avatar

    if (!newAvatar || newAvatar === oldAvatar) return null

    return (
      <div className="border rounded-md overflow-hidden mt-4">
        <div className="bg-muted px-4 py-2 font-medium">Profile Image</div>
        <div className="p-4 flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="mb-1 text-xs text-muted-foreground">Current</div>
            <Avatar className="h-20 w-20">
              <AvatarImage src={oldAvatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
          <div className="text-center">
            <div className="mb-1 text-xs text-muted-foreground">New</div>
            <Avatar className="h-20 w-20">
              <AvatarImage src={newAvatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{member.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                Member ID: {member.membership_no || member.id}
                <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                  Pending
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="changes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="details">Request Details</TabsTrigger>
          </TabsList>

          <TabsContent value="changes" className="space-y-4 pt-4">
            {renderChanges()}
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Requested By</h3>
                <p>{request.requestedBy}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Requested On</h3>
                <p>{formatDate(request.requestedAt as string)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className="capitalize">{request.status}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Number of Changes</h3>
                <p>{Object.keys(request.changes).length}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-4">
          <Label htmlFor="review-notes">Review Notes (Optional)</Label>
          <Textarea
            id="review-notes"
            placeholder="Add notes about your decision..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        <Button
          variant="outline"
          className="text-destructive border-destructive"
          onClick={handleReject}
          disabled={isProcessing}
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
        <Button onClick={handleApprove} disabled={isProcessing}>
          <Check className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </CardFooter>
    </Card>
  )
}
