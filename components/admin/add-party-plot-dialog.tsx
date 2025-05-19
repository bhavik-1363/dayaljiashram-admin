"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import type { PartyPlot } from "@/components/admin/columns/party-plot-columns"
import { format } from "date-fns"
import { Calendar } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getVenues } from "@/lib/firebase/services/venues-service"
import type { Venue } from "@/components/admin/columns/venue-columns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormValues {
  plotName: string
  bookedBy: string
  email: string
  contactNumber: string
  eventType: string
  numberOfGuests: number
  additionalMessage: string
  amount: number
  eventDate: string
}

interface AddPartyPlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddPartyPlot?: (newPartyPlot: Omit<PartyPlot, "id" | "bookingDate">) => void
}

export function AddPartyPlotDialog({ open, onOpenChange, onAddPartyPlot }: AddPartyPlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("fullday")
  const [selectedStatus, setSelectedStatus] = useState<string>("pending")
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoadingVenues, setIsLoadingVenues] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      plotName: "",
      bookedBy: "",
      email: "",
      contactNumber: "",
      eventType: "",
      numberOfGuests: 0,
      additionalMessage: "",
      amount: 0,
      eventDate: "",
    },
  })

  // Watch the plotName value
  const plotName = watch("plotName")

  // Fetch venues when the dialog opens
  useEffect(() => {
    if (open) {
      fetchVenues()
    }
  }, [open])

  const fetchVenues = async () => {
    try {
      setIsLoadingVenues(true)
      const venuesList = await getVenues()
      setVenues(venuesList)
      setIsLoadingVenues(false)
    } catch (error) {
      console.error("Error fetching venues:", error)
      toast({
        title: "Error",
        description: "Failed to load party plot venues",
        variant: "destructive",
      })
      setIsLoadingVenues(false)
    }
  }

  const onSubmit = (data: FormValues) => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select an event date",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Format the date to YYYY-MM-DD
    const formattedDate = format(selectedDate, "yyyy-MM-dd")

    // Create the new party plot object
    const newPartyPlot = {
      ...data,
      eventDate: formattedDate,
      timeSlot: selectedTimeSlot,
      status: selectedStatus as "confirmed" | "pending" | "cancelled",
    }

    // Call the onAddPartyPlot function if provided
    if (onAddPartyPlot) {
      onAddPartyPlot(newPartyPlot)
    }

    // Reset the form
    reset()
    setSelectedDate(undefined)
    setSelectedTimeSlot("fullday")
    setSelectedStatus("pending")

    setIsSubmitting(false)
    onOpenChange(false)
  }

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
      setSelectedDate(undefined)
      setSelectedTimeSlot("fullday")
      setSelectedStatus("pending")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Booking</DialogTitle>
          <DialogDescription>Fill in the details to create a new party plot booking.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="plotName">Plot Name</Label>
              <Select value={plotName} onValueChange={(value) => setValue("plotName", value, { shouldValidate: true })}>
                <SelectTrigger id="plotName" className="w-full">
                  <SelectValue placeholder="Select a party plot" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingVenues ? (
                    <SelectItem value="loading" disabled>
                      Loading venues...
                    </SelectItem>
                  ) : venues.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No venues available
                    </SelectItem>
                  ) : (
                    venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.name}>
                        {venue.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.plotName && <p className="text-sm text-red-500 mt-1">{errors.plotName.message}</p>}
            </div>

            <div>
              <Label htmlFor="bookedBy">Booked By</Label>
              <Input
                id="bookedBy"
                placeholder="Enter booker's name"
                {...register("bookedBy", { required: "Booker name is required" })}
              />
              {errors.bookedBy && <p className="text-sm text-red-500 mt-1">{errors.bookedBy.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter booker's email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email",
                    },
                  })}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  placeholder="Enter contact number"
                  {...register("contactNumber", {
                    required: "Contact number is required",
                    minLength: {
                      value: 10,
                      message: "Contact number must be at least 10 digits",
                    },
                  })}
                />
                {errors.contactNumber && <p className="text-sm text-red-500 mt-1">{errors.contactNumber.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Input
                id="eventType"
                placeholder="Enter event type (e.g., Wedding, Birthday)"
                {...register("eventType", { required: "Event type is required" })}
              />
              {errors.eventType && <p className="text-sm text-red-500 mt-1">{errors.eventType.message}</p>}
            </div>

            <div>
              <Label htmlFor="eventDate">Event Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="eventDate"
                    variant={"outline"}
                    className={`w-full pl-3 text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                  >
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
              {errors.eventDate && <p className="text-sm text-red-500 mt-1">{errors.eventDate.message}</p>}
              <p className="text-sm text-muted-foreground mt-1">The date when the event will take place.</p>
            </div>

            <div>
              <Label htmlFor="timeSlot">Time Slot</Label>
              <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger id="timeSlot" className="w-full">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8:00 AM - 12:00 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12:00 PM - 4:00 PM)</SelectItem>
                  <SelectItem value="evening">Evening (4:00 PM - 8:00 PM)</SelectItem>
                  <SelectItem value="night">Night (8:00 PM - 12:00 AM)</SelectItem>
                  <SelectItem value="fullday">Full Day (8:00 AM - 12:00 AM)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">The time slot when the venue is reserved.</p>
            </div>

            <div>
              <Label htmlFor="numberOfGuests">Number of Guests</Label>
              <Input
                id="numberOfGuests"
                type="number"
                placeholder="Enter number of guests"
                {...register("numberOfGuests", {
                  required: "Number of guests is required",
                  min: {
                    value: 1,
                    message: "Number of guests must be at least 1",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.numberOfGuests && <p className="text-sm text-red-500 mt-1">{errors.numberOfGuests.message}</p>}
              <p className="text-sm text-muted-foreground mt-1">The expected number of guests attending the event.</p>
            </div>

            <div>
              <Label htmlFor="additionalMessage">Additional Message</Label>
              <Textarea
                id="additionalMessage"
                placeholder="Enter any additional requirements or notes"
                className="min-h-[100px]"
                {...register("additionalMessage")}
              />
              <p className="text-sm text-muted-foreground mt-1">Any special requirements or notes from the booker.</p>
            </div>

            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter booking amount"
                {...register("amount", {
                  required: "Amount is required",
                  min: {
                    value: 1,
                    message: "Amount must be greater than 0",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>}
              <p className="text-sm text-muted-foreground mt-1">The total amount for the booking in Rupees.</p>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select booking status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">Set the current status of this booking.</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
