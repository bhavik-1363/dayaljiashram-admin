"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { PlusCircle, ShieldCheck, RefreshCw } from "lucide-react"
import { DataTable } from "@/components/admin/data-table"
import { memberColumns, MemberActionsProvider, type Member } from "@/components/admin/columns/member-columns"
import { AddMemberDialog } from "@/components/admin/add-member-dialog"
import { ViewMemberDialog } from "@/components/admin/view-member-dialog"
import { EditMemberDialog } from "@/components/admin/edit-member-dialog"
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog"
import { useAuth } from "@/lib/firebase/auth-context"
import { getMembersService } from "@/lib/firebase/services/members-service"
import { useRouter } from "next/navigation"

export default function MembersPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  // Use a ref to prevent multiple fetch attempts
  const fetchAttemptedRef = useRef(false)

  // Fetch members
  useEffect(() => {
    // Skip if we've already attempted to fetch or if there's no user
    if (fetchAttemptedRef.current || !user) {
      return
    }

    fetchAttemptedRef.current = true
    console.log("Fetching members from Firebase")

    async function fetchMembers() {
      try {
        setIsLoading(true)
        setFetchError(null)

        const membersService = getMembersService()
        const fetchedMembers = await membersService.getMembers()
        console.log("Successfully fetched members:", fetchedMembers.length)

        setMembers(fetchedMembers)
        setFetchError(null)
      } catch (error) {
        console.error("Error fetching members:", error)
        setFetchError("Failed to load members. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [user]) // Only depend on user

  // Set up event listeners for member actions
  useEffect(() => {
    const handleViewMember = (event: Event) => {
      const member = (event as CustomEvent).detail
      setSelectedMember(member)
      setViewDialogOpen(true)
    }

    const handleEditMember = (event: Event) => {
      const member = (event as CustomEvent).detail
      setSelectedMember(member)
      setEditDialogOpen(true)
    }

    const handleDeleteMember = (event: Event) => {
      const member = (event as CustomEvent).detail
      setSelectedMember(member)
      setDeleteDialogOpen(true)
    }

    window.addEventListener("viewMember", handleViewMember as EventListener)
    window.addEventListener("editMember", handleEditMember as EventListener)
    window.addEventListener("deleteMember", handleDeleteMember as EventListener)

    return () => {
      window.removeEventListener("viewMember", handleViewMember as EventListener)
      window.removeEventListener("editMember", handleEditMember as EventListener)
      window.removeEventListener("deleteMember", handleDeleteMember as EventListener)
    }
  }, [])

  const handleAddMember = async (memberData: Partial<Member>) => {
    try {
      const membersService = getMembersService()
      const newMember = await membersService.addMember(memberData)
      setMembers((prev) => [...prev, newMember])

      toast({
        title: "Success",
        description: "Member added successfully",
      })

      return true
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      })
      return false
    }
  }

  const handleUpdateMember = async (id: string, memberData: Partial<Member>) => {
    try {
      const membersService = getMembersService()
      const updatedMember = await membersService.updateMember(id, memberData)
      setMembers((prev) => prev.map((member) => (member.id === id ? updatedMember : member)))

      toast({
        title: "Success",
        description: "Member updated successfully",
      })

      return true
    } catch (error) {
      console.error("Error updating member:", error)
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive",
      })
      return false
    }
  }

  const handleDeleteMember = async (id: string) => {
    try {
      const membersService = getMembersService()
      await membersService.deleteMember(id)
      setMembers((prev) => prev.filter((member) => member.id !== id))

      toast({
        title: "Success",
        description: "Member deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting member:", error)
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      })
      return false
    }
  }

  const handleRetryFetch = () => {
    fetchAttemptedRef.current = false
    setIsLoading(true)
    setFetchError(null)
    setMembers([])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">Manage community members</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/members/verification")}
            className="flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Verification</span>
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Member</span>
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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
            <div className="ml-3 flex justify-between w-full">
              <p className="text-sm text-red-700">{fetchError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryFetch}
                className="flex items-center gap-1 text-red-700 border-red-300 hover:bg-red-50"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading members...</p>
        </div>
      ) : (
        <MemberActionsProvider onEdit={handleUpdateMember} onDelete={handleDeleteMember}>
          <DataTable columns={memberColumns} data={members} searchField="name" />
        </MemberActionsProvider>
      )}

      <AddMemberDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSubmit={handleAddMember} />

      {selectedMember && (
        <>
          <ViewMemberDialog member={selectedMember} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
          <EditMemberDialog
            member={selectedMember}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdateMember={(data) => handleUpdateMember(selectedMember.id, data)}
          />
          <DeleteConfirmationDialog
            title="Delete Member"
            description={`Are you sure you want to delete ${selectedMember.name}? This action cannot be undone.`}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={() => handleDeleteMember(selectedMember.id)}
          />
        </>
      )}
    </div>
  )
}
