"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/data-table"
import { PlusCircle } from "lucide-react"
import { createPartyPlotColumns, type PartyPlot } from "@/components/admin/columns/party-plot-columns"
import { AddPartyPlotDialog } from "@/components/admin/add-party-plot-dialog"
import { EditPartyPlotDialog } from "@/components/admin/edit-party-plot-dialog"
import { ViewPartyPlotDialog } from "@/components/admin/view-party-plot-dialog"
import { useActions } from "@/components/admin/action-provider"
import { toast } from "@/components/ui/use-toast"
import {
  getPartyPlots,
  addPartyPlot as addPartyPlotToFirebase,
  updatePartyPlot as updatePartyPlotInFirebase,
  deletePartyPlot as deletePartyPlotFromFirebase,
} from "@/lib/firebase/services/party-plots-service"

export default function PartyPlotsPage() {
  // State for party plots data
  const [partyPlots, setPartyPlots] = useState<PartyPlot[]>([])
  const [loading, setLoading] = useState(true)

  // State for dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedPartyPlot, setSelectedPartyPlot] = useState<PartyPlot | null>(null)

  // Get the handleDelete function from the actions provider
  const { handleDelete } = useActions()

  // Fetch party plots on component mount
  useEffect(() => {
    const fetchPartyPlots = async () => {
      try {
        setLoading(true)
        const data = await getPartyPlots()
        setPartyPlots(data)
      } catch (error) {
        console.error("Error fetching party plots:", error)
        toast({
          title: "Error",
          description: "Failed to load party plot bookings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPartyPlots()
  }, [])

  // Function to add a new party plot booking
  const addPartyPlot = async (newPartyPlot: Omit<PartyPlot, "id" | "bookingDate">) => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const newBookingData = {
        ...newPartyPlot,
        bookingDate: today,
      }

      // Add to Firebase
      const newId = await addPartyPlotToFirebase(newBookingData)

      // Add to local state
      const newBooking: PartyPlot = {
        ...newBookingData,
        id: newId,
      }

      setPartyPlots([...partyPlots, newBooking])

      toast({
        title: "Booking added",
        description: `${newBooking.plotName} has been successfully added.`,
      })
    } catch (error) {
      console.error("Error adding party plot:", error)
      toast({
        title: "Error",
        description: "Failed to add party plot booking",
        variant: "destructive",
      })
    }
  }

  // Function to update an existing party plot booking
  const updatePartyPlot = async (updatedPartyPlot: PartyPlot) => {
    try {
      // Update in Firebase
      await updatePartyPlotInFirebase(updatedPartyPlot.id, updatedPartyPlot)

      // Update in local state
      setPartyPlots(partyPlots.map((plot) => (plot.id === updatedPartyPlot.id ? updatedPartyPlot : plot)))

      toast({
        title: "Booking updated",
        description: `${updatedPartyPlot.plotName} has been successfully updated.`,
      })
    } catch (error) {
      console.error("Error updating party plot:", error)
      toast({
        title: "Error",
        description: "Failed to update party plot booking",
        variant: "destructive",
      })
    }
  }

  // Function to delete a party plot booking
  const deletePartyPlot = async (id: string) => {
    try {
      const partyPlotToDelete = partyPlots.find((plot) => plot.id === id)
      if (partyPlotToDelete) {
        // Delete from Firebase
        await deletePartyPlotFromFirebase(id)

        // Delete from local state
        setPartyPlots(partyPlots.filter((plot) => plot.id !== id))

        toast({
          title: "Booking deleted",
          description: `${partyPlotToDelete.plotName} has been successfully deleted.`,
        })
      }
    } catch (error) {
      console.error("Error deleting party plot:", error)
      toast({
        title: "Error",
        description: "Failed to delete party plot booking",
        variant: "destructive",
      })
    }
  }

  // Custom delete handler that shows confirmation dialog
  const handleDeleteWithConfirmation = (partyPlot: PartyPlot) => {
    // Use the handleDelete function from the actions provider to show the confirmation dialog
    handleDelete(partyPlot.id, partyPlot.plotName, "Party Plot Booking", () => {
      // This callback will be called when the user confirms the deletion
      deletePartyPlot(partyPlot.id)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Party Plots</h1>
          <p className="text-muted-foreground">Manage party plot bookings</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Booking
        </Button>
      </div>

      <DataTable
        columns={createPartyPlotColumns({
          openViewDialog: (partyPlot) => {
            setSelectedPartyPlot(partyPlot)
            setViewDialogOpen(true)
          },
          openEditDialog: (partyPlot) => {
            setSelectedPartyPlot(partyPlot)
            setEditDialogOpen(true)
          },
          handleDeletePartyPlot: handleDeleteWithConfirmation,
        })}
        data={partyPlots}
        searchField="plotName"
        filterField="status"
        filterOptions={[
          { label: "All", value: "all" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Pending", value: "pending" },
          { label: "Cancelled", value: "cancelled" },
        ]}
        isLoading={loading}
      />

      <AddPartyPlotDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onAddPartyPlot={addPartyPlot} />

      {selectedPartyPlot && (
        <>
          <EditPartyPlotDialog
            partyPlot={selectedPartyPlot}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdatePartyPlot={updatePartyPlot}
          />
          <ViewPartyPlotDialog partyPlot={selectedPartyPlot} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
        </>
      )}
    </div>
  )
}
