"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Clock } from "lucide-react"

interface ViewFacilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  facility: {
    id: string
    name: string
    type: string
    description: string
    location?: string
    capacity?: number
    openingHours?: string
    images: string[]
    [key: string]: any
  }
}

export function ViewFacilityDialog({ open, onOpenChange, facility }: ViewFacilityDialogProps) {
  const facilityTypeLabels: Record<string, string> = {
    hostels: "Hostel",
    "book-bank": "Book Bank",
    gym: "Gym",
    astrology: "Astrology",
    "party-plots": "Party Plot",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">{facility.name}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{facilityTypeLabels[facility.type] || facility.type}</Badge>
          </div>
        </DialogHeader>

        {facility.images && facility.images.length > 0 && (
          <div className="relative w-full h-[300px] overflow-hidden">
            <img
              src={facility.images[0] || "/placeholder.svg"}
              alt={facility.name}
              className="w-full h-full object-cover"
            />
            {facility.images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                {facility.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="w-12 h-12 rounded border-2 border-white overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${facility.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {facility.images.length > 4 && (
                  <div className="w-12 h-12 rounded border-2 border-white bg-black/50 flex items-center justify-center text-white">
                    +{facility.images.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <ScrollArea className="p-6 pt-4 max-h-[400px]">
          <div className="space-y-6">
            {facility.location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p className="text-muted-foreground">{facility.location}</p>
                </div>
              </div>
            )}

            {facility.capacity && (
              <div className="flex items-start gap-2">
                <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Capacity</h4>
                  <p className="text-muted-foreground">{facility.capacity} people</p>
                </div>
              </div>
            )}

            {facility.openingHours && (
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Opening Hours</h4>
                  <p className="text-muted-foreground">{facility.openingHours}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground whitespace-pre-line">{facility.description}</p>
            </div>

            {facility.amenities && facility.amenities.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {facility.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
