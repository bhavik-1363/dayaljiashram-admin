"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Calendar, User, Clock } from "lucide-react"
import type { NewsEvent } from "@/components/admin/columns/news-event-columns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ViewNewsEventDialogProps {
  newsEvent: NewsEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewNewsEventDialog({ newsEvent, open, onOpenChange }: ViewNewsEventDialogProps) {
  if (!newsEvent) return null

  const publishDate = new Date(newsEvent.publishDate)
  const eventDate = newsEvent.eventDate ? new Date(newsEvent.eventDate) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant={newsEvent.type === "news" ? "default" : "secondary"}>
              {newsEvent.type.charAt(0).toUpperCase() + newsEvent.type.slice(1)}
            </Badge>
            <Badge variant="outline">{newsEvent.category}</Badge>
            <Badge
              variant={
                newsEvent.status === "published" ? "success" : newsEvent.status === "draft" ? "outline" : "destructive"
              }
            >
              {newsEvent.status.charAt(0).toUpperCase() + newsEvent.status.slice(1)}
            </Badge>
          </div>
          <DialogTitle className="text-2xl mt-2">{newsEvent.title}</DialogTitle>
          <DialogDescription className="flex flex-col gap-2 mt-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="mr-1 h-4 w-4" />
              <span>{newsEvent.author}</span>
              <span className="mx-2">•</span>
              <Calendar className="mr-1 h-4 w-4" />
              <span>Published: {format(publishDate, "MMM d, yyyy")}</span>
              {eventDate && (
                <>
                  <span className="mx-2">•</span>
                  <Clock className="mr-1 h-4 w-4" />
                  <span>Event date: {format(eventDate, "MMM d, yyyy")}</span>
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Short Description</h3>
              <p className="text-sm text-muted-foreground">
                {newsEvent.shortDescription || "No short description available."}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Full Description</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="text-sm">
                  {newsEvent.fullDescription ||
                    "This is sample content for the news/event. It would be loaded from the database in a real application."}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="media" className="pt-4">
            {newsEvent.media && newsEvent.media.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {newsEvent.media.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted">
                      {item.type === "image" ? (
                        <img
                          src={item.url || "/breaking-news-desk.png"}
                          alt=""
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <video src={item.url} className="max-h-full max-w-full" controls />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No media files available for this {newsEvent.type}.</p>
                <p className="text-sm mt-1">Media files would be displayed here if available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
