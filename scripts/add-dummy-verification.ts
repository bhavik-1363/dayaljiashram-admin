import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"
import type { VerificationStatus } from "@/lib/firebase/services/verification-service"

// Firebase configuration - replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function addDummyVerificationRequest() {
  try {
    // Sample member ID - replace with an actual member ID from your database
    const memberId = "MEMBER_ID_HERE" // Replace this with a real member ID

    // Sample verification request data
    const verificationData = {
      memberId,
      requestedBy: "member@example.com", // The email of the member requesting verification
      requestedAt: serverTimestamp(),
      status: "pending" as VerificationStatus,

      // The changes the member wants to make to their profile
      changes: {
        name: "Updated Name",
        phone: "9876543210",
        address: "123 New Street, Updated City",
        occupation: "Software Engineer",
      },

      // The original data before changes
      originalData: {
        name: "Original Name",
        phone: "1234567890",
        address: "456 Old Street, Original City",
        occupation: "Web Developer",
      },
    }

    // Add the verification request to Firestore
    const verificationRef = collection(db, "verification_requests")
    const docRef = await addDoc(verificationRef, verificationData)

    console.log("Dummy verification request added with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error adding dummy verification request:", error)
    throw error
  }
}

// Execute the function
addDummyVerificationRequest()
  .then(() => console.log("Script completed successfully"))
  .catch((error) => console.error("Script failed:", error))
