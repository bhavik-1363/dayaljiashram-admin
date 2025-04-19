"use client"

import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ViewGalleryItemDialog } from "@/components/admin/view-gallery-item-dialog"
import { EditGalleryItemDialog } from "@/components/admin/edit-gallery-item-dialog"
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"

export type GalleryItem = {
  id: string
  title: string
  description: string
  category: string
  subCategory?: string
  tags: string[]
  date: string
  media: {
    url: string
    type: "image" | "video"
    path?: string
  }[]
  createdAt?: Date
  updatedAt?: Date
}

export const galleryColumns = ({
  onEdit,
  onDelete,
  categories = [],
}: {
  onEdit: (item: GalleryItem) => void
  onDelete: (id: string) => void
  categories?: any[]
}): ColumnDef<GalleryItem>[] => {
  const ActionCell = ({ row }) => {
    const item = row.original
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

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
            <DropdownMenuItem onClick={() => setIsViewOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsDeleteOpen(true)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ViewGalleryItemDialog open={isViewOpen} onOpenChange={setIsViewOpen} item={item} />

        {isEditOpen && (
          <EditGalleryItemDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            item={item}
            categories={categories}
            onSave={(updatedItem) => {
              onEdit(updatedItem)
              setIsEditOpen(false)
            }}
          />
        )}

        <DeleteConfirmationDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={() => {
            onDelete(item.id)
            setIsDeleteOpen(false)
          }}
          itemName={item.title}
          itemType="gallery item"
        />
      </>
    )
  }

  return [
    {
      accessorKey: "media",
      header: "Media",
      cell: ({ row }) => {
        const media = row.original.media
        if (!media || media.length === 0) {
          return <div className="text-muted-foreground">No media</div>
        }

        const firstMedia = media[0]
        return (
          <Avatar className="h-10 w-10">
            {firstMedia.type === "image" ? (
              <AvatarImage src={firstMedia.url || "/placeholder.svg"} alt={row.original.title} />
            ) : (
              <AvatarImage src="/digital-stream.png" alt="Video thumbnail" />
            )}
            <AvatarFallback>{row.original.title.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )
      },
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
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category
        return typeof category === "object" ? category.name : category
      },
    },
    {
      accessorKey: "subCategory",
      header: "Sub-category",
      cell: ({ row }) => {
        const subCategory = row.original.subCategory
        return subCategory ? (typeof subCategory === "object" ? subCategory.name : subCategory) : null
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags
        if (!tags || tags.length === 0) {
          return <div className="text-muted-foreground">No tags</div>
        }

        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="outline">
                {typeof tag === "object" ? tag.name : tag}
              </Badge>
            ))}
            {tags.length > 2 && <Badge variant="outline">+{tags.length - 2}</Badge>}
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        try {
          return format(new Date(row.original.date), "MMM d, yyyy")
        } catch (error) {
          return row.original.date || "N/A"
        }
      },
    },
    {
      id: "actions",
      cell: ActionCell,
    },
  ]
}
