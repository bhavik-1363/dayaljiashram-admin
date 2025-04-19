"use client"

import { useState } from "react"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { createVenueColumns, VenueActionsProvider, type Venue } from "@/components/admin/columns/venue-columns"
import { AddVenueDialog } from "@/components/admin/add-venue-dialog"

// Sample data for venues (party plots)
const initialVenues = [
  {
    id: "venue1",
    name: "Royal Garden Party Plot",
    description:
      "A luxurious venue with beautiful gardens and modern amenities, perfect for weddings and large gatherings.",
    capacity: "500 people",
    capacityRange: "large" as const,
    area: "15,000 sq ft",
    price: "₹75,000 per day",
    image: "/urban-skyline-soiree.png",
    address: "123 Garden Road, Ahmedabad, Gujarat 380015",
    contactPhone: "+91 98765 43210",
    contactEmail: "bookings@royalgarden.com",
    eventTypes: ["Wedding", "Corporate Event", "Birthday Party", "Anniversary"],
    amenities: [
      "Parking",
      "Air Conditioning",
      "Catering",
      "Sound System",
      "Stage",
      "Decoration",
      "WiFi",
      "Power Backup",
    ],
    venueRules: [
      {
        title: "Noise Restrictions",
        description: "Music must be turned down after 10 PM to comply with local regulations.",
      },
      {
        title: "Outside Catering",
        description: "Outside catering is allowed with prior permission and additional charges.",
      },
      {
        title: "Decorations",
        description:
          "No permanent fixtures or nails allowed on walls. All decorations must be removed after the event.",
      },
    ],
    providedItems: [
      {
        category: "Furniture",
        items: [
          {
            name: "Chairs",
            quantity: 500,
            description: "Comfortable cushioned chairs",
          },
          {
            name: "Tables",
            quantity: 50,
            description: "Round tables seating 10 people each",
          },
        ],
      },
      {
        category: "Audio/Visual",
        items: [
          {
            name: "Sound System",
            quantity: 1,
            description: "Professional sound system with speakers and microphones",
          },
          {
            name: "Projector",
            quantity: 2,
            description: "HD projectors with screens",
          },
        ],
      },
    ],
    contactInfo: {
      name: "Rajesh Patel",
      phone: "+91 98765 43210",
      email: "rajesh@royalgarden.com",
    },
    images: ["/urban-skyline-soiree.png", "/urban-evening-gathering.png"],
  },
  {
    id: "venue2",
    name: "Riverside Banquet Hall",
    description:
      "An elegant banquet hall with a beautiful view of the river, ideal for corporate events and medium-sized gatherings.",
    capacity: "300 people",
    capacityRange: "medium" as const,
    area: "8,000 sq ft",
    price: "₹50,000 per day",
    image: "/urban-skyline-gathering.png",
    address: "45 Riverside Road, Ahmedabad, Gujarat 380054",
    contactPhone: "+91 87654 32109",
    contactEmail: "info@riversidebanquet.com",
    eventTypes: ["Corporate Event", "Conference", "Seminar", "Product Launch"],
    amenities: ["Parking", "Air Conditioning", "WiFi", "Projector", "Podium", "Microphones"],
    venueRules: [
      {
        title: "Booking Hours",
        description: "Venue is available from 8 AM to 11 PM only.",
      },
      {
        title: "Payment Terms",
        description: "50% advance payment required for booking confirmation.",
      },
    ],
    providedItems: [
      {
        category: "Furniture",
        items: [
          {
            name: "Chairs",
            quantity: 300,
            description: "Executive chairs",
          },
          {
            name: "Tables",
            quantity: 30,
            description: "Conference tables",
          },
        ],
      },
      {
        category: "Technology",
        items: [
          {
            name: "Projectors",
            quantity: 3,
            description: "4K projectors",
          },
          {
            name: "Microphones",
            quantity: 10,
            description: "Wireless microphones",
          },
        ],
      },
    ],
    contactInfo: {
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      email: "priya@riversidebanquet.com",
    },
    images: ["/urban-skyline-gathering.png"],
  },
]

export default function PartyPlotsPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [venues, setVenues] = useState<Venue[]>(initialVenues)

  // Handler for adding a new venue
  const handleAddVenue = (newVenue: Venue) => {
    setVenues((prev) => [...prev, { ...newVenue, id: `venue${prev.length + 1}` }])
    setAddDialogOpen(false)
  }

  // Handler for updating a venue
  const handleUpdateVenue = (updatedVenue: Venue) => {
    setVenues((prev) => prev.map((venue) => (venue.id === updatedVenue.id ? updatedVenue : venue)))
  }

  // Handler for deleting a venue
  const handleDeleteVenue = (venueId: string) => {
    setVenues((prev) => prev.filter((venue) => venue.id !== venueId))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Party Plots</h1>
          <p className="text-muted-foreground">Manage party plots and venues</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Party Plot
        </Button>
      </div>

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
          />
        )}
      </VenueActionsProvider>

      <AddVenueDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onAddVenue={handleAddVenue} />
    </div>
  )
}
