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
import { ViewNewsEventDialog } from "@/components/admin/view-news-event-dialog"
import { EditNewsEventDialog } from "@/components/admin/edit-news-event-dialog"

export type NewsEvent = {
  id: string
  title: string
  type: "news" | "event"
  category: string
  location: string
  publishDate: string
  eventDate?: string
  author: string
  status: "published" | "draft" | "archived"
  shortDescription?: string
  fullDescription?: string
  media?: Array<{
    id: string
    type: "image" | "video"
    url: string
    thumbnail?: string
  }>
}

interface NewsEventActionsProviderProps {
  children:
    | React.ReactNode
    | ((actions: {
        openViewDialog: (newsEvent: NewsEvent) => void
        openEditDialog: (newsEvent: NewsEvent) => void
        handleDeleteNewsEvent: (newsEvent: NewsEvent) => void
      }) => React.ReactNode)
  onDelete?: (id: string) => Promise<boolean>
  onUpdate?: (updatedNewsEvent: NewsEvent) => Promise<boolean>
}

export const NewsEventActionsProvider = ({ children, onDelete, onUpdate }: NewsEventActionsProviderProps) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedNewsEvent, setSelectedNewsEvent] = useState<NewsEvent | null>(null)
  const { handleDelete } = useActions()

  const openViewDialog = (newsEvent: NewsEvent) => {
    setSelectedNewsEvent(newsEvent)
    setViewDialogOpen(true)
  }

  const openEditDialog = (newsEvent: NewsEvent) => {
    setSelectedNewsEvent(newsEvent)
    setEditDialogOpen(true)
  }

  const handleDeleteNewsEvent = (newsEvent: NewsEvent) => {
    handleDelete(newsEvent.id, newsEvent.title, "News/Event", async () => {
      // Call the onDelete callback if provided
      if (onDelete) {
        await onDelete(newsEvent.id)
      }
    })
  }

  const handleUpdateNewsEvent = async (updatedNewsEvent: NewsEvent): Promise<boolean> => {
    if (onUpdate) {
      return await onUpdate(updatedNewsEvent)
    }
    return false
  }

  return (
    <>
      {typeof children === "function" ? children({ openViewDialog, openEditDialog, handleDeleteNewsEvent }) : children}

      {selectedNewsEvent && (
        <>
          <ViewNewsEventDialog newsEvent={selectedNewsEvent} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
          <EditNewsEventDialog
            newsEvent={selectedNewsEvent}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdateNewsEvent={handleUpdateNewsEvent}
          />
        </>
      )}
    </>
  )
}

export function createNewsEventColumns(actions: {
  openViewDialog: (newsEvent: NewsEvent) => void
  openEditDialog: (newsEvent: NewsEvent) => void
  handleDeleteNewsEvent: (newsEvent: NewsEvent) => void
}): ColumnDef<NewsEvent>[] {
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
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <Badge variant={type === "news" ? "default" : "secondary"}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "publishDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Publish Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div>{row.getValue("publishDate")}</div>
      },
    },
    {
      accessorKey: "eventDate",
      header: "Event Date",
      cell: ({ row }) => {
        return <div>{row.getValue("eventDate") || "-"}</div>
      },
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => <div>{row.getValue("author")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "published" ? "success" : status === "draft" ? "outline" : "destructive"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const newsEvent = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => actions.openViewDialog(newsEvent)}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={() => actions.openEditDialog(newsEvent)}>
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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(newsEvent.id)}>Copy ID</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => actions.openViewDialog(newsEvent)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View details</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.openEditDialog(newsEvent)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => actions.handleDeleteNewsEvent(newsEvent)}>
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
