import { db } from "@/lib/firebase/firebase"
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import type { PartyPlot } from "@/components/admin/columns/party-plot-columns"

const COLLECTION_NAME = "party_plots"

// Get all party plot bookings
export async function getPartyPlots(): Promise<PartyPlot[]> {
  try {
    const partyPlotsRef = collection(db, COLLECTION_NAME)
    const q = query(partyPlotsRef, orderBy("eventDate", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        plotName: data.plotName || "",
        bookedBy: data.bookedBy || "",
        email: data.email || "",
        contactNumber: data.contactNumber || "",
        eventType: data.eventType || "",
        bookingDate: data.bookingDate || "",
        eventDate: data.eventDate || "",
        timeSlot: data.timeSlot || "fullday",
        numberOfGuests: data.numberOfGuests || 0,
        additionalMessage: data.additionalMessage || "",
        amount: data.amount || 0,
        status: data.status || "pending",
      }
    })
  } catch (error) {
    console.error("Error getting party plots:", error)
    throw error
  }
}

// Get a single party plot booking by ID
export async function getPartyPlotById(id: string): Promise<PartyPlot | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        plotName: data.plotName || "",
        bookedBy: data.bookedBy || "",
        email: data.email || "",
        contactNumber: data.contactNumber || "",
        eventType: data.eventType || "",
        bookingDate: data.bookingDate || "",
        eventDate: data.eventDate || "",
        timeSlot: data.timeSlot || "fullday",
        numberOfGuests: data.numberOfGuests || 0,
        additionalMessage: data.additionalMessage || "",
        amount: data.amount || 0,
        status: data.status || "pending",
      }
    }
    return null
  } catch (error) {
    console.error("Error getting party plot:", error)
    throw error
  }
}

// Add a new party plot booking
export async function addPartyPlot(partyPlot: Omit<PartyPlot, "id">): Promise<string> {
  try {
    const today = new Date().toISOString().split("T")[0]
    const partyPlotData = {
      ...partyPlot,
      bookingDate: partyPlot.bookingDate || today,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), partyPlotData)
    return docRef.id
  } catch (error) {
    console.error("Error adding party plot:", error)
    throw error
  }
}

// Update an existing party plot booking
export async function updatePartyPlot(id: string, partyPlot: Partial<PartyPlot>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const updateData = {
      ...partyPlot,
      updatedAt: serverTimestamp(),
    }
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Error updating party plot:", error)
    throw error
  }
}

// Delete a party plot booking
export async function deletePartyPlot(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting party plot:", error)
    throw error
  }
}

// Get party plots by status
export async function getPartyPlotsByStatus(status: string): Promise<PartyPlot[]> {
  try {
    const partyPlotsRef = collection(db, COLLECTION_NAME)
    const q = query(partyPlotsRef, where("status", "==", status), orderBy("eventDate", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        plotName: data.plotName || "",
        bookedBy: data.bookedBy || "",
        email: data.email || "",
        contactNumber: data.contactNumber || "",
        eventType: data.eventType || "",
        bookingDate: data.bookingDate || "",
        eventDate: data.eventDate || "",
        timeSlot: data.timeSlot || "fullday",
        numberOfGuests: data.numberOfGuests || 0,
        additionalMessage: data.additionalMessage || "",
        amount: data.amount || 0,
        status: data.status || "pending",
      }
    })
  } catch (error) {
    console.error("Error getting party plots by status:", error)
    throw error
  }
}
