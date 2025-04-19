"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddMemberForm } from "@/components/admin/add-member-form"
import { EditMemberForm } from "@/components/admin/edit-member-form"
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog"
import {
  getCommitteeMembersByType,
  addCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
} from "@/lib/firebase/services/committee-service"
import type { CommitteeMember } from "@/lib/firebase/services/committee-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function CommitteeManagement() {
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCommitteeMembers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const members = await getCommitteeMembersByType("committee")
        setCommitteeMembers(members)
      } catch (error) {
        console.error("Error fetching committee members:", error)
        setError(error instanceof Error ? error.message : "Failed to load committee members")
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load committee members. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommitteeMembers()
  }, [])

  const handleAddMember = async (newMember) => {
    try {
      const memberData = {
        ...newMember,
        type: "committee",
        isActive: true,
      }

      const id = await addCommitteeMember(memberData)

      setCommitteeMembers([...committeeMembers, { ...memberData, id }])
      setIsAddDialogOpen(false)

      toast({
        title: "Member Added",
        description: `${newMember.name} has been added to the committee.`,
      })
    } catch (error) {
      console.error("Error adding committee member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add committee member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditMember = async (updatedMember) => {
    try {
      await updateCommitteeMember(updatedMember.id, updatedMember)

      setCommitteeMembers(committeeMembers.map((member) => (member.id === updatedMember.id ? updatedMember : member)))

      setIsEditDialogOpen(false)

      toast({
        title: "Member Updated",
        description: `${updatedMember.name}'s information has been updated.`,
      })
    } catch (error) {
      console.error("Error updating committee member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update committee member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMember = async () => {
    if (!selectedMember) return

    try {
      await deleteCommitteeMember(selectedMember.id)

      setCommitteeMembers(committeeMembers.filter((member) => member.id !== selectedMember.id))
      setIsDeleteDialogOpen(false)

      toast({
        title: "Member Removed",
        description: `${selectedMember.name} has been removed from the committee.`,
      })
    } catch (error) {
      console.error("Error deleting committee member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete committee member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (member) => {
    setSelectedMember(member)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (member) => {
    setSelectedMember(member)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Committee Members</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[180px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-[80px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : committeeMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No committee members found
                </TableCell>
              </TableRow>
            ) : (
              committeeMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.imageUrl || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.position}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(member)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Committee Member</DialogTitle>
          </DialogHeader>
          <AddMemberForm
            onSubmit={handleAddMember}
            onCancel={() => setIsAddDialogOpen(false)}
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "position", label: "Position", type: "text", required: true },
              { name: "email", label: "Email", type: "email", required: true },
              { name: "phone", label: "Phone", type: "tel", required: true },
              { name: "bio", label: "Bio", type: "textarea", required: false },
              { name: "imageUrl", label: "Photo", type: "image", required: false },
              { name: "joinDate", label: "Join Date", type: "date", required: false },
              { name: "endDate", label: "End Date", type: "date", required: false },
            ]}
          />
        </DialogContent>
      </Dialog>

      {selectedMember && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Committee Member</DialogTitle>
              </DialogHeader>
              <EditMemberForm
                member={selectedMember}
                onSubmit={handleEditMember}
                onCancel={() => setIsEditDialogOpen(false)}
                fields={[
                  { name: "name", label: "Name", type: "text", required: true },
                  { name: "position", label: "Position", type: "text", required: true },
                  { name: "email", label: "Email", type: "email", required: true },
                  { name: "phone", label: "Phone", type: "tel", required: true },
                  { name: "bio", label: "Bio", type: "textarea", required: false },
                  { name: "imageUrl", label: "Photo", type: "image", required: false },
                  { name: "joinDate", label: "Join Date", type: "date", required: false },
                  { name: "endDate", label: "End Date", type: "date", required: false },
                ]}
              />
            </DialogContent>
          </Dialog>

          <DeleteConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeleteMember}
            itemName={selectedMember.name}
            itemType="committee member"
          />
        </>
      )}
    </div>
  )
}
