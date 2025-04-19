"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/admin/page-header"
import { CommitteeManagement } from "@/components/admin/committee-management"
import { TrusteesManagement } from "@/components/admin/trustees-management"
import { PastMembersManagement } from "@/components/admin/past-members-management"
import { useState } from "react"

export default function CommitteePage() {
  const [activeTab, setActiveTab] = useState("committee")

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader title="Committee Management" description="Manage committee members, trustees, and past leadership" />

      <Tabs defaultValue="committee" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="committee">Committee</TabsTrigger>
          <TabsTrigger value="trustees">Trustees</TabsTrigger>
          <TabsTrigger value="past-members">Past Members</TabsTrigger>
        </TabsList>

        <TabsContent value="committee" className="space-y-4">
          <CommitteeManagement />
        </TabsContent>

        <TabsContent value="trustees" className="space-y-4">
          <TrusteesManagement />
        </TabsContent>

        <TabsContent value="past-members" className="space-y-4">
          <PastMembersManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
