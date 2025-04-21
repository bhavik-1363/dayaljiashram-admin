import { db, storage } from "../firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"

// Define the BookBank interface
export interface BookBank {
  title: string
  description: string
  contactInfo: string
  openingHours: string
  additionalInfo: string
  images: string[]
}

// Default book bank data
const defaultBookBank: BookBank = {
  title: "Community Book Bank",
  description:
    "Our Book Bank provides free access to educational materials, textbooks, and literature for all community members. We maintain a diverse collection of books across various subjects and age groups. The Book Bank operates on a borrow-and-return system, allowing members to access resources they might not otherwise be able to afford.",
  contactInfo: "Librarian: Sarah Johnson\nPhone: (555) 987-6543\nEmail: bookbank@community.org",
  openingHours: "Monday-Friday: 10am-6pm, Saturday: 10am-4pm, Sunday: Closed",
  additionalInfo:
    "Books can be borrowed for up to 3 weeks. Late returns may incur a small fee. Donations of gently used books are always welcome and appreciated.",
  images: ["/grand-library-stacks.png", "/sharing-stories-community.png", "/diverse-educational-bookshelves.png"],
}

// Collection name in Firestore
const COLLECTION_NAME = "facilities"
const DOCUMENT_ID = "book-bank"

/**
 * Get book bank information from Firestore
 */
export async function getBookBank(): Promise<BookBank> {
  try {
    // Check if we should use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      console.log("Using mock data for book bank")
      return defaultBookBank
    }

    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as BookBank
    } else {
      // If no document exists, create one with default data
      await setDoc(docRef, defaultBookBank)
      return defaultBookBank
    }
  } catch (error) {
    console.error("Error getting book bank:", error)
    return defaultBookBank
  }
}

/**
 * Update book bank information in Firestore
 */
export async function updateBookBank(bookBank: BookBank): Promise<void> {
  try {
    // Check if we should use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      console.log("Mock mode: Would update book bank with:", bookBank)
      return
    }

    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID)
    await setDoc(docRef, bookBank, { merge: true })
  } catch (error) {
    console.error("Error updating book bank:", error)
    throw error
  }
}

/**
 * Upload an image to Firebase Storage for the book bank
 */
export async function uploadBookBankImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
  try {
    // Check if we should use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      console.log("Mock mode: Would upload image:", file.name)
      // Return a fake URL for the mock mode
      return URL.createObjectURL(file)
    }

    const storageRef = ref(storage, `book-bank/${Date.now()}_${file.name}`)
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
          const downloadURL = await getDownloadURL(storageRef)
          resolve(downloadURL)
        },
      )
    })
  } catch (error) {
    console.error("Error in uploadBookBankImage:", error)
    throw error
  }
}