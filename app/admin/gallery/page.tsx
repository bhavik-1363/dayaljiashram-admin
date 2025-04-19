"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/data-table"
import { galleryColumns } from "@/components/admin/columns/gallery-columns"
import { GallerySettings } from "@/components/admin/gallery-settings"
import { AddGalleryItemDialog } from "@/components/admin/add-gallery-item-dialog"
import { Plus, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  getGalleryItems,
  getGalleryCategories,
  updateAllGalleryCategories,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "@/lib/firebase/services/gallery-service"

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  // Fetch gallery items and categories
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [itemsData, categoriesData] = await Promise.all([getGalleryItems(), getGalleryCategories()])
      setGalleryItems(itemsData)
      setCategories(categoriesData)
    } catch (err) {
      console.error("Error fetching gallery data:", err)
      setError(err.message || "Failed to load gallery data")
      toast({
        title: "Error",
        description: "Failed to load gallery data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddItem = async (newItem) => {
    try {
      const id = await addGalleryItem(newItem)
      const addedItem = { ...newItem, id }
      setGalleryItems((prev) => [addedItem, ...prev])
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Gallery item added successfully",
      })
    } catch (err) {
      console.error("Error adding gallery item:", err)
      toast({
        title: "Error",
        description: "Failed to add gallery item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditItem = async (updatedItem) => {
    try {
      await updateGalleryItem(updatedItem.id, updatedItem)
      setGalleryItems((prev) => prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)))
      toast({
        title: "Success",
        description: "Gallery item updated successfully",
      })
    } catch (err) {
      console.error("Error updating gallery item:", err)
      toast({
        title: "Error",
        description: "Failed to update gallery item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id) => {
    try {
      await deleteGalleryItem(id)
      setGalleryItems((prev) => prev.filter((item) => item.id !== id))
      toast({
        title: "Success",
        description: "Gallery item deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting gallery item:", err)
      toast({
        title: "Error",
        description: "Failed to delete gallery item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCategories = async (updatedCategories) => {
    try {
      const result = await updateAllGalleryCategories(updatedCategories)
      setCategories(result)
      toast({
        title: "Success",
        description: "Gallery categories updated successfully",
      })
      return true
    } catch (err) {
      console.error("Error updating gallery categories:", err)
      toast({
        title: "Error",
        description: "Failed to update gallery categories. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button onClick={fetchData}>Try Again</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gallery Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Gallery Settings
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <DataTable
        columns={galleryColumns({
          onEdit: handleEditItem,
          onDelete: handleDeleteItem,
          categories: categories,
        })}
        data={galleryItems}
      />

      <AddGalleryItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddItem}
        categories={categories}
      />

      <GallerySettings
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
      />
    </div>
  )
}
