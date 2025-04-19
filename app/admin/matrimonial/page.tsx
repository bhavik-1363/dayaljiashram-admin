"use client"

import { DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { AddMatrimonialProfileDialog } from "@/components/admin/add-matrimonial-profile-dialog"
import {
  MatrimonialProfileDialogProvider,
  createMatrimonialColumns,
  type MatrimonialProfile,
} from "@/components/admin/columns/matrimonial-columns"
import { ActionProvider } from "@/components/admin/action-provider"
import { useToast } from "@/components/ui/use-toast"
import {
  getMatrimonialProfiles,
  addMatrimonialProfile,
  updateMatrimonialProfile,
  deleteMatrimonialProfile,
} from "@/lib/firebase/services/matrimonial-service"

export default function MatrimonialPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [data, setData] = useState<MatrimonialProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch matrimonial profiles on component mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true)
        const profiles = await getMatrimonialProfiles()
        setData(profiles)
      } catch (error) {
        console.error("Error fetching matrimonial profiles:", error)
        toast({
          title: "Error",
          description: "Failed to load matrimonial profiles. Please try again.",
          variant: "destructive",
        })
        // Use mock data as fallback
        setData(initialData)
      } finally {
        setIsLoading(false)
      }
    }

    // Check if we should use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      // Use the initial mock data
      setData(initialData)
      setIsLoading(false)
    } else {
      fetchProfiles()
    }
  }, [toast])

  const handleAddProfile = async (profile: Omit<MatrimonialProfile, "id">) => {
    try {
      if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
        // Mock adding a profile with a random ID
        const newProfile = {
          ...profile,
          id: Math.random().toString(36).substring(2, 11),
        } as MatrimonialProfile
        setData([...data, newProfile])
        return
      }

      // Add the profile to Firebase
      const id = await addMatrimonialProfile(profile)

      // Add the new profile to the local state with the returned ID
      const newProfile = {
        ...profile,
        id,
      } as MatrimonialProfile

      setData([...data, newProfile])

      toast({
        title: "Profile added",
        description: "The matrimonial profile has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding matrimonial profile:", error)
      toast({
        title: "Error",
        description: "Failed to add matrimonial profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProfile = async (updatedProfile: MatrimonialProfile) => {
    try {
      // Check if this is a delete operation (special case with deleted flag)
      if ("deleted" in updatedProfile && updatedProfile.deleted) {
        if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
          // Mock deleting a profile
          setData(data.filter((profile) => profile.id !== updatedProfile.id))
          return
        }

        // Delete the profile from Firebase
        await deleteMatrimonialProfile(updatedProfile.id)

        // Remove the profile from the data array
        setData(data.filter((profile) => profile.id !== updatedProfile.id))

        toast({
          title: "Profile deleted",
          description: "The matrimonial profile has been deleted successfully.",
        })
      } else {
        if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
          // Mock updating a profile
          setData(data.map((profile) => (profile.id === updatedProfile.id ? updatedProfile : profile)))
          return
        }

        // Update the profile in Firebase
        await updateMatrimonialProfile(updatedProfile.id, updatedProfile)

        // Update the profile in the data array
        setData(data.map((profile) => (profile.id === updatedProfile.id ? updatedProfile : profile)))

        toast({
          title: "Profile updated",
          description: "The matrimonial profile has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Error updating matrimonial profile:", error)
      toast({
        title: "Error",
        description: "Failed to update matrimonial profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <ActionProvider>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Matrimonial Profiles"
            description="Manage matrimonial profiles, view details, and update information."
          />
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Profile
            </Button>
          </div>
        </div>

        <MatrimonialProfileDialogProvider onUpdateProfile={handleUpdateProfile}>
          {({ openViewDialog, openEditDialog, handleDeleteProfile }) => (
            <DataTable
              columns={createMatrimonialColumns({
                openViewDialog,
                openEditDialog,
                handleDeleteProfile,
              })}
              data={data}
              searchField="name"
              filterableColumns={[
                {
                  id: "status",
                  title: "Status",
                  options: [
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                    { label: "Featured", value: "featured" },
                  ],
                },
                {
                  id: "gender",
                  title: "Gender",
                  options: [
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Other", value: "other" },
                  ],
                },
              ]}
              isLoading={isLoading}
            />
          )}
        </MatrimonialProfileDialogProvider>

        <AddMatrimonialProfileDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAddProfile={handleAddProfile}
        />
      </div>
    </ActionProvider>
  )
}

// Sample data for mock mode
const initialData = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 28,
    gender: "female",
    location: "New York, USA",
    profession: "Software Engineer",
    education: "Master's in Computer Science",
    about: "Passionate about technology and travel. Looking for someone with similar interests and values.",
    verified: true,
    hasUploadedPdf: true,
    height: 165,
    income: 95000,
    religion: "Hindu",
    diet: "Vegetarian",
    maritalStatus: "Never Married",
    motherTongue: "Hindi",
    status: "active",
    createdAt: "2023-05-15",
    email: "priya.sharma@example.com",
  },
  {
    id: "2",
    name: "Rahul Patel",
    age: 32,
    gender: "male",
    location: "San Francisco, USA",
    profession: "Doctor",
    education: "MD from Stanford",
    about: "Love hiking, reading, and trying new cuisines. Seeking a like-minded partner.",
    verified: true,
    hasUploadedPdf: true,
    height: 180,
    income: 150000,
    religion: "Hindu",
    diet: "Non-Vegetarian",
    maritalStatus: "Never Married",
    motherTongue: "Gujarati",
    status: "featured",
    createdAt: "2023-04-20",
    email: "rahul.patel@example.com",
  },
  {
    id: "3",
    name: "Ananya Desai",
    age: 26,
    gender: "female",
    location: "Chicago, USA",
    profession: "Financial Analyst",
    education: "MBA in Finance",
    about: "Enjoy music, dancing, and exploring new places. Looking for someone who shares my passion for life.",
    verified: false,
    hasUploadedPdf: false,
    height: 160,
    income: 85000,
    religion: "Jain",
    diet: "Vegetarian",
    maritalStatus: "Never Married",
    motherTongue: "Gujarati",
    status: "active",
    createdAt: "2023-06-05",
    email: "ananya.desai@example.com",
  },
  {
    id: "4",
    name: "Vikram Singh",
    age: 30,
    gender: "male",
    location: "Boston, USA",
    profession: "Architect",
    education: "Bachelor's in Architecture",
    about: "Creative mind with a love for design and art. Seeking a partner who appreciates the beauty in details.",
    verified: true,
    hasUploadedPdf: false,
    height: 183,
    income: 90000,
    religion: "Sikh",
    diet: "Vegetarian",
    maritalStatus: "Never Married",
    motherTongue: "Punjabi",
    status: "active",
    createdAt: "2023-05-28",
    email: "vikram.singh@example.com",
  },
  {
    id: "5",
    name: "Meera Kapoor",
    age: 27,
    gender: "female",
    location: "Seattle, USA",
    profession: "Marketing Manager",
    education: "Bachelor's in Marketing",
    about: "Outgoing and adventurous. Love traveling and experiencing different cultures.",
    verified: true,
    hasUploadedPdf: true,
    height: 163,
    income: 80000,
    religion: "Hindu",
    diet: "Non-Vegetarian",
    maritalStatus: "Never Married",
    motherTongue: "Hindi",
    status: "active",
    createdAt: "2023-06-12",
    email: "meera.kapoor@example.com",
  },
]
