import {
  addDocument,
  getDocuments,
  getDocument,
  updateDocument,
  setDocument,
  deleteDocument,
  where,
} from "@/lib/firebase/firestore"
import { generateFilePath, uploadFile as uploadStorageFile } from "@/lib/firebase/storage"
import type { QueryConstraint } from "firebase/firestore"

// Define the Facility type
export interface Facility {
  id?: string
  name: string
  description: string
  type: string // e.g., 'hostels', 'gym', 'book-bank', 'party-plots'
  subType?: string // e.g., 'boys', 'girls' for hostels
  location?: string
  facilities?: string[]
  roomTypes?: string[]
  roomFeatures?: string[]
  contactInfo?: string
  images?: string[]
  status: string // 'active', 'inactive', 'maintenance'
  createdAt?: Date
  updatedAt?: Date
}

// Collection name in Firestore
const COLLECTION_NAME = "facilities"

// Check if we should use mock data
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

// Mock data for testing without Firebase
const mockFacilities: Record<string, Facility> = {
  "hostels-boys": {
    id: "hostels-boys",
    name: "Boys Hostel",
    description: "Our Boys Hostel provides a safe, comfortable, and supportive environment for students.",
    type: "hostels",
    subType: "boys",
    location: "North Campus, Building A",
    facilities: ["Wi-Fi", "24/7 Security", "Laundry Service", "Study Rooms"],
    roomTypes: ["single", "double"],
    roomFeatures: ["Attached Bathroom", "Study Table", "Wardrobe"],
    contactInfo: "Warden: Mr. Rajesh Patel\nPhone: (555) 123-4567",
    images: [],
    status: "active",
  },
  "hostels-girls": {
    id: "hostels-girls",
    name: "Girls Hostel",
    description: "Our Girls Hostel offers a secure and nurturing environment for female students.",
    type: "hostels",
    subType: "girls",
    location: "North Campus, Building B",
    facilities: ["Wi-Fi", "24/7 Security", "Laundry Service", "Study Rooms"],
    roomTypes: ["double", "triple"],
    roomFeatures: ["Attached Bathroom", "Study Table", "Wardrobe"],
    contactInfo: "Warden: Mrs. Priya Sharma\nPhone: (555) 987-6543",
    images: [],
    status: "active",
  },
}

// Get all facilities
export const getAllFacilities = async (): Promise<Facility[]> => {
  if (useMockData) {
    return Object.values(mockFacilities)
  }

  try {
    return await getDocuments<Facility>(COLLECTION_NAME)
  } catch (error) {
    console.error("Error getting all facilities:", error)
    return []
  }
}

// Get facilities by type
export const getFacilitiesByType = async (type: string): Promise<Facility[]> => {
  if (useMockData) {
    return Object.values(mockFacilities).filter((facility) => facility.type === type)
  }

  try {
    const constraints: QueryConstraint[] = [where("type", "==", type)]
    return await getDocuments<Facility>(COLLECTION_NAME, constraints)
  } catch (error) {
    console.error(`Error getting facilities by type ${type}:`, error)
    return []
  }
}

// Get facility by ID
export const getFacilityById = async (id: string): Promise<Facility | null> => {
  if (useMockData) {
    return mockFacilities[id] || null
  }

  try {
    return await getDocument<Facility>(COLLECTION_NAME, id)
  } catch (error) {
    console.error(`Error getting facility by ID ${id}:`, error)
    return null
  }
}

// Create or update a facility
export const createOrUpdateFacility = async (facility: Facility): Promise<string> => {
  if (useMockData) {
    const id = facility.id || `${facility.type}-${Date.now()}`
    mockFacilities[id] = { ...facility, id }
    return id
  }

  try {
    if (facility.id) {
      await updateDocument(COLLECTION_NAME, facility.id, facility)
      return facility.id
    } else {
      return await addDocument(COLLECTION_NAME, facility)
    }
  } catch (error) {
    console.error("Error creating or updating facility:", error)
    throw error
  }
}

// Update or create a facility by type and subtype
export const updateOrCreateFacilityByType = async (id: string, facility: Facility): Promise<string> => {
  if (useMockData) {
    mockFacilities[id] = { ...facility, id }
    return id
  }

  try {
    await setDocument(COLLECTION_NAME, id, facility)
    return id
  } catch (error) {
    console.error(`Error updating or creating facility by type ${id}:`, error)
    throw error
  }
}

// Delete a facility
export const deleteFacility = async (id: string): Promise<void> => {
  if (useMockData) {
    delete mockFacilities[id]
    return
  }

  try {
    await deleteDocument(COLLECTION_NAME, id)
  } catch (error) {
    console.error(`Error deleting facility ${id}:`, error)
    throw error
  }
}

// Upload a file to Firebase Storage
export const uploadFile = async (
  file: File,
  folder: string,
  progressCallback?: (progress: number) => void,
): Promise<string> => {
  if (useMockData) {
    // Simulate upload with progress
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        if (progressCallback) progressCallback(progress)

        if (progress >= 100) {
          clearInterval(interval)
          // Return a placeholder URL for mock data
          resolve(`/placeholder.svg?height=300&width=400&query=${file.name}`)
        }
      }, 300)
    })
  }

  try {
    const filePath = generateFilePath(folder, file.name)
    return await uploadStorageFile(filePath, file, progressCallback)
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}
