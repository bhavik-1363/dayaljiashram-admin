"use client"

import type React from "react"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useActions } from "@/components/admin/action-provider"
import { useState } from "react"
import { ViewCommitteeMemberDialog } from "@/components/admin/view-committee-member-dialog"
import { EditCommitteeMemberDialog } from "@/components/admin/edit-committee-member-dialog"

export type CommitteeMember = {
  id: string
  name: string
  position: string
  photoUrl: string
  email: string
  phone: string
  termStart: string
  termEnd: string
  status: "active" | "former"
}

export const CommitteeActionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(null)
  const { handleDelete } = useActions()

  const openViewDialog = (member: CommitteeMember) => {
    setSelectedMember(member)
    setViewDialogOpen(true)
  }

  const openEditDialog = (member: CommitteeMember) => {
    setSelectedMember(member)
    setEditDialogOpen(true)
  }

  const handleDeleteMember = (member: CommitteeMember) => {
    handleDelete(member.id, member.name, "Committee Member")
  }

  return (
    <>
      {typeof children === "function" ? children({ openViewDialog, openEditDialog, handleDeleteMember }) : children}

      {selectedMember && (
        <>
          <ViewCommitteeMemberDialog member={selectedMember} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
          <EditCommitteeMemberDialog member={selectedMember} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
        </>
      )}
    </>
  )
}

export function createCommitteeColumns(actions: {
  openViewDialog: (member: CommitteeMember) => void
  openEditDialog: (member: CommitteeMember) => void
  handleDeleteMember: (member: CommitteeMember) => void
}): ColumnDef<CommitteeMember>[] {
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
      accessorKey: "photoUrl",
      header: "Photo",
      cell: ({ row }) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={row.getValue("photoUrl") || "/placeholder.svg"} alt={row.getValue("name")} />
          <AvatarFallback>{(row.getValue("name") as string).substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
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
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => <div>{row.getValue("position")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "termStart",
      header: "Term Start",
      cell: ({ row }) => <div>{row.getValue("termStart")}</div>,
    },
    {
      accessorKey: "termEnd",
      header: "Term End",
      cell: ({ row }) => <div>{row.getValue("termEnd")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return <Badge variant={status === "active" ? "success" : "secondary"}>{status}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => actions.openViewDialog(member)}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={() => actions.openEditDialog(member)}>
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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(member.id)}>Copy ID</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => actions.openViewDialog(member)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View details</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.openEditDialog(member)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem>{member.status === "active" ? "Mark as Former" : "Mark as Active"}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => actions.handleDeleteMember(member)}>
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
export const committeeColumns: ColumnDef<CommitteeMember>[] = createCommitteeColumns({
  openViewDialog: () => {},
  openEditDialog: () => {},
  handleDeleteMember: () => {},
})
