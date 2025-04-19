"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { PartyPlot } from "@/components/admin/columns/party-plot-columns"
import { format } from "date-fns"

interface ViewPartyPlotDialogProps {
  partyPlot: PartyPlot | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewPartyPlotDialog({ partyPlot, open, onOpenChange }: ViewPartyPlotDialogProps) {
  if (!partyPlot) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (error) {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>View booking information for {partyPlot.plotName}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Plot Name</h3>
              <p className="mt-1 text-sm text-gray-900">{partyPlot.plotName}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="mt-1">
                <Badge className={getStatusColor(partyPlot.status)}>{partyPlot.status}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Booked By</h3>
              <p className="mt-1 text-sm text-gray-900">{partyPlot.bookedBy}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-sm text-gray-900">{partyPlot.email || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
              <p className="mt-1 text-sm text-gray-900">{partyPlot.contactNumber || "N/A"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
              <p className="mt-1 text-sm text-gray-900">{partyPlot.eventType}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Booking Date</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(partyPlot.bookingDate)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Event Date</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(partyPlot.eventDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Time Slot</h3>
              <p className="mt-1 text-sm text-gray-900">
                {partyPlot.timeSlot === "morning"
                  ? "Morning (8:00 AM - 12:00 PM)"
                  : partyPlot.timeSlot === "afternoon"
                    ? "Afternoon (12:00 PM - 4:00 PM)"
                    : partyPlot.timeSlot === "evening"
                      ? "Evening (4:00 PM - 8:00 PM)"
                      : partyPlot.timeSlot === "night"
                        ? "Night (8:00 PM - 12:00 AM)"
                        : "Full Day (8:00 AM - 12:00 AM)"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Number of Guests</h3>
              <p className="mt-1 text-sm text-gray-900">{partyPlot.numberOfGuests || "N/A"}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Amount</h3>
            <p className="mt-1 text-sm text-gray-900">₹{partyPlot.amount.toLocaleString()}</p>
          </div>

          {partyPlot.additionalMessage && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Additional Message</h3>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{partyPlot.additionalMessage}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
