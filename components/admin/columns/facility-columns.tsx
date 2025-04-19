"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Edit, Trash, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ViewFacilityDialog } from "@/components/admin/view-facility-dialog"
import { EditFacilityDialog } from "@/components/admin/edit-facility-dialog"
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog"

export type Facility = {
  id: string
  name: string
  description: string
  availability?: "available" | "maintenance" | "booked"
  imageUrl: string
  location: string
  capacity: string
  status: "active" | "inactive"
  type: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  openingHours?: string
  additionalInfo?: string
  images?: string[]
}

export const facilityColumns: ColumnDef<Facility>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => (
      <div className="h-12 w-12 overflow-hidden rounded-md">
        <img
          src={row.getValue("imageUrl") || "/placeholder.svg"}
          alt={row.getValue("name")}
          className="h-full w-full object-cover"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant="outline" className="capitalize">
          {type.replace("-", " ")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <div>{row.getValue("location")}</div>,
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => <div>{row.getValue("capacity")}</div>,
  },
  {
    accessorKey: "availability",
    header: "Availability",
    cell: ({ row }) => {
      const availability = row.getValue("availability") as string
      return availability ? (
        <Badge
          variant={availability === "available" ? "success" : availability === "maintenance" ? "outline" : "secondary"}
        >
          {availability}
        </Badge>
      ) : null
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <Badge variant={status === "active" ? "success" : "destructive"}>{status}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const facility = row.original
      const [viewOpen, setViewOpen] = useState(false)
      const [editOpen, setEditOpen] = useState(false)
      const [deleteOpen, setDeleteOpen] = useState(false)

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(facility.id)}>Copy ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setViewOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem>{facility.status === "active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewFacilityDialog open={viewOpen} onOpenChange={setViewOpen} facility={facility} />

          <EditFacilityDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            facility={facility}
            onSuccess={() => {
              // In a real app, you would refresh the data here
            }}
          />

          <DeleteConfirmationDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete Facility"
            description="Are you sure you want to delete this facility? This action cannot be undone."
            onConfirm={() => {
              // In a real app, you would delete the facility here
              console.log("Deleting facility:", facility.id)
              setDeleteOpen(false)
            }}
          />
        </>
      )
    },
  },
]
