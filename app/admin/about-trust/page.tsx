"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { getAboutTrustContent, updateAboutTrustContent } from "@/lib/firebase/services/about-trust-service"
import { Skeleton } from "@/components/ui/skeleton"

const aboutTrustFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  mission: z.string().min(10, {
    message: "Mission statement must be at least 10 characters.",
  }),
  vision: z.string().min(10, {
    message: "Vision statement must be at least 10 characters.",
  }),
  history: z.string().min(10, {
    message: "History must be at least 10 characters.",
  }),
  values: z.string().min(10, {
    message: "Values must be at least 10 characters.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  contactAddress: z.string().min(10, {
    message: "Address must be at least 10 characters.",
  }),
})

type AboutTrustFormValues = z.infer<typeof aboutTrustFormSchema>

// Default values as fallback
const defaultValues: Partial<AboutTrustFormValues> = {
  title: "Community Trust Foundation",
  mission:
    "To foster a sense of unity and cooperation among community members, promoting social, cultural, and educational development.",
  vision:
    "To create a vibrant, inclusive community where every member has the opportunity to thrive and contribute to the collective well-being.",
  history:
    "Founded in 1985 by a group of visionary community leaders, our trust has grown from a small local initiative to a comprehensive community organization. Over the decades, we have established various facilities, programs, and services to meet the evolving needs of our community members.",
  values: "Integrity, Inclusivity, Transparency, Service, Excellence, Respect for all, Community-first approach",
  contactEmail: "info@communitytrust.org",
  contactPhone: "+91 98765 43210",
  contactAddress: "123 Community Center, Main Street, City - 380001, State, India",
}

export default function AboutTrustPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AboutTrustFormValues>({
    resolver: zodResolver(aboutTrustFormSchema),
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    const fetchAboutTrustData = async () => {
      try {
        setIsLoading(true)
        const aboutTrustData = await getAboutTrustContent()

        if (aboutTrustData) {
          // Transform the data to match our form structure
          const formData = {
            title: aboutTrustData.title || defaultValues.title,
            mission: aboutTrustData.mission || defaultValues.mission,
            vision: aboutTrustData.vision || defaultValues.vision,
            history: aboutTrustData.history || defaultValues.history,
            values: Array.isArray(aboutTrustData.values)
              ? aboutTrustData.values.join(", ")
              : aboutTrustData.values || defaultValues.values,
            contactEmail: aboutTrustData.contactInfo?.email || defaultValues.contactEmail,
            contactPhone: aboutTrustData.contactInfo?.phone || defaultValues.contactPhone,
            contactAddress: aboutTrustData.contactInfo?.address || defaultValues.contactAddress,
          }

          reset(formData)
        }
      } catch (error) {
        console.error("Error fetching about trust data:", error)
        toast({
          title: "Error",
          description: "Failed to load trust information. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAboutTrustData()
  }, [reset])

  async function onSubmit(data: AboutTrustFormValues) {
    setIsSubmitting(true)

    try {
      // Transform form data to match the Firebase structure
      const aboutTrustData = {
        title: data.title,
        mission: data.mission,
        vision: data.vision,
        history: data.history,
        values: data.values.split(",").map((value) => value.trim()),
        contactInfo: {
          email: data.contactEmail,
          phone: data.contactPhone,
          address: data.contactAddress,
        },
      }

      await updateAboutTrustContent(aboutTrustData)

      toast({
        title: "About Trust information updated",
        description: "The trust information has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating about trust data:", error)
      toast({
        title: "Error",
        description: "Failed to update trust information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <AboutTrustSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">About Trust</h1>
        <Button type="submit" form="about-trust-form" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex border-b">
          <button
            type="button"
            className={`px-4 py-2 ${
              activeTab === "content" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("content")}
          >
            Content
          </button>
          <button
            type="button"
            className={`px-4 py-2 ${
              activeTab === "contact" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("contact")}
          >
            Contact Information
          </button>
        </div>

        <form id="about-trust-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {activeTab === "content" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trust Information</CardTitle>
                  <CardDescription>
                    Update the information about your trust that will be displayed on the website.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Trust Name
                    </label>
                    <Input id="title" placeholder="Enter trust name" {...register("title")} />
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="mission" className="text-sm font-medium">
                      Mission
                    </label>
                    <Textarea
                      id="mission"
                      placeholder="Enter mission statement"
                      className="min-h-[100px]"
                      {...register("mission")}
                    />
                    <p className="text-sm text-muted-foreground">Describe the mission and purpose of your trust.</p>
                    {errors.mission && <p className="text-sm text-destructive">{errors.mission.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="vision" className="text-sm font-medium">
                      Vision
                    </label>
                    <Textarea
                      id="vision"
                      placeholder="Enter vision statement"
                      className="min-h-[100px]"
                      {...register("vision")}
                    />
                    <p className="text-sm text-muted-foreground">Describe the long-term vision for your trust.</p>
                    {errors.vision && <p className="text-sm text-destructive">{errors.vision.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="history" className="text-sm font-medium">
                      History
                    </label>
                    <Textarea
                      id="history"
                      placeholder="Enter trust history"
                      className="min-h-[150px]"
                      {...register("history")}
                    />
                    <p className="text-sm text-muted-foreground">
                      Provide a brief history of your trust and its development over time.
                    </p>
                    {errors.history && <p className="text-sm text-destructive">{errors.history.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="values" className="text-sm font-medium">
                      Core Values
                    </label>
                    <Textarea
                      id="values"
                      placeholder="Enter core values"
                      className="min-h-[100px]"
                      {...register("values")}
                    />
                    <p className="text-sm text-muted-foreground">
                      List the core values that guide your trust's activities (comma-separated).
                    </p>
                    {errors.values && <p className="text-sm text-destructive">{errors.values.message}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Update the contact information for your trust.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="contactEmail" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input id="contactEmail" placeholder="Enter email address" {...register("contactEmail")} />
                    {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contactPhone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input id="contactPhone" placeholder="Enter phone number" {...register("contactPhone")} />
                    {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contactAddress" className="text-sm font-medium">
                      Address
                    </label>
                    <Textarea
                      id="contactAddress"
                      placeholder="Enter address"
                      className="min-h-[100px]"
                      {...register("contactAddress")}
                    />
                    {errors.contactAddress && (
                      <p className="text-sm text-destructive">{errors.contactAddress.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

function AboutTrustSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-4">
        <div className="flex border-b">
          <Skeleton className="h-10 w-24 mx-2" />
          <Skeleton className="h-10 w-24 mx-2" />
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
