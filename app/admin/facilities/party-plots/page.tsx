"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { createVenueColumns, VenueActionsProvider, type Venue } from "@/components/admin/columns/venue-columns"
import { AddVenueDialog } from "@/components/admin/add-venue-dialog"
import {
  getVenues,
  addVenue,
  updateVenue,
  deleteVenue,
  getVenuesByCapacityRange,
} from "@/lib/firebase/services/venues-service"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/admin/page-header"

export default function PartyPlotsPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState("all")
  const { toast } = useToast()

  // Fetch venues on component mount
  useEffect(() => {
    async function fetchVenues() {
      try {
        setLoading(true)
        const data = await getVenues()
        setVenues(data)
        console.log("data", data)
        setError(null)
      } catch (err) {
        console.error("Error fetching venues:", err)
        setError("Failed to load venues. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load venues. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [toast])

  // Handler for adding a new venue
  const handleAddVenue = async (newVenue: Omit<Venue, "id">) => {
    try {
      setLoading(true)
      const addedVenue = await addVenue(newVenue)
      setVenues((prev) => [...prev, addedVenue])
      toast({
        title: "Success",
        description: "Venue added successfully!",
      })
    } catch (err) {
      console.error("Error adding venue:", err)
      toast({
        title: "Error",
        description: "Failed to add venue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setAddDialogOpen(false)
    }
  }

  // Handler for updating a venue
  const handleUpdateVenue = async (updatedVenue: Venue) => {
    try {
      setLoading(true)
      await updateVenue(updatedVenue)
      setVenues((prev) => prev.map((venue) => (venue.id === updatedVenue.id ? updatedVenue : venue)))
      toast({
        title: "Success",
        description: "Venue updated successfully!",
      })
    } catch (err) {
      console.error("Error updating venue:", err)
      toast({
        title: "Error",
        description: "Failed to update venue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handler for deleting a venue
  const handleDeleteVenue = async (venueId: string) => {
    try {
      setLoading(true)
      await deleteVenue(venueId)
      setVenues((prev) => prev.filter((venue) => venue.id !== venueId))
      toast({
        title: "Success",
        description: "Venue deleted successfully!",
      })
    } catch (err) {
      console.error("Error deleting venue:", err)
      toast({
        title: "Error",
        description: "Failed to delete venue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handler for filtering venues by capacity range
  const handleFilterChange = async (value: string) => {
    try {
      setLoading(true)
      setCurrentFilter(value)
      const filteredVenues = await getVenuesByCapacityRange(value)
      setVenues(filteredVenues)
    } catch (err) {
      console.error("Error filtering venues:", err)
      toast({
        title: "Error",
        description: "Failed to filter venues. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader title="Party Plots" description="Manage party plots and venues" />
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Party Plot
        </Button>
      </div>

      {error ? (
        <div className="rounded-md bg-destructive/15 p-4">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : (
        <VenueActionsProvider onUpdate={handleUpdateVenue} onDelete={handleDeleteVenue}>
          {(actions) => (
            <DataTable
              columns={createVenueColumns(actions)}
              data={venues}
              searchField="name"
              filterField="capacityRange"
              filterOptions={[
                { label: "All", value: "all" },
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" },
              ]}
              onFilterChange={handleFilterChange}
              isLoading={loading}
            />
          )}
        </VenueActionsProvider>
      )}

      <AddVenueDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onAddVenue={handleAddVenue} />
    </div>
  )
}
