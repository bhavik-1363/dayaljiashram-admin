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
import type { NewsEvent } from "@/components/admin/columns/news-event-columns"

const COLLECTION_NAME = "news_events"

// Helper function to clean object by removing undefined values
function cleanObject(obj: Record<string, any>): Record<string, any> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      // If value is undefined, don't include it in the cleaned object
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    },
    {} as Record<string, any>,
  )
}

// Get all news and events
export async function getNewsEvents(): Promise<NewsEvent[]> {
  try {
    const newsEventsRef = collection(db, COLLECTION_NAME)
    const q = query(newsEventsRef, orderBy("publishDate", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        type: data.type || "news",
        category: data.category || "",
        location: data.location || "",
        publishDate: data.publishDate || "",
        eventDate: data.eventDate || null,
        author: data.author || "",
        status: data.status || "draft",
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        media: data.media || [],
      }
    })
  } catch (error) {
    console.error("Error getting news events:", error)
    throw error
  }
}

// Get a single news/event by ID
export async function getNewsEventById(id: string): Promise<NewsEvent | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        title: data.title || "",
        type: data.type || "news",
        category: data.category || "",
        location: data.location || "",
        publishDate: data.publishDate || "",
        eventDate: data.eventDate || null,
        author: data.author || "",
        status: data.status || "draft",
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        media: data.media || [],
      }
    }
    return null
  } catch (error) {
    console.error("Error getting news event:", error)
    throw error
  }
}

// Add a new news/event
export async function addNewsEvent(newsEvent: Omit<NewsEvent, "id">): Promise<string> {
  try {
    // Clean the object to remove any undefined values
    const cleanedData = cleanObject({
      ...newsEvent,
      // Convert undefined eventDate to null
      eventDate: newsEvent.eventDate || null,
      createdAt: serverTimestamp(),
    })

    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData)
    return docRef.id
  } catch (error) {
    console.error("Error adding news event:", error)
    throw error
  }
}

// Update an existing news/event
export async function updateNewsEvent(id: string, newsEvent: Partial<NewsEvent>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    // Clean the object to remove any undefined values
    const cleanedData = cleanObject({
      ...newsEvent,
      // Convert undefined eventDate to null
      eventDate: newsEvent.eventDate || null,
      updatedAt: serverTimestamp(),
    })

    await updateDoc(docRef, cleanedData)
  } catch (error) {
    console.error("Error updating news event:", error)
    throw error
  }
}

// Delete a news/event
export async function deleteNewsEvent(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting news event:", error)
    throw error
  }
}

// Get news/events by type
export async function getNewsEventsByType(type: string): Promise<NewsEvent[]> {
  try {
    const newsEventsRef = collection(db, COLLECTION_NAME)
    const q = query(newsEventsRef, where("type", "==", type), orderBy("publishDate", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        type: data.type || "news",
        category: data.category || "",
        location: data.location || "",
        publishDate: data.publishDate || "",
        eventDate: data.eventDate || null,
        author: data.author || "",
        status: data.status || "draft",
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        media: data.media || [],
      }
    })
  } catch (error) {
    console.error("Error getting news events by type:", error)
    throw error
  }
}

// Get news/events by status
export async function getNewsEventsByStatus(status: string): Promise<NewsEvent[]> {
  try {
    const newsEventsRef = collection(db, COLLECTION_NAME)
    const q = query(newsEventsRef, where("status", "==", status), orderBy("publishDate", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        type: data.type || "news",
        category: data.category || "",
        location: data.location || "",
        publishDate: data.publishDate || "",
        eventDate: data.eventDate || null,
        author: data.author || "",
        status: data.status || "draft",
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        media: data.media || [],
      }
    })
  } catch (error) {
    console.error("Error getting news events by status:", error)
    throw error
  }
}

// Get upcoming events
export async function getUpcomingEvents(): Promise<NewsEvent[]> {
  try {
    const today = new Date().toISOString().split("T")[0]
    const newsEventsRef = collection(db, COLLECTION_NAME)
    const q = query(
      newsEventsRef,
      where("type", "==", "event"),
      where("eventDate", ">=", today),
      where("status", "==", "published"),
      orderBy("eventDate", "asc"),
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        type: data.type || "event",
        category: data.category || "",
        location: data.location || "",
        publishDate: data.publishDate || "",
        eventDate: data.eventDate || null,
        author: data.author || "",
        status: data.status || "published",
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        media: data.media || [],
      }
    })
  } catch (error) {
    console.error("Error getting upcoming events:", error)
    throw error
  }
}
