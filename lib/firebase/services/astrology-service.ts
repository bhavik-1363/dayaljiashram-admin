import { doc, getDoc, setDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { db, storage } from "../firebase"

export interface Astrology {
  title: string
  description: string
  contactInfo: string
  openingHours: string
  additionalInfo: string
  images: string[]
}

const COLLECTION_NAME = "astrology"
const DOCUMENT_ID = "astrologyInfo"

// Mock data for development
const mockAstrologyData: Astrology = {
  title: "Community Astrology Services",
  description:
    "Our astrology services provide guidance and insights based on traditional astrological practices. We offer personalized horoscope readings, compatibility analysis, and auspicious timing consultations. Our experienced astrologers combine ancient wisdom with modern understanding to help community members navigate life's challenges and opportunities.",
  contactInfo: "Chief Astrologer: Raj Sharma\nPhone: (555) 234-5678\nEmail: astrology@community.org",
  openingHours: "Monday-Saturday: 9am-5pm, Sunday: By appointment only",
  additionalInfo:
    "Consultations are available in person or via video call. Please bring your birth date, time, and location for accurate readings. Special rates available for community members.",
  images: ["/celestial-guidance.png", "/celestial-zodiac-wheel.png", "/celestial-glyphs.png"],
}

export async function getAstrologyInfo(): Promise<Astrology> {
  try {
    // Check if we should use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      console.log("Using mock astrology data")
      return mockAstrologyData
    }

    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as Astrology
    } else {
      // If no document exists yet, create one with mock data
      await setDoc(docRef, mockAstrologyData)
      return mockAstrologyData
    }
  } catch (error) {
    console.error("Error fetching astrology info:", error)
    return mockAstrologyData
  }
}

export async function updateAstrologyInfo(data: Astrology): Promise<void> {
  try {
    // Check if we should use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      console.log("Mock mode: Would update astrology info with", data)
      return
    }

    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID)
    await setDoc(docRef, data)
    console.log("Astrology info updated successfully")
  } catch (error) {
    console.error("Error updating astrology info:", error)
    throw error
  }
}

export async function uploadAstrologyImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
  try {
    // Check if we should use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      console.log("Mock mode: Would upload image", file.name)
      // Return a fake URL after a short delay to simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return URL.createObjectURL(file)
    }

    const storageRef = ref(storage, `astrology/${Date.now()}_${file.name}`)

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
    console.error("Error in uploadAstrologyImage:", error)
    throw error
  }
}