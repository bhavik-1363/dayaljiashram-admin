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

interface FormValues {
  plotName: string
  bookedBy: string
  email: string
  contactNumber: string
  eventType: string
  numberOfGuests: number
  additionalMessage: string
  amount: number
}

interface EditPartyPlotDialogProps {
  partyPlot: PartyPlot | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdatePartyPlot?: (updatedPartyPlot: PartyPlot) => void
}

export function EditPartyPlotDialog({ partyPlot, open, onOpenChange, onUpdatePartyPlot }: EditPartyPlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("fullday")
  const [selectedStatus, setSelectedStatus] = useState<string>("pending")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  // Initialize form when partyPlot changes
  useEffect(() => {
    if (partyPlot && open) {
      reset({
        plotName: partyPlot.plotName || "",
        bookedBy: partyPlot.bookedBy || "",
        email: partyPlot.email || "",
        contactNumber: partyPlot.contactNumber || "",
        eventType: partyPlot.eventType || "",
        numberOfGuests: partyPlot.numberOfGuests || 0,
        additionalMessage: partyPlot.additionalMessage || "",
        amount: partyPlot.amount || 0,
      })

      setSelectedDate(partyPlot.eventDate ? new Date(partyPlot.eventDate) : undefined)
      setSelectedTimeSlot(partyPlot.timeSlot || "fullday")
      setSelectedStatus(partyPlot.status || "pending")
    }
  }, [partyPlot, open, reset])

  const onSubmit = (data: FormValues) => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select an event date",
        variant: "destructive",
      })
      return
    }

    if (!partyPlot) {
      return
    }

    setIsSubmitting(true)

    // Format the date to YYYY-MM-DD
    const formattedDate = format(selectedDate, "yyyy-MM-dd")

    // Create the updated party plot object
    const updatedPartyPlot: PartyPlot = {
      ...partyPlot,
      ...data,
      eventDate: formattedDate,
      timeSlot: selectedTimeSlot,
      status: selectedStatus as "confirmed" | "pending" | "cancelled",
    }

    // Call the onUpdatePartyPlot function if provided
    if (onUpdatePartyPlot) {
      onUpdatePartyPlot(updatedPartyPlot)
    }

    setIsSubmitting(false)
    onOpenChange(false)
  }

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
  }

  if (!partyPlot) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>Update booking information for {partyPlot.plotName}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="plotName">Plot Name</Label>
              <Input
                id="plotName"
                placeholder="Enter plot name"
                {...register("plotName", { required: "Plot name is required" })}
              />
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
              <p className="text-sm text-muted-foreground mt-1">The date when the event will take place.</p>
            </div>

            <div>
              <Label htmlFor="timeSlot">Time Slot</Label>
              <select
                id="timeSlot"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
              >
                <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
                <option value="night">Night (8:00 PM - 12:00 AM)</option>
                <option value="fullday">Full Day (8:00 AM - 12:00 AM)</option>
              </select>
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
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <p className="text-sm text-muted-foreground mt-1">Set the current status of this booking.</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
