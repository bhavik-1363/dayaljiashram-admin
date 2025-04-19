"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { Venue } from "@/components/admin/columns/venue-columns"

interface ViewVenueDialogProps {
  venue: Venue
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewVenueDialog({ venue, open, onOpenChange }: ViewVenueDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{venue.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="amenities">Amenities & Rules</TabsTrigger>
            <TabsTrigger value="items">Provided Items</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="details" className="space-y-6 p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                      <p className="mt-1">{venue.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Capacity</h4>
                        <p className="mt-1">{venue.capacity}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Area</h4>
                        <p className="mt-1">{venue.area}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                        <p className="mt-1">{venue.price}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Size Category</h4>
                        <p className="mt-1 capitalize">{venue.capacityRange}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Location & Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                      <p className="mt-1">{venue.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Contact Phone</h4>
                        <p className="mt-1">{venue.contactPhone}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Contact Email</h4>
                        <p className="mt-1">{venue.contactEmail}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Contact Person</h4>
                      <div className="mt-1">
                        <p>
                          <strong>Name:</strong> {venue.contactInfo.name}
                        </p>
                        <p>
                          <strong>Phone:</strong> {venue.contactInfo.phone}
                        </p>
                        <p>
                          <strong>Email:</strong> {venue.contactInfo.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Event Types</CardTitle>
                    <CardDescription>Types of events this venue is suitable for</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {venue.eventTypes && venue.eventTypes.length > 0 ? (
                        venue.eventTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="capitalize">
                            {type}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No event types specified</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-6 p-1">
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                  <CardDescription>Features and facilities available at this venue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities && venue.amenities.length > 0 ? (
                      venue.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline" className="capitalize">
                          {amenity}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No amenities specified</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Venue Rules</CardTitle>
                  <CardDescription>Guidelines and policies for using this venue</CardDescription>
                </CardHeader>
                <CardContent>
                  {venue.venueRules && venue.venueRules.length > 0 ? (
                    <div className="space-y-4">
                      {venue.venueRules.map((rule, index) => (
                        <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                          <h4 className="font-medium">{rule.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No rules specified</span>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="space-y-6 p-1">
              {venue.providedItems && venue.providedItems.length > 0 ? (
                venue.providedItems.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{item.name}</h4>
                              <span className="text-sm bg-muted px-2 py-1 rounded-md">Qty: {item.quantity}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <span className="text-muted-foreground">No provided items specified</span>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="gallery" className="p-1">
              <Card>
                <CardHeader>
                  <CardTitle>Venue Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  {venue.images && venue.images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {venue.images.map((image, index) => (
                        <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${venue.name} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-md overflow-hidden border">
                      <Image
                        src={venue.image || "/placeholder.svg?height=400&width=600&query=party venue"}
                        alt={venue.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
