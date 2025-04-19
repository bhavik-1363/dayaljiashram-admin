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
import { ViewPartyPlotDialog } from "@/components/admin/view-party-plot-dialog"
import { EditPartyPlotDialog } from "@/components/admin/edit-party-plot-dialog"

export type PartyPlot = {
  id: string
  plotName: string
  bookedBy: string
  email: string
  contactNumber: string
  eventType: string
  bookingDate?: string
  eventDate: string
  timeSlot: string
  numberOfGuests: number
  additionalMessage?: string
  amount: number
  status: "confirmed" | "pending" | "cancelled"
}

export const PartyPlotActionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedPartyPlot, setSelectedPartyPlot] = useState<PartyPlot | null>(null)
  const { handleDelete } = useActions()

  const openViewDialog = (partyPlot: PartyPlot) => {
    setSelectedPartyPlot(partyPlot)
    setViewDialogOpen(true)
  }

  const openEditDialog = (partyPlot: PartyPlot) => {
    setSelectedPartyPlot(partyPlot)
    setEditDialogOpen(true)
  }

  const handleDeletePartyPlot = (partyPlot: PartyPlot) => {
    handleDelete(partyPlot.id, partyPlot.plotName, "Party Plot")
  }

  return (
    <>
      {typeof children === "function" ? children({ openViewDialog, openEditDialog, handleDeletePartyPlot }) : children}

      {selectedPartyPlot && (
        <>
          <ViewPartyPlotDialog partyPlot={selectedPartyPlot} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
          <EditPartyPlotDialog partyPlot={selectedPartyPlot} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
        </>
      )}
    </>
  )
}

export function createPartyPlotColumns(actions: {
  openViewDialog: (partyPlot: PartyPlot) => void
  openEditDialog: (partyPlot: PartyPlot) => void
  handleDeletePartyPlot: (partyPlot: PartyPlot) => void
}): ColumnDef<PartyPlot>[] {
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
      accessorKey: "plotName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Plot Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("plotName")}</div>,
    },
    {
      accessorKey: "bookedBy",
      header: "Booked By",
      cell: ({ row }) => <div>{row.getValue("bookedBy")}</div>,
    },
    {
      accessorKey: "eventType",
      header: "Event Type",
      cell: ({ row }) => <div>{row.getValue("eventType")}</div>,
    },
    {
      accessorKey: "eventDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Event Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("eventDate")}</div>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => <div>₹{row.getValue("amount")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "confirmed" ? "success" : status === "cancelled" ? "destructive" : "outline"}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const partyPlot = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => actions.openViewDialog(partyPlot)}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={() => actions.openEditDialog(partyPlot)}>
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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(partyPlot.id)}>Copy ID</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => actions.openViewDialog(partyPlot)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View details</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.openEditDialog(partyPlot)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => actions.handleDeletePartyPlot(partyPlot)}>
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
