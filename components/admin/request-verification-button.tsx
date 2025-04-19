"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getMembersService } from "@/lib/firebase/services/members-service"
import type { Member } from "@/components/admin/columns/member-columns"

interface RequestVerificationButtonProps {
  memberId: string
  changes: Partial<Member>
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function RequestVerificationButton({ memberId, changes, onSuccess, onError }: RequestVerificationButtonProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClick = async () => {
    try {
      setIsSubmitting(true)

      // Check if there are any changes
      if (Object.keys(changes).length === 0) {
        toast({
          title: "No Changes",
          description: "There are no changes to submit for verification.",
          variant: "destructive",
        })
        return
      }

      const membersService = getMembersService()
      await membersService.requestVerification(memberId, changes)

      toast({
        title: "Verification Requested",
        description: "Your changes have been submitted for verification.",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error requesting verification:", error)
      toast({
        title: "Request Failed",
        description: "There was an error submitting your verification request. Please try again.",
        variant: "destructive",
      })

      if (onError) {
        onError(error as Error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isSubmitting} variant="outline" className="flex items-center gap-2">
      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
      Request Verification
    </Button>
  )
}
