"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CommitteeMember } from "@/components/admin/columns/committee-columns"
import { Mail, Phone, Calendar, User, Briefcase } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ViewCommitteeMemberDialogProps {
  member: CommitteeMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewCommitteeMemberDialog({ member, open, onOpenChange }: ViewCommitteeMemberDialogProps) {
  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Committee Member Details</DialogTitle>
          <DialogDescription>Member ID: {member.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={member.photoUrl || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-lg font-medium">{member.position}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge variant={member.status === "active" ? "success" : "secondary"}>{member.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Term: {member.termStart} to {member.termEnd}
              </p>
            </div>
          </div>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Contact Details</TabsTrigger>
              <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <Card>
                <CardContent className="p-4 space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{member.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Position</p>
                        <p>{member.position}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="capitalize">{member.status}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Term Start</p>
                        <p>{member.termStart}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Term End</p>
                        <p>{member.termEnd}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="responsibilities" className="space-y-4 pt-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Responsibilities and achievements of this committee member.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium">Key Responsibilities</h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Oversee community activities and programs</li>
                        <li>• Represent the community in official functions</li>
                        <li>• Coordinate with other committee members</li>
                        <li>• Manage budget allocation for community events</li>
                      </ul>
                    </div>

                    <div className="pt-4">
                      <h4 className="text-sm font-medium">Achievements</h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Successfully organized annual community events</li>
                        <li>• Improved community engagement by 30%</li>
                        <li>• Established new partnerships with local organizations</li>
                        <li>• Implemented cost-saving measures for community operations</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>Edit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
