"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditMatrimonialProfileDialog } from "@/components/admin/edit-matrimonial-profile-dialog"
import { MatrimonialProfileDialog } from "@/components/admin/matrimonial-profile-dialog"
import { useActions } from "@/components/admin/action-provider"

export interface MatrimonialProfile {
  id: string
  name: string
  age: number
  gender: string
  location: string
  profession: string
  education: string
  about: string
  verified: boolean
  hasUploadedPdf: boolean
  height?: number
  income?: number
  religion?: string
  diet?: string
  maritalStatus?: string
  motherTongue?: string
  status: string
  createdAt: string
  email?: string
  phone?: string
  alternatePhone?: string
  hobbies?: string[]
  familyType?: string
  fatherName?: string
  motherName?: string
  familyStatus?: string
  fatherOccupation?: string
  motherOccupation?: string
  siblings?: string
  familyInfo?: string
  partnerInfo?: string
  imageUrl?: string
  deleted?: boolean // Add this for type safety
}

interface MatrimonialProfileDialogContextProps {
  openViewDialog: (profile: MatrimonialProfile) => void
  openEditDialog: (profile: MatrimonialProfile) => void
  handleDeleteProfile: (id: string, name?: string) => void
}

const MatrimonialProfileDialogContext = createContext<MatrimonialProfileDialogContextProps | undefined>(undefined)

interface MatrimonialProfileDialogProviderProps {
  children: (context: MatrimonialProfileDialogContextProps) => ReactNode
  onUpdateProfile?: (profile: MatrimonialProfile) => void
}

export function MatrimonialProfileDialogProvider({ children, onUpdateProfile }: MatrimonialProfileDialogProviderProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<MatrimonialProfile | null>(null)
  const { confirmAction } = useActions()

  const openViewDialog = (profile: MatrimonialProfile) => {
    setSelectedProfile(profile)
    setViewDialogOpen(true)
  }

  const openEditDialog = (profile: MatrimonialProfile) => {
    setSelectedProfile(profile)
    setEditDialogOpen(true)
  }

  const handleDeleteProfile = (id: string, name?: string) => {
    const profileName = name || selectedProfile?.name || "this profile"
    confirmAction({
      title: "Delete Profile",
      description: `Are you sure you want to delete ${profileName}? This action cannot be undone.`,
      action: () => {
        console.log("Deleting profile:", id)
        // Call the onUpdateProfile callback if provided
        if (onUpdateProfile) {
          // Mark the profile as deleted
          const deletedProfile: MatrimonialProfile = {
            id,
            deleted: true,
            // Add required fields to satisfy TypeScript
            name: profileName,
            age: 0,
            gender: "",
            location: "",
            profession: "",
            education: "",
            about: "",
            verified: false,
            hasUploadedPdf: false,
            status: "",
            createdAt: "",
          }
          onUpdateProfile(deletedProfile)
        }
      },
    })
  }

  const handleUpdateProfile = (profile: MatrimonialProfile) => {
    if (onUpdateProfile) {
      onUpdateProfile(profile)
    }
  }

  return (
    <MatrimonialProfileDialogContext.Provider
      value={{
        openViewDialog,
        openEditDialog,
        handleDeleteProfile,
      }}
    >
      {children({
        openViewDialog,
        openEditDialog,
        handleDeleteProfile,
      })}
      {selectedProfile && (
        <>
          <MatrimonialProfileDialog profile={selectedProfile} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
          <EditMatrimonialProfileDialog
            profile={selectedProfile}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdateProfile={handleUpdateProfile}
          />
        </>
      )}
    </MatrimonialProfileDialogContext.Provider>
  )
}

export function useMatrimonialProfileDialog() {
  const context = useContext(MatrimonialProfileDialogContext)
  if (context === undefined) {
    throw new Error("useMatrimonialProfileDialog must be used within a MatrimonialProfileDialogProvider")
  }
  return context
}

interface MatrimonialColumnsProps {
  openViewDialog: (profile: MatrimonialProfile) => void
  openEditDialog: (profile: MatrimonialProfile) => void
  handleDeleteProfile: (id: string, name?: string) => void
}

export function createMatrimonialColumns({
  openViewDialog,
  openEditDialog,
  handleDeleteProfile,
}: MatrimonialColumnsProps): ColumnDef<MatrimonialProfile>[] {
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
      header: "Name",
      cell: ({ row }) => {
        const profile = row.original
        // Add null checks to handle undefined values
        const displayName = profile?.name || "Unknown"
        const initials = displayName && displayName.length > 0 ? displayName.substring(0, 2).toUpperCase() : "??"

        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={profile?.imageUrl || `/placeholder.svg?height=32&width=32&query=${displayName}`}
                alt={displayName}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{displayName}</div>
              <div className="text-sm text-muted-foreground">{profile?.email || "No email"}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "age",
      header: "Age",
      cell: ({ row }) => {
        const age = row.getValue("age")
        return <div>{age || "N/A"}</div>
      },
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string
        return <div className="capitalize">{gender || "Unknown"}</div>
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const location = row.getValue("location") as string
        return <div>{location || "Unknown"}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "active" ? "default" : status === "featured" ? "secondary" : "outline"}>
            {status || "Unknown"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "verified",
      header: "Verified",
      cell: ({ row }) => {
        const verified = row.getValue("verified") as boolean
        return verified ? <Badge variant="success">Verified</Badge> : <Badge variant="outline">Unverified</Badge>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string
        return <div>{createdAt || "Unknown"}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const profile = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openViewDialog(profile)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditDialog(profile)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteProfile(profile.id, profile.name)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
