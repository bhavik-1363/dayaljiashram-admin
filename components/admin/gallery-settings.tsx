"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, X, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export function GallerySettings({ open, onOpenChange, categories, onUpdateCategories }) {
  const [newCategory, setNewCategory] = useState("")
  const [expandedCategories, setExpandedCategories] = useState({})
  const [subCategoryInputs, setSubCategoryInputs] = useState({})
  const [localCategories, setLocalCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize local categories when dialog opens or categories prop changes
  useEffect(() => {
    if (open && categories) {
      // Deep clone the categories to avoid reference issues
      const clonedCategories = JSON.parse(JSON.stringify(categories))
      setLocalCategories(clonedCategories)

      // Initialize expanded state
      const expanded = {}
      clonedCategories.forEach((category) => {
        expanded[category.id] = true
      })
      setExpandedCategories(expanded)
    }
  }, [open, categories])

  // Handle dialog open change
  const handleOpenChange = (newOpen) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
    }
  }

  // Toggle category expanded state
  const toggleCategoryExpanded = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Add new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return

    const newCategoryObj = {
      id: `temp-${Date.now()}`, // Temporary ID until saved to Firebase
      name: newCategory,
      subCategories: [],
    }

    setLocalCategories((prev) => [...prev, newCategoryObj])
    setNewCategory("")
    setExpandedCategories((prev) => ({
      ...prev,
      [newCategoryObj.id]: true,
    }))
  }

  // Delete category
  const handleDeleteCategory = (categoryId) => {
    setLocalCategories((prev) => prev.filter((category) => category.id !== categoryId))
  }

  // Handle sub-category input change
  const handleSubCategoryInputChange = (categoryId, value) => {
    setSubCategoryInputs((prev) => ({
      ...prev,
      [categoryId]: value,
    }))
  }

  // Add new sub-category
  const handleAddSubCategory = (categoryId) => {
    const subCategoryValue = subCategoryInputs[categoryId]
    if (!subCategoryValue || !subCategoryValue.trim()) return

    setLocalCategories((prev) =>
      prev.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            subCategories: [
              ...category.subCategories,
              {
                id: `temp-${Date.now()}`, // Temporary ID until saved to Firebase
                name: subCategoryValue,
              },
            ],
          }
        }
        return category
      }),
    )

    // Clear the input for this category
    setSubCategoryInputs((prev) => ({
      ...prev,
      [categoryId]: "",
    }))
  }

  // Delete sub-category
  const handleDeleteSubCategory = (categoryId, subCategoryId) => {
    setLocalCategories((prev) =>
      prev.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            subCategories: category.subCategories.filter((subCategory) => subCategory.id !== subCategoryId),
          }
        }
        return category
      }),
    )
  }

  // Save changes
  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      await onUpdateCategories(localCategories)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving gallery categories:", error)
      toast({
        title: "Error",
        description: "Failed to update gallery categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gallery Settings</DialogTitle>
        </DialogHeader>

        <div className="flex items-end gap-2 mb-4">
          <div className="flex-1">
            <Label htmlFor="new-category">Add New Category</Label>
            <Input
              id="new-category"
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <Button onClick={handleAddCategory} size="sm" className="gap-1" disabled={isSubmitting}>
            <PlusCircle className="h-4 w-4" />
            Add
          </Button>
        </div>

        <ScrollArea className="flex-1 pr-4">
          {localCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories yet. Add your first category above.
            </div>
          ) : (
            <div className="space-y-4">
              {localCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">{category.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleCategoryExpanded(category.id)}
                          disabled={isSubmitting}
                        >
                          {expandedCategories[category.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedCategories[category.id] && (
                    <CardContent className="pt-0 pb-3 px-4">
                      <div className="space-y-3">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`sub-category-${category.id}`}>Add Sub-Category</Label>
                            <Input
                              id={`sub-category-${category.id}`}
                              placeholder="Enter sub-category name"
                              value={subCategoryInputs[category.id] || ""}
                              onChange={(e) => handleSubCategoryInputChange(category.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  handleAddSubCategory(category.id)
                                }
                              }}
                              disabled={isSubmitting}
                            />
                          </div>
                          <Button
                            onClick={() => handleAddSubCategory(category.id)}
                            size="sm"
                            className="gap-1"
                            disabled={isSubmitting}
                          >
                            <PlusCircle className="h-4 w-4" />
                            Add
                          </Button>
                        </div>

                        <div className="pt-2">
                          <Label className="text-sm text-muted-foreground mb-2 block">Sub-Categories</Label>
                          {category.subCategories.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No sub-categories yet</div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {category.subCategories.map((subCategory) => (
                                <Badge
                                  key={subCategory.id}
                                  variant="secondary"
                                  className="flex items-center gap-1 py-1 px-2"
                                >
                                  {subCategory.name}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteSubCategory(category.id, subCategory.id)}
                                    disabled={isSubmitting}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
