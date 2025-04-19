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
  serverTimestamp,
} from "firebase/firestore"

const COLLECTION_NAME = "committee_members"

// Types for committee members
export interface CommitteeMember {
  id: string
  name: string
  position: string
  type: "committee" | "trustee" | "past_president" | "past_trustee" | "past_secretary"
  email?: string
  phone?: string
  bio?: string
  imageUrl?: string
  term?: string
  achievements?: string[]
  joinDate?: string
  endDate?: string
  isActive: boolean
}

// Get all committee members
export async function getCommitteeMembers(): Promise<CommitteeMember[]> {
  try {
    const committeeRef = collection(db, COLLECTION_NAME)
    const querySnapshot = await getDocs(committeeRef)

    const members = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        position: data.position || "",
        type: data.type || "committee",
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        imageUrl: data.imageUrl,
        term: data.term,
        achievements: data.achievements || [],
        joinDate: data.joinDate,
        endDate: data.endDate,
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    })

    // Sort in memory instead of using orderBy in the query
    return members.sort((a, b) => a.position.localeCompare(b.position))
  } catch (error) {
    console.error("Error getting committee members:", error)
    throw error
  }
}

// Get committee members by type
export async function getCommitteeMembersByType(type: string): Promise<CommitteeMember[]> {
  try {
    const committeeRef = collection(db, COLLECTION_NAME)
    // Only filter by type, don't use orderBy to avoid the need for a composite index
    const q = query(committeeRef, where("type", "==", type))
    const querySnapshot = await getDocs(q)

    const members = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        position: data.position || "",
        type: data.type || "committee",
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        imageUrl: data.imageUrl,
        term: data.term,
        achievements: data.achievements || [],
        joinDate: data.joinDate,
        endDate: data.endDate,
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    })

    // Sort in memory instead of using orderBy in the query
    return members.sort((a, b) => {
      // First try to sort by position if available
      if (a.position && b.position) {
        return a.position.localeCompare(b.position)
      }
      // Fall back to sorting by name
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    console.error("Error getting committee members by type:", error)
    // Provide a more user-friendly error message
    if (error instanceof Error) {
      if (error.message.includes("requires an index")) {
        throw new Error(
          "Database index not configured. Please contact the administrator to set up the required database indexes.",
        )
      }
    }
    throw error
  }
}

// Get a single committee member by ID
export async function getCommitteeMemberById(id: string): Promise<CommitteeMember | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        name: data.name || "",
        position: data.position || "",
        type: data.type || "committee",
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        imageUrl: data.imageUrl,
        term: data.term,
        achievements: data.achievements || [],
        joinDate: data.joinDate,
        endDate: data.endDate,
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    }
    return null
  } catch (error) {
    console.error("Error getting committee member:", error)
    throw error
  }
}

// Add a new committee member
export async function addCommitteeMember(member: Omit<CommitteeMember, "id">): Promise<string> {
  try {
    const memberData = {
      ...member,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), memberData)
    return docRef.id
  } catch (error) {
    console.error("Error adding committee member:", error)
    throw error
  }
}

// Update an existing committee member
export async function updateCommitteeMember(id: string, member: Partial<CommitteeMember>): Promise<void> {
  try {
    // Clean up the member object to remove undefined values
    const updateData: Record<string, any> = {}

    Object.entries(member).forEach(([key, value]) => {
      // Only include defined values
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    // Add the timestamp
    updateData.updatedAt = serverTimestamp()

    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Error updating committee member:", error)
    throw error
  }
}

// Delete a committee member
export async function deleteCommitteeMember(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting committee member:", error)
    throw error
  }
}

// Get active committee members
export async function getActiveCommitteeMembers(): Promise<CommitteeMember[]> {
  try {
    const committeeRef = collection(db, COLLECTION_NAME)
    const q = query(committeeRef, where("isActive", "==", true), where("type", "==", "committee"))
    const querySnapshot = await getDocs(q)

    const members = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        position: data.position || "",
        type: data.type || "committee",
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        imageUrl: data.imageUrl,
        term: data.term,
        achievements: data.achievements || [],
        joinDate: data.joinDate,
        endDate: data.endDate,
        isActive: true,
      }
    })

    // Sort in memory
    return members.sort((a, b) => a.position.localeCompare(b.position))
  } catch (error) {
    console.error("Error getting active committee members:", error)
    throw error
  }
}
