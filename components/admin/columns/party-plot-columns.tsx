"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { createContext, type ReactNode } from "react"

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

interface PartyPlotActionsContextType {
  openViewDialog: (partyPlot: PartyPlot) => void
  openEditDialog: (partyPlot: PartyPlot) => void
  handleDeletePartyPlot: (partyPlot: PartyPlot) => void
}

const PartyPlotActionsContext = createContext<PartyPlotActionsContextType | undefined>(undefined)

interface PartyPlotActionsProviderProps {
  children: (context: PartyPlotActionsContextType) => ReactNode
  onDelete?: (partyPlot: PartyPlot) => void
  onUpdate?: (updatedPartyPlot: PartyPlot) => void
}

export function PartyPlotActionsProvider({ children, onDelete, onUpdate }: PartyPlotActionsProviderProps): ReactNode {
  const openViewDialog = (partyPlot: PartyPlot) => {
    console.log("View party plot:", partyPlot)
  }

  const openEditDialog = (partyPlot: PartyPlot) => {
    console.log("Edit party plot:", partyPlot)
  }

  const handleDeletePartyPlot = (partyPlot: PartyPlot) => {
    console.log("Delete party plot:", partyPlot)
  }

  const contextValue: PartyPlotActionsContextType = {
    openViewDialog,
    openEditDialog,
    handleDeletePartyPlot,
  }

  return (
    <PartyPlotActionsContext.Provider value={contextValue}>{children(contextValue)}</PartyPlotActionsContext.Provider>
  )
}

export function createPartyPlotColumns(actions: PartyPlotActionsContextType): ColumnDef<PartyPlot>[] {
  return [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
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
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => actions.handleDeletePartyPlot(partyPlot)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )
      },
    },
  ]
}
