import { db } from "@/lib/firebase/firebase"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"

const COLLECTION_NAME = "about_trust"
const ABOUT_DOC_ID = "about_content"

// Interface for About Trust content
export interface AboutTrustContent {
  id?: string
  title?: string
  mission: string
  vision: string
  history: string
  values: string[] | string
  foundedYear?: number
  founders?: {
    name: string
    description: string
    imageUrl?: string
  }[]
  milestones?: {
    year: number
    title: string
    description: string
  }[]
  contactInfo: {
    address: string
    phone: string
    email: string
    website?: string
    socialMedia?: {
      facebook?: string
      twitter?: string
      instagram?: string
      linkedin?: string
    }
  }
  bannerImage?: string
  galleryImages?: string[]
  createdAt?: any
  updatedAt?: any
}

// Get about trust content
export async function getAboutTrustContent(): Promise<AboutTrustContent | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, ABOUT_DOC_ID)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data() as AboutTrustContent
      return {
        id: docSnap.id,
        ...data,
      }
    }
    return null
  } catch (error) {
    console.error("Error getting about trust content:", error)
    throw error
  }
}

// Update about trust content
export async function updateAboutTrustContent(content: Partial<AboutTrustContent>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, ABOUT_DOC_ID)
    const docSnap = await getDoc(docRef)

    // Make sure values is an array
    if (content.values && typeof content.values === "string") {
      content.values = content.values.split(",").map((val) => val.trim())
    }

    // Remove id field from the content to avoid Firestore errors
    const { id, ...contentWithoutId } = content

    if (docSnap.exists()) {
      // Update existing document
      const updateData = {
        ...contentWithoutId,
        updatedAt: serverTimestamp(),
      }
      await updateDoc(docRef, updateData)
    } else {
      // Create new document if it doesn't exist
      const newData = {
        ...contentWithoutId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(docRef, newData)
    }
  } catch (error) {
    console.error("Error updating about trust content:", error)
    throw error
  }
}

// Get trust milestones
export async function getTrustMilestones(): Promise<AboutTrustContent["milestones"] | []> {
  try {
    const aboutContent = await getAboutTrustContent()
    return aboutContent?.milestones || []
  } catch (error) {
    console.error("Error getting trust milestones:", error)
    throw error
  }
}

// Update trust milestones
export async function updateTrustMilestones(milestones: AboutTrustContent["milestones"]): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, ABOUT_DOC_ID)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        milestones,
        updatedAt: serverTimestamp(),
      })
    } else {
      await setDoc(docRef, {
        milestones,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error updating trust milestones:", error)
    throw error
  }
}

// Get trust founders
export async function getTrustFounders(): Promise<AboutTrustContent["founders"] | []> {
  try {
    const aboutContent = await getAboutTrustContent()
    return aboutContent?.founders || []
  } catch (error) {
    console.error("Error getting trust founders:", error)
    throw error
  }
}

// Update trust founders
export async function updateTrustFounders(founders: AboutTrustContent["founders"]): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, ABOUT_DOC_ID)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        founders,
        updatedAt: serverTimestamp(),
      })
    } else {
      await setDoc(docRef, {
        founders,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error updating trust founders:", error)
    throw error
  }
}
