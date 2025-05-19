"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, FileText, Star } from "lucide-react"
import type { MatrimonialProfile } from "@/components/admin/columns/matrimonial-columns"

interface MatrimonialProfileDialogProps {
  profile: MatrimonialProfile
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MatrimonialProfileDialog({ profile, open, onOpenChange }: MatrimonialProfileDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Handle multiple images
  const images = profile.images || (profile.imageUrl ? [profile.imageUrl] : [])

  // Reset the current image index when the profile changes or dialog opens
  useEffect(() => {
    if (open) {
      setCurrentImageIndex(0)
    }
  }, [profile.id, open])

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }
  }

  const openPdf = () => {
    if (profile.bioDataLink) {
      window.open(profile.bioDataLink, "_blank")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Matrimonial Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 mb-4">
          {/* Image Gallery */}
          <div className="relative w-full max-w-[300px] h-[300px] mx-auto">
            {images.length > 0 ? (
              <>
                <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
                  <img
                    src={images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${profile.name} - Photo ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    key={`${profile.id}-image-${currentImageIndex}`}
                  />
                  {profile.defaultImageIndex === currentImageIndex && (
                    <div className="absolute top-2 right-2">
                      <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-primary" : "bg-muted"}`}
                          onClick={() => setCurrentImageIndex(index)}
                          aria-label={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full rounded-lg border border-border flex items-center justify-center bg-muted">
                <Avatar className="h-32 w-32">
                  <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge
                variant={
                  profile.status === "active" ? "default" : profile.status === "featured" ? "secondary" : "outline"
                }
              >
                {profile.status}
              </Badge>
              {profile.verified && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Verified
                </Badge>
              )}
            </div>

            {/* PDF Viewer Button */}
            {profile.bioDataLink && (
              <Button variant="outline" className="mt-3 gap-2" onClick={openPdf}>
                <FileText className="h-4 w-4" />
                View Bio-Data PDF
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Age</h3>
                    <p>{profile.age} years</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                    <p className="capitalize">{profile.gender}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <p>{profile.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Profession</h3>
                    <p>{profile.profession}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Education</h3>
                    <p>{profile.education}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">About</h3>
                  <p className="whitespace-pre-wrap">{profile.about}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p>{profile.email || "Not provided"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                  <p>{profile.phone || "Not provided"}</p>
                </div>

                {profile.alternatePhone && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Alternate Phone</h3>
                    <p>{profile.alternatePhone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Height</h3>
                    <p>{profile.height ? `${profile.height} cm` : "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Annual Income</h3>
                    <p>{profile.income ? `$${profile.income.toLocaleString()}` : "Not provided"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Religion</h3>
                    <p>{profile.religion || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Diet</h3>
                    <p>{profile.diet || "Not provided"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Marital Status</h3>
                    <p>{profile.maritalStatus || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Mother Tongue</h3>
                    <p>{profile.motherTongue || "Not provided"}</p>
                  </div>
                </div>

                {profile.hobbies && profile.hobbies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Hobbies & Interests</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.hobbies.map((hobby, index) => (
                        <Badge key={index} variant="outline">
                          {hobby}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Family Type</h3>
                    <p>{profile.familyType || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Family Status</h3>
                    <p>{profile.familyStatus || "Not provided"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Father's Name</h3>
                    <p>{profile.fatherName || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Mother's Name</h3>
                    <p>{profile.motherName || "Not provided"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Father's Occupation</h3>
                    <p>{profile.fatherOccupation || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Mother's Occupation</h3>
                    <p>{profile.motherOccupation || "Not provided"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Siblings</h3>
                  <p>{profile.siblings || "Not provided"}</p>
                </div>

                {profile.familyInfo && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Family Information</h3>
                    <p className="whitespace-pre-wrap">{profile.familyInfo}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {profile.partnerInfo ? (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Partner Preferences</h3>
                    <p className="whitespace-pre-wrap">{profile.partnerInfo}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No partner preferences specified.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
