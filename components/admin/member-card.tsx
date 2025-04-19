"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Image from "next/image"

interface Field {
  label: string
  value: string | string[]
  type?: string
}

interface MemberCardProps {
  member: any // Replace with your Member type
  onEdit: () => void
  onDelete: () => void
  fields: Field[]
}

export function MemberCard({ member, onEdit, onDelete, fields = [] }: MemberCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative w-full h-48 bg-muted">
          {member.image ? (
            <Image
              src={member.image || "/placeholder.svg"}
              alt={member.name}
              fill
              className="object-cover"
              onError={(e) => {
                // Replace with fallback on error
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg"
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2">{member.name}</h3>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={index}>
              <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
              {field.type === "list" && Array.isArray(field.value) ? (
                <ul className="list-disc pl-5 text-sm">
                  {field.value.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">{field.value}</p>
              )}
            </div>
          ))}

          {member.bio && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bio</p>
              <p className="text-sm">{member.bio}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 p-4 pt-0">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
