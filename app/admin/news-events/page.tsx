"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/data-table"
import {
  createNewsEventColumns,
  NewsEventActionsProvider,
  type NewsEvent,
} from "@/components/admin/columns/news-event-columns"
import { AddNewsEventDialog } from "@/components/admin/add-news-event-dialog"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  getNewsEvents,
  addNewsEvent,
  updateNewsEvent,
  deleteNewsEvent,
} from "@/lib/firebase/services/news-events-service"
import { Skeleton } from "@/components/ui/skeleton"

export default function NewsEventsPage() {
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch news events from Firebase
  useEffect(() => {
    const fetchNewsEvents = async () => {
      try {
        setIsLoading(true)
        const data = await getNewsEvents()
        setNewsEvents(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching news events:", err)
        setError("Failed to load news events. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load news events. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNewsEvents()
  }, [toast])

  const handleAddNewsEvent = async (newNewsEvent: Omit<NewsEvent, "id">) => {
    try {
      // Add the news event to Firebase
      const newId = await addNewsEvent(newNewsEvent)

      // Add the new news event to the local state
      const newsEventWithId: NewsEvent = {
        ...newNewsEvent,
        id: newId,
      }

      setNewsEvents((prev) => [...prev, newsEventWithId])

      toast({
        title: `${newNewsEvent.type === "news" ? "News" : "Event"} added successfully`,
        description: `${newNewsEvent.title} has been added.`,
      })

      return true
    } catch (err) {
      console.error("Error adding news event:", err)
      toast({
        title: "Error",
        description: "Failed to add news event. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const handleUpdateNewsEvent = async (updatedNewsEvent: NewsEvent) => {
    try {
      // Update the news event in Firebase
      await updateNewsEvent(updatedNewsEvent.id, updatedNewsEvent)

      // Update the news event in the local state
      setNewsEvents((prev) => prev.map((item) => (item.id === updatedNewsEvent.id ? updatedNewsEvent : item)))

      toast({
        title: `${updatedNewsEvent.type === "news" ? "News" : "Event"} updated successfully`,
        description: `${updatedNewsEvent.title} has been updated.`,
      })

      return true
    } catch (err) {
      console.error("Error updating news event:", err)
      toast({
        title: "Error",
        description: "Failed to update news event. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const handleDeleteNewsEvent = async (id: string) => {
    try {
      // Delete the news event from Firebase
      await deleteNewsEvent(id)

      // Remove the news event from the local state
      setNewsEvents((prev) => prev.filter((item) => item.id !== id))

      toast({
        title: "Deleted successfully",
        description: "The news/event has been deleted.",
      })

      return true
    } catch (err) {
      console.error("Error deleting news event:", err)
      toast({
        title: "Error",
        description: "Failed to delete news event. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">News & Events</h1>
            <p className="text-muted-foreground">Manage community news and events</p>
          </div>
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">News & Events</h1>
            <p className="text-muted-foreground">Manage community news and events</p>
          </div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
        <div className="rounded-md bg-destructive/15 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">Error loading news and events</h3>
              <div className="mt-2 text-sm text-destructive/80">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News & Events</h1>
          <p className="text-muted-foreground">Manage community news and events</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add News/Event
        </Button>
      </div>

      <NewsEventActionsProvider onDelete={handleDeleteNewsEvent} onUpdate={handleUpdateNewsEvent}>
        {(actions) => <DataTable columns={createNewsEventColumns(actions)} data={newsEvents} />}
      </NewsEventActionsProvider>

      <AddNewsEventDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onAddNewsEvent={handleAddNewsEvent} />
    </div>
  )
}
