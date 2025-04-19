"use client"

import type React from "react"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createContext } from "react"

// Helper function to validate date strings
const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// Helper function to format dates from various formats
const formatDateValue = (dateValue: any): string => {
  if (!dateValue) return ""

  // Handle Firestore Timestamp objects
  if (typeof dateValue === "object" && dateValue !== null && "seconds" in dateValue) {
    return new Date(dateValue.seconds * 1000).toLocaleDateString()
  }

  // Handle ISO strings or other date formats
  try {
    return new Date(dateValue).toLocaleDateString()
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}

export interface Address {
  homeNo?: string
  address1?: string
  address2?: string
  landmark?: string
  area?: string
  postOffice?: string
  city?: string
  taluka?: string
  district?: string
  pincode?: string
}

export interface Member {
  id: string
  name: string
  email: string
  avatar?: string
  joinDate?: string | any // Updated to handle Firestore Timestamp
  role?: string
  status?: "active" | "inactive" | "pending"
  membership_no?: string
  mobile?: string
  phoneNo?: string
  dateOfBirth?: string | any // Updated to handle Firestore Timestamp
  remarks?: string
  postal_address?: Address
  residential_address?: Address
}

// Create a context for member actions
interface MemberActionsContextType {
  onEdit?: (id: string, data: Partial<Member>) => Promise<boolean>
  onDelete?: (id: string) => Promise<boolean>
}

const MemberActionsContext = createContext<MemberActionsContextType>({})

export function MemberActionsProvider({
  children,
  onEdit,
  onDelete,
}: {
  children: React.ReactNode
  onEdit?: (id: string, data: Partial<Member>) => Promise<boolean>
  onDelete?: (id: string) => Promise<boolean>
}) {
  return <MemberActionsContext.Provider value={{ onEdit, onDelete }}>{children}</MemberActionsContext.Provider>
}

export const memberColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const member = row.original
      const initials = member.name
        ? member.name
            .split(" ")
            .map((n) => n[0])
            .join("")
        : "?"

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{member.name}</div>
            <div className="text-sm text-muted-foreground">{member.email}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "membership_no",
    header: "Membership No.",
    cell: ({ row }) => {
      const membershipNo = row.getValue("membership_no") as string
      return <div>{membershipNo || <span className="text-muted-foreground">Not assigned</span>}</div>
    },
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
    cell: ({ row }) => {
      const mobile = row.getValue("mobile") as string
      return <div>{mobile || <span className="text-muted-foreground">Not provided</span>}</div>
    },
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ row }) => {
      const joinDate = row.getValue("joinDate")
      if (!joinDate) return <span className="text-muted-foreground">Not set</span>

      // Format the date using our helper function
      const formattedDate = formatDateValue(joinDate)
      return <div>{formattedDate || <span className="text-muted-foreground">Invalid date</span>}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      if (!status) return <span className="text-muted-foreground">Not set</span>

      return (
        <Badge variant={status === "active" ? "default" : status === "inactive" ? "secondary" : "outline"}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original

      const handleView = () => {
        // Dispatch a custom event with the member data
        const event = new CustomEvent("viewMember", { detail: member })
        window.dispatchEvent(event)
      }

      const handleEdit = () => {
        // Dispatch a custom event with the member data
        const event = new CustomEvent("editMember", { detail: member })
        window.dispatchEvent(event)
      }

      const handleDelete = () => {
        // Dispatch a custom event with the member data
        const event = new CustomEvent("deleteMember", { detail: member })
        window.dispatchEvent(event)
      }

      return (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={handleView}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleEdit}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
