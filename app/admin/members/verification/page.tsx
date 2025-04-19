"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { VerificationRequestCard } from "@/components/admin/verification-request-card"
import { getVerificationService, type VerificationRequest } from "@/lib/firebase/services/verification-service"
import { getMembersService } from "@/lib/firebase/services/members-service"
import type { Member } from "@/components/admin/columns/member-columns"

export default function MemberVerificationPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [members, setMembers] = useState<Record<string, Member>>({})
  const [error, setError] = useState<string | null>(null)

  // Fetch verification requests and member data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get all pending verification requests
      const verificationService = getVerificationService()
      const requests = await verificationService.getVerificationRequests()

      // Filter to only show pending requests
      const pendingRequests = requests.filter((req) => req.status === "pending")
      setVerificationRequests(pendingRequests)

      // Get member data for each request
      const membersService = getMembersService()
      const memberIds = [...new Set(pendingRequests.map((req) => req.memberId))]

      const membersData: Record<string, Member> = {}

      await Promise.all(
        memberIds.map(async (id) => {
          const member = await membersService.getMember(id)
          if (member) {
            membersData[id] = member
          }
        }),
      )

      setMembers(membersData)
    } catch (error) {
      console.error("Error fetching verification data:", error)
      setError("Failed to load verification requests. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = () => {
    toast({
      title: "Changes Approved",
      description: "The member's information has been updated successfully.",
    })
    fetchData() // Refresh the data
  }

  const handleReject = () => {
    toast({
      title: "Changes Rejected",
      description: "The verification request has been rejected.",
    })
    fetchData() // Refresh the data
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/admin/members">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Members
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Pending Verifications</h1>
        </div>

        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading verification requests...</p>
        </div>
      ) : verificationRequests.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No pending verification requests.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {verificationRequests.map((request) => {
            const member = members[request.memberId]

            if (!member) {
              return (
                <div key={request.id} className="border rounded-lg p-4 bg-red-50">
                  <p className="text-red-700">Error: Member data not found for verification request {request.id}</p>
                </div>
              )
            }

            return (
              <VerificationRequestCard
                key={request.id}
                request={request}
                member={member}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
