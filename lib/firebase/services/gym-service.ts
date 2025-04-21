import { db, storage } from "../firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"

export interface Gym {
  title: string
  description: string
  contactInfo: string
  openingHours: string
  additionalInfo: string
  images: string[]
}

export interface UploadProgress {
  progress: number
  downloadURL?: string
}

const COLLECTION_NAME = "facilities"
const DOCUMENT_ID = "gym"

// Mock data for development
const mockGymData: Gym = {
  title: "Community Fitness Center",
  description:
    "Our state-of-the-art fitness center is equipped with modern exercise equipment, dedicated workout spaces, and professional trainers to help you achieve your fitness goals. The gym offers a variety of programs including strength training, cardio workouts, yoga classes, and personalized fitness plans.",
  contactInfo: "Fitness Manager: John Doe\nPhone: (555) 123-4567\nEmail: gym@community.org",
  openingHours: "Monday-Friday: 6am-10pm, Saturday: 8am-8pm, Sunday: 9am-6pm",
  additionalInfo:
    "Membership is free for community members. Please bring your membership card. Towel service available. Personal training sessions can be booked at the front desk.",
  images: ["/modern-research-facility.png", "/modern-gym-floor.png", "/vibrant-urban-gym.png"],
}

export async function getGymData(): Promise<Gym> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Using mock gym data")
    return mockGymData
  }

  try {
    const gymDocRef = doc(db, COLLECTION_NAME, DOCUMENT_ID)
    const gymDoc = await getDoc(gymDocRef)

    if (gymDoc.exists()) {
      return gymDoc.data() as Gym
    } else {
      // If no document exists yet, create one with mock data
      await setDoc(gymDocRef, mockGymData)
      return mockGymData
    }
  } catch (error) {
    console.error("Error fetching gym data:", error)
    return mockGymData
  }
}

export async function updateGymData(gymData: Gym): Promise<void> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Mock mode: Would update gym data", gymData)
    return
  }

  try {
    const gymDocRef = doc(db, COLLECTION_NAME, DOCUMENT_ID)
    await setDoc(gymDocRef, gymData)
    console.log("Gym data updated successfully")
  } catch (error) {
    console.error("Error updating gym data:", error)
    throw error
  }
}

export async function uploadGymImage(file: File, onProgress?: (progress: UploadProgress) => void): Promise<string> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Mock mode: Would upload image", file.name)
    // Return a fake URL after a short delay to simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const mockUrl = URL.createObjectURL(file)
    onProgress?.({ progress: 100, downloadURL: mockUrl })
    return mockUrl
  }

  return new Promise((resolve, reject) => {
    try {
      const fileName = `${Date.now()}_${file.name}`
      const storageRef = ref(storage, `gym/${fileName}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.({ progress })
        },
        (error) => {
          console.error("Error uploading image:", error)
          reject(error)
        },
        async () => {
          try {
            // Use storageRef directly as suggested by the user
            const downloadURL = await getDownloadURL(storageRef)
            //onProgress?.({ progress: 100, downloadURL })
            resolve(downloadURL)
          } catch (error) {
            console.error("Error getting download URL:", error)
            reject(error)
          }
        },
      )
    } catch (error) {
      console.error("Error starting upload:", error)
      reject(error)
    }
  })
}
