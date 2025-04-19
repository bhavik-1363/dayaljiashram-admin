"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

// Map the UI tab values to the database type values
const tabToTypeMap = {
  presidents: "past_president",
  secretaries: "past_secretary",
  trustees: "past_trustee",
}

export function PastMembersManagement() {
  const [pastMembers, setPastMembers] = useState<Record<string, CommitteeMember[]>>({
    presidents: [],
    trustees: [],
    secretaries: [],
  })
  const [activeTab, setActiveTab] = useState("presidents")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPastMembersByType = async (type: string, tabKey: string) => {
    try {
      const members = await getCommitteeMembersByType(type)
      setPastMembers((prev) => ({
        ...prev,
        [tabKey]: members,
      }))
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
      setError(error instanceof Error ? error.message : `Failed to load ${type}`)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to load ${type}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchPastMembers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch only the active tab data initially
        await fetchPastMembersByType(tabToTypeMap[activeTab], activeTab)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPastMembers()
  }, [activeTab])

  const handleAddMember = async (newMember) => {
    try {
      const memberData = {
        ...newMember,
        type: tabToTypeMap[activeTab],
        isActive: false,
      }

      const id = await addCommitteeMember(memberData)

      setPastMembers({
        ...pastMembers,
        [activeTab]: [...pastMembers[activeTab], { ...memberData, id }],
      })

      setIsAddDialogOpen(false)

      toast({
        title: "Member Added",
        description: `${newMember.name} has been added to the past ${getSingularTitle(activeTab)}.`,
      })
    } catch (error) {
      console.error("Error adding past member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add past member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditMember = async (updatedMember) => {
    try {
      await updateCommitteeMember(updatedMember.id, updatedMember)

      setPastMembers({
        ...pastMembers,
        [activeTab]: pastMembers[activeTab].map((member) => (member.id === updatedMember.id ? updatedMember : member)),
      })

      setIsEditDialogOpen(false)

      toast({
        title: "Member Updated",
        description: `${updatedMember.name}'s information has been updated.`,
      })
    } catch (error) {
      console.error("Error updating past member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update past member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMember = async () => {
    if (!selectedMember) return

    try {
      await deleteCommitteeMember(selectedMember.id)

      setPastMembers({
        ...pastMembers,
        [activeTab]: pastMembers[activeTab].filter((member) => member.id !== selectedMember.id),
      })

      setIsDeleteDialogOpen(false)

      toast({
        title: "Member Removed",
        description: `${selectedMember.name} has been removed from the past ${getSingularTitle(activeTab)}.`,
      })
    } catch (error) {
      console.error("Error deleting past member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete past member. Please try again.",
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

  const getTabTitle = (tab) => {
    switch (tab) {
      case "presidents":
        return "Past Presidents"
      case "trustees":
        return "Past Trustees"
      case "secretaries":
        return "Past Secretaries"
      default:
        return ""
    }
  }

  const getSingularTitle = (tab) => {
    switch (tab) {
      case "presidents":
        return "President"
      case "trustees":
        return "Trustee"
      case "secretaries":
        return "Secretary"
      default:
        return ""
    }
  }

  const currentMembers = pastMembers[activeTab] || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Past Members</h2>
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presidents">Presidents</SelectItem>
              <SelectItem value="trustees">Trustees</SelectItem>
              <SelectItem value="secretaries">Secretaries</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add {getSingularTitle(activeTab)}
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
              <TableHead>Term</TableHead>
              <TableHead>Achievements</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-[80px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : currentMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No past {activeTab} found
                </TableCell>
              </TableRow>
            ) : (
              currentMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.imageUrl || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.term}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {Array.isArray(member.achievements) ? member.achievements.join(", ") : member.achievements || ""}
                  </TableCell>
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
            <DialogTitle>Add Past {getSingularTitle(activeTab)}</DialogTitle>
          </DialogHeader>
          <AddMemberForm
            onSubmit={handleAddMember}
            onCancel={() => setIsAddDialogOpen(false)}
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "term", label: "Term", type: "text", required: true },
              { name: "achievements", label: "Achievements", type: "achievements", required: false },
              { name: "imageUrl", label: "Photo", type: "image", required: false },
            ]}
          />
        </DialogContent>
      </Dialog>

      {selectedMember && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Past {getSingularTitle(activeTab)}</DialogTitle>
              </DialogHeader>
              <EditMemberForm
                member={selectedMember}
                onSubmit={handleEditMember}
                onCancel={() => setIsEditDialogOpen(false)}
                fields={[
                  { name: "name", label: "Name", type: "text", required: true },
                  { name: "term", label: "Term", type: "text", required: true },
                  { name: "achievements", label: "Achievements", type: "achievements", required: false },
                  { name: "imageUrl", label: "Photo", type: "image", required: false },
                ]}
              />
            </DialogContent>
          </Dialog>

          <DeleteConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeleteMember}
            itemName={selectedMember.name}
            itemType={`past ${getSingularTitle(activeTab)}`}
          />
        </>
      )}
    </div>
  )
}
