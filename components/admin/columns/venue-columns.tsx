"use client"

import type React from "react"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash } from "lucide-react"
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
import { useActions } from "@/components/admin/action-provider"
import { useState } from "react"
import { ViewVenueDialog } from "@/components/admin/view-venue-dialog"
import { EditVenueDialog } from "@/components/admin/edit-venue-dialog"

export type Venue = {
  id: string
  name: string
  description: string
  capacity: string
  capacityRange: "small" | "medium" | "large"
  area: string
  price: string
  image?: string
  address: string
  contactPhone: string
  contactEmail: string
  eventTypes: string[]
  amenities: string[]
  images?: string[]
  venueRules: {
    title: string
    description: string
  }[]
  providedItems: {
    category: string
    items: {
      name: string
      quantity: number
      description: string
    }[]
  }[]
  contactInfo: {
    name: string
    phone: string
    email: string
  }
}

interface VenueActionsProviderProps {
  children:
    | React.ReactNode
    | ((actions: {
        openViewDialog: (venue: Venue) => void
        openEditDialog: (venue: Venue) => void
        handleDeleteVenue: (venue: Venue) => void
      }) => React.ReactNode)
  onUpdate?: (venue: Venue) => void
  onDelete?: (venueId: string) => void
}

export const VenueActionsProvider = ({ children, onUpdate, onDelete }: VenueActionsProviderProps) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const { handleDelete } = useActions()

  const openViewDialog = (venue: Venue) => {
    setSelectedVenue(venue)
    setViewDialogOpen(true)
  }

  const openEditDialog = (venue: Venue) => {
    setSelectedVenue(venue)
    setEditDialogOpen(true)
  }

  const handleDeleteVenue = (venue: Venue) => {
    handleDelete(venue.id, venue.name, "Venue", () => {
      if (onDelete) {
        onDelete(venue.id)
      }
    })
  }

  const handleUpdateVenue = (updatedVenue: Venue) => {
    if (onUpdate) {
      onUpdate(updatedVenue)
    }
  }

  return (
    <>
      {typeof children === "function" ? children({ openViewDialog, openEditDialog, handleDeleteVenue }) : children}

      {selectedVenue && (
        <>
          <ViewVenueDialog venue={selectedVenue} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
          <EditVenueDialog
            venue={selectedVenue}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdateVenue={handleUpdateVenue}
          />
        </>
      )}
    </>
  )
}

export function createVenueColumns(actions: {
  openViewDialog: (venue: Venue) => void
  openEditDialog: (venue: Venue) => void
  handleDeleteVenue: (venue: Venue) => void
}): ColumnDef<Venue>[] {
  return [
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Venue Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => <div>{row.getValue("capacity")}</div>,
    },
    {
      accessorKey: "area",
      header: "Area",
      cell: ({ row }) => <div>{row.getValue("area")}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <div>{row.getValue("price")}</div>,
    },
    {
      accessorKey: "eventTypes",
      header: "Event Types",
      cell: ({ row }) => {
        const eventTypes = (row.getValue("eventTypes") as string[]) || []
        return (
          <div className="flex flex-wrap gap-1">
            {eventTypes && eventTypes.length > 0 ? (
              <>
                {eventTypes.slice(0, 2).map((type) => (
                  <Badge key={type} variant="outline" className="capitalize">
                    {type}
                  </Badge>
                ))}
                {eventTypes.length > 2 && <Badge variant="outline">+{eventTypes.length - 2}</Badge>}
              </>
            ) : (
              <span className="text-muted-foreground text-sm">None</span>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const venue = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => actions.openViewDialog(venue)}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={() => actions.openEditDialog(venue)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(venue.id)}>Copy ID</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => actions.openViewDialog(venue)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View details</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.openEditDialog(venue)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => actions.handleDeleteVenue(venue)}>
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

// For backward compatibility
export const venueColumns: ColumnDef<Venue>[] = createVenueColumns({
  openViewDialog: () => {},
  openEditDialog: () => {},
  handleDeleteVenue: () => {},
})
