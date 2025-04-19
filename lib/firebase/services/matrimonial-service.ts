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
import type { MatrimonialProfile } from "@/components/admin/columns/matrimonial-columns"

const COLLECTION_NAME = "matrimonial_profiles"

// Helper function to clean object of undefined values
function cleanObject(obj: Record<string, any>): Record<string, any> {
  const cleanedObj: Record<string, any> = {}

  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      cleanedObj[key] = obj[key]
    }
  })

  return cleanedObj
}

// Get all matrimonial profiles
export async function getMatrimonialProfiles(): Promise<MatrimonialProfile[]> {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      return []
    }

    const profilesRef = collection(db, COLLECTION_NAME)
    const q = query(profilesRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        age: data.age || 0,
        gender: data.gender || "",
        location: data.location || "",
        profession: data.profession || "",
        education: data.education || "",
        about: data.about || "",
        verified: data.verified || false,
        hasUploadedPdf: data.hasUploadedPdf || false,
        height: data.height,
        income: data.income,
        religion: data.religion,
        diet: data.diet,
        maritalStatus: data.maritalStatus,
        motherTongue: data.motherTongue,
        status: data.status || "active",
        createdAt: data.createdAt || "",
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        hobbies: data.hobbies || [],
        familyType: data.familyType,
        fatherName: data.fatherName,
        motherName: data.motherName,
        familyStatus: data.familyStatus,
        fatherOccupation: data.fatherOccupation,
        motherOccupation: data.motherOccupation,
        siblings: data.siblings,
        familyInfo: data.familyInfo,
        partnerInfo: data.partnerInfo,
        imageUrl: data.imageUrl,
      }
    })
  } catch (error) {
    console.error("Error getting matrimonial profiles:", error)
    return []
  }
}

// Get a single matrimonial profile by ID
export async function getMatrimonialProfileById(id: string): Promise<MatrimonialProfile | null> {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      return null
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        name: data.name || "",
        age: data.age || 0,
        gender: data.gender || "",
        location: data.location || "",
        profession: data.profession || "",
        education: data.education || "",
        about: data.about || "",
        verified: data.verified || false,
        hasUploadedPdf: data.hasUploadedPdf || false,
        height: data.height,
        income: data.income,
        religion: data.religion,
        diet: data.diet,
        maritalStatus: data.maritalStatus,
        motherTongue: data.motherTongue,
        status: data.status || "active",
        createdAt: data.createdAt || "",
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        hobbies: data.hobbies || [],
        familyType: data.familyType,
        fatherName: data.fatherName,
        motherName: data.motherName,
        familyStatus: data.familyStatus,
        fatherOccupation: data.fatherOccupation,
        motherOccupation: data.motherOccupation,
        siblings: data.siblings,
        familyInfo: data.familyInfo,
        partnerInfo: data.partnerInfo,
        imageUrl: data.imageUrl,
      }
    }
    return null
  } catch (error) {
    console.error("Error getting matrimonial profile:", error)
    return null
  }
}

// Add a new matrimonial profile
export async function addMatrimonialProfile(profile: Omit<MatrimonialProfile, "id">): Promise<string> {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      throw new Error("Firestore is not initialized")
    }

    const profileData = {
      ...cleanObject(profile),
      createdAt: profile.createdAt || new Date().toISOString().split("T")[0],
      timestamp: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), profileData)
    return docRef.id
  } catch (error) {
    console.error("Error adding matrimonial profile:", error)
    throw error
  }
}

// Update an existing matrimonial profile
export async function updateMatrimonialProfile(id: string, profile: Partial<MatrimonialProfile>): Promise<void> {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      throw new Error("Firestore is not initialized")
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    const updateData = {
      ...cleanObject(profile),
      updatedAt: serverTimestamp(),
    }
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Error updating matrimonial profile:", error)
    throw error
  }
}

// Delete a matrimonial profile
export async function deleteMatrimonialProfile(id: string): Promise<void> {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      throw new Error("Firestore is not initialized")
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting matrimonial profile:", error)
    throw error
  }
}

// Get matrimonial profiles by status
export async function getMatrimonialProfilesByStatus(status: string): Promise<MatrimonialProfile[]> {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      return []
    }

    const profilesRef = collection(db, COLLECTION_NAME)
    const q = query(profilesRef, where("status", "==", status), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        age: data.age || 0,
        gender: data.gender || "",
        location: data.location || "",
        profession: data.profession || "",
        education: data.education || "",
        about: data.about || "",
        verified: data.verified || false,
        hasUploadedPdf: data.hasUploadedPdf || false,
        height: data.height,
        income: data.income,
        religion: data.religion,
        diet: data.diet,
        maritalStatus: data.maritalStatus,
        motherTongue: data.motherTongue,
        status: data.status || "active",
        createdAt: data.createdAt || "",
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        hobbies: data.hobbies || [],
        familyType: data.familyType,
        fatherName: data.fatherName,
        motherName: data.motherName,
        familyStatus: data.familyStatus,
        fatherOccupation: data.fatherOccupation,
        motherOccupation: data.motherOccupation,
        siblings: data.siblings,
        familyInfo: data.familyInfo,
        partnerInfo: data.partnerInfo,
        imageUrl: data.imageUrl,
      }
    })
  } catch (error) {
    console.error("Error getting matrimonial profiles by status:", error)
    return []
  }
}

// Get matrimonial profiles by gender
export async function getMatrimonialProfilesByGender(gender: string): Promise<MatrimonialProfile[]> {
  try {
    if (!db) {
      console.error("Firestore is not initialized")
      return []
    }

    const profilesRef = collection(db, COLLECTION_NAME)
    const q = query(profilesRef, where("gender", "==", gender), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        age: data.age || 0,
        gender: data.gender || "",
        location: data.location || "",
        profession: data.profession || "",
        education: data.education || "",
        about: data.about || "",
        verified: data.verified || false,
        hasUploadedPdf: data.hasUploadedPdf || false,
        height: data.height,
        income: data.income,
        religion: data.religion,
        diet: data.diet,
        maritalStatus: data.maritalStatus,
        motherTongue: data.motherTongue,
        status: data.status || "active",
        createdAt: data.createdAt || "",
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        hobbies: data.hobbies || [],
        familyType: data.familyType,
        fatherName: data.fatherName,
        motherName: data.motherName,
        familyStatus: data.familyStatus,
        fatherOccupation: data.fatherOccupation,
        motherOccupation: data.motherOccupation,
        siblings: data.siblings,
        familyInfo: data.familyInfo,
        partnerInfo: data.partnerInfo,
        imageUrl: data.imageUrl,
      }
    })
  } catch (error) {
    console.error("Error getting matrimonial profiles by gender:", error)
    return []
  }
}
