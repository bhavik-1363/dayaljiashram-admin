"use client"

import { useState } from "react"
import { DataTable } from "@/components/admin/data-table"
import { facilityColumns } from "@/components/admin/columns/facility-columns"
import { facilityData } from "@/lib/placeholder-data"
import { PageHeader } from "@/components/admin/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddFacilityDialog } from "@/components/admin/add-facility-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function FacilitiesPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedFacilityType, setSelectedFacilityType] = useState<string | undefined>(undefined)

  // All facilities
  const allFacilities = facilityData

  const handleAddFacility = (type?: string) => {
    setSelectedFacilityType(type)
    setAddDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Facilities" description="Manage community facilities" />

      <div className="flex justify-end">
        <Button onClick={() => handleAddFacility()}>
          <Plus className="mr-2 h-4 w-4" /> Add Facility
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Facilities</TabsTrigger>
          <TabsTrigger value="hostels">Hostels</TabsTrigger>
          <TabsTrigger value="book-bank">Book Bank</TabsTrigger>
          <TabsTrigger value="gym">Gym</TabsTrigger>
          <TabsTrigger value="astrology">Astrology</TabsTrigger>
          <TabsTrigger value="party-plots">Party Plots</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DataTable columns={facilityColumns} data={allFacilities} />
        </TabsContent>

        <TabsContent value="hostels">
          <DataTable columns={facilityColumns} data={allFacilities.filter((facility) => facility.type === "hostels")} />
        </TabsContent>

        <TabsContent value="book-bank">
          <DataTable
            columns={facilityColumns}
            data={allFacilities.filter((facility) => facility.type === "book-bank")}
          />
        </TabsContent>

        <TabsContent value="gym">
          <DataTable columns={facilityColumns} data={allFacilities.filter((facility) => facility.type === "gym")} />
        </TabsContent>

        <TabsContent value="astrology">
          <DataTable
            columns={facilityColumns}
            data={allFacilities.filter((facility) => facility.type === "astrology")}
          />
        </TabsContent>

        <TabsContent value="party-plots">
          <DataTable
            columns={facilityColumns}
            data={allFacilities.filter((facility) => facility.type === "party-plots")}
          />
        </TabsContent>
      </Tabs>

      <AddFacilityDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        facilityType={selectedFacilityType}
        onSuccess={() => {
          // In a real app, you would refresh the data here
        }}
      />
    </div>
  )
}
