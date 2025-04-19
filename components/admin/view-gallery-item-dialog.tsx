"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Tag, Layers, FileVideo } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"

export function ViewGalleryItemDialog({ open, onOpenChange, item }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  // Reset media index when dialog opens or item changes
  useEffect(() => {
    if (open) {
      setCurrentMediaIndex(0)
    }
  }, [open, item])

  if (!item) return null

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : item.media.length - 1))
  }

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev < item.media.length - 1 ? prev + 1 : 0))
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Ensure we're handling category and subCategory properly
  const categoryName = typeof item.category === "object" ? item.category.name : item.category
  const subCategoryName = typeof item.subCategory === "object" ? item.subCategory.name : item.subCategory

  // Ensure media is always an array
  const media = Array.isArray(item.media) ? item.media : []
  const currentMedia = media.length > 0 ? media[currentMediaIndex] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <DialogTitle className="text-xl">{item.title}</DialogTitle>
        </DialogHeader>

        {/* All content in ScrollArea */}
        <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Media section inside scroll area */}
            {currentMedia && (
              <div className="relative bg-muted/30 rounded-md overflow-hidden">
                {currentMedia.type === "image" ? (
                  <div className="w-full aspect-video flex items-center justify-center">
                    <img
                      src={currentMedia.url || "/placeholder.svg"}
                      alt={`${item.title} - image ${currentMediaIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center bg-muted">
                    <FileVideo className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}

                {media.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevMedia}
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextMedia}
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {media.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 w-1.5 rounded-full ${index === currentMediaIndex ? "bg-primary" : "bg-muted"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {media.length > 1 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Media Gallery</h3>
                <div className="grid grid-cols-5 gap-2">
                  {media.map((media, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                        index === currentMediaIndex ? "border-primary" : "border-transparent"
                      }`}
                      onClick={() => setCurrentMediaIndex(index)}
                    >
                      {media.type === "video" ? (
                        <div className="bg-muted w-full h-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-foreground"
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      ) : (
                        <img
                          src={media.url || "/placeholder.svg"}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Date</span>
                  </div>
                  <p>{formatDate(item.date)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span>Category</span>
                  </div>
                  <p>
                    {categoryName}
                    {subCategoryName && <span className="text-muted-foreground"> / {subCategoryName}</span>}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{item.description || "No description provided."}</p>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {typeof tag === "object" ? tag.name : tag}
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
