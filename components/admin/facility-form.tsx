"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FacilityImageUpload } from "./facility-image-upload"

const facilityFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  type: z.string({
    required_error: "Please select a facility type.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  capacity: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  openingHours: z.string().optional(),
  status: z.enum(["active", "inactive"], {
    required_error: "Please select a status.",
  }),
  images: z.array(z.string()).min(1, {
    message: "At least one image is required.",
  }),
  additionalInfo: z.string().optional(),
})

export type FacilityFormValues = z.infer<typeof facilityFormSchema>

interface FacilityFormProps {
  defaultValues?: Partial<FacilityFormValues>
  onSubmit: (values: FacilityFormValues) => void
  facilityType?: string
  isSubmitting?: boolean
  submitLabel?: string
}

export function FacilityForm({
  defaultValues,
  onSubmit,
  facilityType,
  isSubmitting = false,
  submitLabel = "Submit",
}: FacilityFormProps) {
  const form = useForm<FacilityFormValues>({
    resolver: zodResolver(facilityFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: facilityType || "",
      location: "",
      capacity: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      openingHours: "",
      status: "active",
      images: [],
      additionalInfo: "",
      ...defaultValues,
    },
  })

  const handleSubmit = (values: FacilityFormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facility Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter facility name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facility Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!facilityType}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hostels">Hostel</SelectItem>
                  <SelectItem value="book-bank">Book Bank</SelectItem>
                  <SelectItem value="gym">Gym</SelectItem>
                  <SelectItem value="astrology">Astrology</SelectItem>
                  <SelectItem value="party-plots">Party Plot</SelectItem>
                  <SelectItem value="hall">Hall</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Select the type of facility you are adding.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facility Images</FormLabel>
              <FormControl>
                <FacilityImageUpload images={field.value} onChange={field.onChange} maxImages={5} />
              </FormControl>
              <FormDescription>Upload up to 5 images of the facility.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter facility description" className="min-h-[150px]" {...field} />
              </FormControl>
              <FormDescription>Provide a detailed description of the facility.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter facility location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input placeholder="Enter capacity (e.g., 50 people)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="openingHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Hours</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Mon-Fri: 9am-5pm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any additional information" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>Include any other relevant details about the facility.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
