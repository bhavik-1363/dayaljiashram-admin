import { db, storage } from "@/lib/firebase/firebase"
import { collection, doc, getDocs, setDoc, deleteDoc, query, where, getDoc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import type { Venue } from "@/components/admin/columns/venue-columns"

// Collection name in Firestore
const COLLECTION_NAME = "venues"

// Mock data for development without Firebase
const mockVenues: Venue[] = [
  {
    id: "venue1",
    name: "Royal Garden Party Plot",
    description:
      "A luxurious venue with beautiful gardens and modern amenities, perfect for weddings and large gatherings.",
    capacity: "500 people",
    capacityRange: "large",
    area: "15,000 sq ft",
    price: "₹75,000 per day",
    image: "/urban-skyline-soiree.png",
    address: "123 Garden Road, Ahmedabad, Gujarat 380015",
    contactPhone: "+91 98765 43210",
    contactEmail: "bookings@royalgarden.com",
    eventTypes: ["Wedding", "Corporate Event", "Birthday Party", "Anniversary"],
    amenities: [
      "Parking",
      "Air Conditioning",
      "Catering",
      "Sound System",
      "Stage",
      "Decoration",
      "WiFi",
      "Power Backup",
    ],
    venueRules: [
      {
        title: "Noise Restrictions",
        description: "Music must be turned down after 10 PM to comply with local regulations.",
      },
      {
        title: "Outside Catering",
        description: "Outside catering is allowed with prior permission and additional charges.",
      },
      {
        title: "Decorations",
        description:
          "No permanent fixtures or nails allowed on walls. All decorations must be removed after the event.",
      },
    ],
    providedItems: [
      {
        category: "Furniture",
        items: [
          {
            name: "Chairs",
            quantity: 500,
            description: "Comfortable cushioned chairs",
          },
          {
            name: "Tables",
            quantity: 50,
            description: "Round tables seating 10 people each",
          },
        ],
      },
      {
        category: "Audio/Visual",
        items: [
          {
            name: "Sound System",
            quantity: 1,
            description: "Professional sound system with speakers and microphones",
          },
          {
            name: "Projector",
            quantity: 2,
            description: "HD projectors with screens",
          },
        ],
      },
    ],
    contactInfo: {
      name: "Rajesh Patel",
      phone: "+91 98765 43210",
      email: "rajesh@royalgarden.com",
    },
    images: ["/urban-skyline-soiree.png", "/urban-evening-gathering.png"],
  },
  {
    id: "venue2",
    name: "Riverside Banquet Hall",
    description:
      "An elegant banquet hall with a beautiful view of the river, ideal for corporate events and medium-sized gatherings.",
    capacity: "300 people",
    capacityRange: "medium",
    area: "8,000 sq ft",
    price: "₹50,000 per day",
    image: "/urban-skyline-gathering.png",
    address: "45 Riverside Road, Ahmedabad, Gujarat 380054",
    contactPhone: "+91 87654 32109",
    contactEmail: "info@riversidebanquet.com",
    eventTypes: ["Corporate Event", "Conference", "Seminar", "Product Launch"],
    amenities: ["Parking", "Air Conditioning", "WiFi", "Projector", "Podium", "Microphones"],
    venueRules: [
      {
        title: "Booking Hours",
        description: "Venue is available from 8 AM to 11 PM only.",
      },
      {
        title: "Payment Terms",
        description: "50% advance payment required for booking confirmation.",
      },
    ],
    providedItems: [
      {
        category: "Furniture",
        items: [
          {
            name: "Chairs",
            quantity: 300,
            description: "Executive chairs",
          },
          {
            name: "Tables",
            quantity: 30,
            description: "Conference tables",
          },
        ],
      },
      {
        category: "Technology",
        items: [
          {
            name: "Projectors",
            quantity: 3,
            description: "4K projectors",
          },
          {
            name: "Microphones",
            quantity: 10,
            description: "Wireless microphones",
          },
        ],
      },
    ],
    contactInfo: {
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      email: "priya@riversidebanquet.com",
    },
    images: ["/urban-skyline-gathering.png"],
  },
]

// Function to get all venues
export async function getVenues(): Promise<Venue[]> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Using mock venues data")
    return mockVenues
  }

  try {
    const venuesCollection = collection(db, COLLECTION_NAME)
    const venuesSnapshot = await getDocs(venuesCollection)

    if (venuesSnapshot.empty) {
      console.log("No venues found in Firestore, using initial data")
      // If no venues in Firestore yet, add the mock data
      for (const venue of mockVenues) {
        await setDoc(doc(db, COLLECTION_NAME, venue.id), venue)
      }
      return mockVenues
    }

    const venues: Venue[] = []
    venuesSnapshot.forEach((doc) => {
      venues.push({ id: doc.id, ...doc.data() } as Venue)
    })

    return venues
  } catch (error) {
    console.error("Error fetching venues:", error)
    return mockVenues
  }
}

// Function to get a single venue by ID
export async function getVenueById(id: string): Promise<Venue | null> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    const venue = mockVenues.find((v) => v.id === id)
    return venue || null
  }

  try {
    const venueDoc = await getDoc(doc(db, COLLECTION_NAME, id))

    if (venueDoc.exists()) {
      return { id: venueDoc.id, ...venueDoc.data() } as Venue
    } else {
      console.log(`No venue found with ID: ${id}`)
      return null
    }
  } catch (error) {
    console.error(`Error fetching venue with ID ${id}:`, error)
    return null
  }
}

// Function to add a new venue
export async function addVenue(venue: Omit<Venue, "id">): Promise<Venue> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    const newVenue = {
      ...venue,
      id: `venue${mockVenues.length + 1}`,
    }
    mockVenues.push(newVenue as Venue)
    return newVenue as Venue
  }

  try {
    const newVenueRef = doc(collection(db, COLLECTION_NAME))
    const newVenue = {
      ...venue,
      id: newVenueRef.id,
    }

    await setDoc(newVenueRef, newVenue)
    return newVenue as Venue
  } catch (error) {
    console.error("Error adding venue:", error)
    throw error
  }
}

// Function to update an existing venue
export async function updateVenue(venue: Venue): Promise<Venue> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    const index = mockVenues.findIndex((v) => v.id === venue.id)
    if (index !== -1) {
      mockVenues[index] = venue
    }
    return venue
  }

  try {
    await setDoc(doc(db, COLLECTION_NAME, venue.id), venue, { merge: true })
    return venue
  } catch (error) {
    console.error(`Error updating venue with ID ${venue.id}:`, error)
    throw error
  }
}

// Function to delete a venue
export async function deleteVenue(id: string): Promise<void> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    const index = mockVenues.findIndex((v) => v.id === id)
    if (index !== -1) {
      mockVenues.splice(index, 1)
    }
    return
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
  } catch (error) {
    console.error(`Error deleting venue with ID ${id}:`, error)
    throw error
  }
}

// Function to upload a venue image
export async function uploadVenueImage(
  file: File,
  venueName: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    // Simulate upload progress
    if (onProgress) {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        onProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
        }
      }, 300)
    }

    // Return a placeholder image URL
    return "/urban-skyline-soiree.png"
  }

  try {
    const fileExtension = file.name.split(".").pop()
    const fileName = `${venueName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.${fileExtension}`
    const storageRef = ref(storage, `venues/${fileName}`)

    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(progress)
          }
        },
        (error) => {
          console.error("Error uploading image:", error)
          reject(error)
        },
        async () => {
          try {
            // Use storageRef directly as suggested
            const downloadURL = await getDownloadURL(storageRef)
            resolve(downloadURL)
          } catch (error) {
            console.error("Error getting download URL:", error)
            reject(error)
          }
        },
      )
    })
  } catch (error) {
    console.error("Error in uploadVenueImage:", error)
    throw error
  }
}

// Function to get venues by capacity range
export async function getVenuesByCapacityRange(capacityRange: string): Promise<Venue[]> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    if (capacityRange === "all") {
      return mockVenues
    }
    return mockVenues.filter((venue) => venue.capacityRange === capacityRange)
  }

  try {
    if (capacityRange === "all") {
      return getVenues()
    }

    const venuesCollection = collection(db, COLLECTION_NAME)
    const q = query(venuesCollection, where("capacityRange", "==", capacityRange))
    const venuesSnapshot = await getDocs(q)

    const venues: Venue[] = []
    venuesSnapshot.forEach((doc) => {
      venues.push({ id: doc.id, ...doc.data() } as Venue)
    })

    return venues
  } catch (error) {
    console.error(`Error fetching venues by capacity range ${capacityRange}:`, error)
    return mockVenues.filter((venue) => venue.capacityRange === capacityRange)
  }
}