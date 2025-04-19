"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MatrimonialProfile } from "@/components/admin/columns/matrimonial-columns"

interface MatrimonialProfileDialogProps {
  profile: MatrimonialProfile
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MatrimonialProfileDialog({ profile, open, onOpenChange }: MatrimonialProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Matrimonial Profile</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.imageUrl || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  profile.status === "active" ? "default" : profile.status === "featured" ? "secondary" : "outline"
                }
              >
                {profile.status}
              </Badge>
              {profile.verified && <Badge variant="success">Verified</Badge>}
            </div>
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
