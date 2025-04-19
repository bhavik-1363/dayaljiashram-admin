"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"
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

export function TrusteesManagement() {
  const [trustees, setTrustees] = useState<CommitteeMember[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTrustee, setSelectedTrustee] = useState<CommitteeMember | null>(null)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrustees = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const members = await getCommitteeMembersByType("trustee")
        setTrustees(members)
      } catch (error) {
        console.error("Error fetching trustees:", error)
        setError(error instanceof Error ? error.message : "Failed to load trustees")
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load trustees. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrustees()
  }, [])

  const handleAddTrustee = async (newTrustee) => {
    try {
      const trusteeData = {
        ...newTrustee,
        type: "trustee",
        isActive: true,
      }

      const id = await addCommitteeMember(trusteeData)

      setTrustees([...trustees, { ...trusteeData, id }])
      setIsAddDialogOpen(false)

      toast({
        title: "Trustee Added",
        description: `${newTrustee.name} has been added to the trustees.`,
      })
    } catch (error) {
      console.error("Error adding trustee:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add trustee. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditTrustee = async (updatedTrustee) => {
    try {
      await updateCommitteeMember(updatedTrustee.id, updatedTrustee)

      setTrustees(trustees.map((trustee) => (trustee.id === updatedTrustee.id ? updatedTrustee : trustee)))

      setIsEditDialogOpen(false)

      toast({
        title: "Trustee Updated",
        description: `${updatedTrustee.name}'s information has been updated.`,
      })
    } catch (error) {
      console.error("Error updating trustee:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update trustee. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTrustee = async () => {
    if (!selectedTrustee) return

    try {
      await deleteCommitteeMember(selectedTrustee.id)

      setTrustees(trustees.filter((trustee) => trustee.id !== selectedTrustee.id))
      setIsDeleteDialogOpen(false)

      toast({
        title: "Trustee Removed",
        description: `${selectedTrustee.name} has been removed from the trustees.`,
      })
    } catch (error) {
      console.error("Error deleting trustee:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete trustee. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (trustee) => {
    setSelectedTrustee(trustee)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (trustee) => {
    setSelectedTrustee(trustee)
    setIsDeleteDialogOpen(true)
  }

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trustees</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Trustee
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
              <TableHead>Term</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
              <TableHead className="w-[50px]"></TableHead>
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
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : trustees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No trustees found
                </TableCell>
              </TableRow>
            ) : (
              trustees.flatMap((trustee) => [
                <TableRow key={trustee.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={trustee.imageUrl || "/placeholder.svg"} alt={trustee.name} />
                      <AvatarFallback>{trustee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{trustee.name}</TableCell>
                  <TableCell>{trustee.position}</TableCell>
                  <TableCell>{trustee.term}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(trustee)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(trustee)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRowExpand(trustee.id)}
                      aria-label={expandedRows[trustee.id] ? "Collapse row" : "Expand row"}
                    >
                      {expandedRows[trustee.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>,
                expandedRows[trustee.id] && (
                  <TableRow key={`${trustee.id}-expanded`}>
                    <TableCell colSpan={6} className="bg-muted/50 p-4">
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-semibold">Bio</h4>
                          <p className="text-sm">{trustee.bio || "No bio available"}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Achievements</h4>
                          {trustee.achievements && trustee.achievements.length > 0 ? (
                            <ul className="list-disc list-inside text-sm">
                              {trustee.achievements.map((achievement, index) => (
                                <li key={index}>{achievement}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm">No achievements listed</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              ])
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Trustee</DialogTitle>
          </DialogHeader>
          <AddMemberForm
            onSubmit={handleAddTrustee}
            onCancel={() => setIsAddDialogOpen(false)}
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "position", label: "Position", type: "text", required: true },
              { name: "term", label: "Term", type: "text", required: true },
              { name: "bio", label: "Bio", type: "textarea", required: false },
              { name: "achievements", label: "Achievements", type: "achievements", required: false },
              { name: "imageUrl", label: "Photo", type: "image", required: false },
            ]}
          />
        </DialogContent>
      </Dialog>

      {selectedTrustee && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Trustee</DialogTitle>
              </DialogHeader>
              <EditMemberForm
                member={selectedTrustee}
                onSubmit={handleEditTrustee}
                onCancel={() => setIsEditDialogOpen(false)}
                fields={[
                  { name: "name", label: "Name", type: "text", required: true },
                  { name: "position", label: "Position", type: "text", required: true },
                  { name: "term", label: "Term", type: "text", required: true },
                  { name: "bio", label: "Bio", type: "textarea", required: false },
                  { name: "achievements", label: "Achievements", type: "achievements", required: false },
                  { name: "imageUrl", label: "Photo", type: "image", required: false },
                ]}
              />
            </DialogContent>
          </Dialog>

          <DeleteConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeleteTrustee}
            itemName={selectedTrustee.name}
            itemType="trustee"
          />
        </>
      )}
    </div>
  )
}
