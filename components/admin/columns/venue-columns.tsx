"use client";

import type React from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useActions } from "@/components/admin/action-provider";
import { useState } from "react";
import { ViewVenueDialog } from "@/components/admin/view-venue-dialog";
import { EditVenueDialog } from "@/components/admin/edit-venue-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Venue = {
  id: string;
  name: string;
  description: string;
  capacity: string;
  capacityRange: "small" | "medium" | "large";
  area: string;
  price: string;
  image?: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  eventTypes: string[];
  amenities: string[];
  images?: string[];
  venueRules: {
    title: string;
    description: string;
  }[];
  providedItems: {
    category: string;
    items: {
      name: string;
      quantity: number;
      description: string;
    }[];
  }[];
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  media?: Array<{
    id: string;
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }>;
};

interface VenueActionsProviderProps {
  children:
    | React.ReactNode
    | ((actions: {
        openViewDialog: (venue: Venue) => void;
        openEditDialog: (venue: Venue) => void;
        handleDeleteVenue: (venue: Venue) => void;
      }) => React.ReactNode);
  onUpdate?: (venue: Venue) => void;
  onDelete?: (venueId: string) => void;
}

export const VenueActionsProvider = ({
  children,
  onUpdate,
  onDelete
}: VenueActionsProviderProps) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const { confirmAction } = useActions();

  const openViewDialog = (venue: Venue) => {
    setSelectedVenue(venue);
    setViewDialogOpen(true);
  };

  const openEditDialog = (venue: Venue) => {
    setSelectedVenue(venue);
    setEditDialogOpen(true);
  };

  const handleDeleteVenue = (venue: Venue) => {
    confirmAction({
      title: "Delete Venue",
      description: `Are you sure you want to delete ${venue.name}? This action cannot be undone.`,
      action: () => {
        console.log("Deleting profile:", venue.id);
        if (onDelete) {
          onDelete(venue.id);
        }
      }
    });
  };

  const handleUpdateVenue = (updatedVenue: Venue) => {
    if (onUpdate) {
      onUpdate(updatedVenue);
    }
  };

  return (
    <>
      {typeof children === "function"
        ? children({ openViewDialog, openEditDialog, handleDeleteVenue })
        : children}

      {selectedVenue && (
        <>
          <ViewVenueDialog
            venue={selectedVenue}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
          <EditVenueDialog
            venue={selectedVenue}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdateVenue={handleUpdateVenue}
          />
        </>
      )}
    </>
  );
};

export function createVenueColumns(actions: {
  openViewDialog: (venue: Venue) => void;
  openEditDialog: (venue: Venue) => void;
  handleDeleteVenue: (venue: Venue) => void;
}): ColumnDef<Venue>[] {
  return [
    {
      accessorKey: "media",
      header: "Media",
      cell: ({ row }) => {
        const media = row.original.media;
        if (!media || media.length === 0) {
          return (
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {row.getValue("name").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          );
        }

        const firstMedia = media[0];
        return (
          <Avatar className="h-10 w-10">
            {firstMedia.type === "image" ? (
              <AvatarImage
                src={firstMedia.url || "/placeholder.svg"}
                alt={row.getValue("name")}
              />
            ) : (
              <AvatarImage src="/digital-stream.png" alt="Video thumbnail" />
            )}
            <AvatarFallback>
              {row.getValue("name").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
      }
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Venue Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => <div>{row.getValue("capacity")}</div>
    },
    {
      accessorKey: "area",
      header: "Area",
      cell: ({ row }) => <div>{row.getValue("area")}</div>
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <div>{row.getValue("price")}</div>
    },
    {
      accessorKey: "eventTypes",
      header: "Event Types",
      cell: ({ row }) => {
        const eventTypes = (row.getValue("eventTypes") as string[]) || [];
        return (
          <div className="flex flex-wrap gap-1">
            {eventTypes && eventTypes.length > 0 ? (
              <>
                {eventTypes.slice(0, 2).map((type) => (
                  <Badge key={type} variant="outline" className="capitalize">
                    {type}
                  </Badge>
                ))}
                {eventTypes.length > 2 && (
                  <Badge variant="outline">+{eventTypes.length - 2}</Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground text-sm">None</span>
            )}
          </div>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const venue = row.original;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => actions.openViewDialog(venue)}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => actions.openEditDialog(venue)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => actions.handleDeleteVenue(venue)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      }
    }
  ];
}

// For backward compatibility
export const venueColumns: ColumnDef<Venue>[] = createVenueColumns({
  openViewDialog: () => {},
  openEditDialog: () => {},
  handleDeleteVenue: () => {}
});
