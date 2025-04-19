import { db } from "@/lib/firebase/firebase"
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { getMembersService } from "./members-service"
import type { Member } from "@/components/admin/columns/member-columns"

// Define the verification request status types
export type VerificationStatus = "pending" | "approved" | "rejected"

// Define the verification request interface
export interface VerificationRequest {
  id: string
  memberId: string
  requestedBy: string
  requestedAt: Timestamp | string
  status: VerificationStatus
  changes: Partial<Member>
  originalData?: Partial<Member>
  reviewedBy?: string
  reviewedAt?: Timestamp | string
  reviewNotes?: string
}

// Interface for the verification service
interface VerificationService {
  // Get all verification requests
  getVerificationRequests: () => Promise<VerificationRequest[]>

  // Get verification requests for a specific member
  getMemberVerificationRequests: (memberId: string) => Promise<VerificationRequest[]>

  // Get a specific verification request
  getVerificationRequest: (id: string) => Promise<VerificationRequest | null>

  // Create a new verification request
  createVerificationRequest: (memberId: string, changes: Partial<Member>) => Promise<string>

  // Approve a verification request
  approveVerificationRequest: (id: string, reviewedBy: string, notes?: string) => Promise<void>

  // Reject a verification request
  rejectVerificationRequest: (id: string, reviewedBy: string, notes?: string) => Promise<void>

  // Cancel a verification request
  cancelVerificationRequest: (id: string) => Promise<void>
}

// Firebase implementation of the verification service
class FirebaseVerificationService implements VerificationService {
  async getVerificationRequests(): Promise<VerificationRequest[]> {
    try {
      const verificationRef = collection(db, "verification_requests")
      const q = query(verificationRef, orderBy("requestedAt", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          requestedAt:
            data.requestedAt instanceof Timestamp ? data.requestedAt.toDate().toISOString() : data.requestedAt,
          reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
        } as VerificationRequest
      })
    } catch (error) {
      console.error("Error getting verification requests:", error)
      throw error
    }
  }

  async getMemberVerificationRequests(memberId: string): Promise<VerificationRequest[]> {
    try {
      const verificationRef = collection(db, "verification_requests")
      const q = query(verificationRef, where("memberId", "==", memberId), orderBy("requestedAt", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          requestedAt:
            data.requestedAt instanceof Timestamp ? data.requestedAt.toDate().toISOString() : data.requestedAt,
          reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
        } as VerificationRequest
      })
    } catch (error) {
      console.error("Error getting member verification requests:", error)
      throw error
    }
  }

  async getVerificationRequest(id: string): Promise<VerificationRequest | null> {
    try {
      const verificationRef = doc(db, "verification_requests", id)
      const verificationDoc = await getDoc(verificationRef)

      if (!verificationDoc.exists()) {
        return null
      }

      const data = verificationDoc.data()
      return {
        id: verificationDoc.id,
        ...data,
        requestedAt: data.requestedAt instanceof Timestamp ? data.requestedAt.toDate().toISOString() : data.requestedAt,
        reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
      } as VerificationRequest
    } catch (error) {
      console.error("Error getting verification request:", error)
      throw error
    }
  }

  async createVerificationRequest(memberId: string, changes: Partial<Member>): Promise<string> {
    try {
      // First, get the current member data to store as original data
      const membersService = getMembersService()
      const member = await membersService.getMember(memberId)

      if (!member) {
        throw new Error(`Member with ID ${memberId} not found`)
      }

      // Create a clean object with only the fields that are being changed
      const changesObj: Partial<Member> = {}
      const originalObj: Partial<Member> = {}

      // Compare and only include fields that are different
      Object.keys(changes).forEach((key) => {
        const typedKey = key as keyof Member
        if (changes[typedKey] !== undefined && JSON.stringify(changes[typedKey]) !== JSON.stringify(member[typedKey])) {
          changesObj[typedKey] = changes[typedKey]
          originalObj[typedKey] = member[typedKey]
        }
      })

      // If there are no changes, don't create a verification request
      if (Object.keys(changesObj).length === 0) {
        throw new Error("No changes detected")
      }

      // Create the verification request
      const verificationRef = collection(db, "verification_requests")
      const verificationData = {
        memberId,
        requestedBy: member.email, // Assuming the member's email is used as the identifier
        requestedAt: serverTimestamp(),
        status: "pending" as VerificationStatus,
        changes: changesObj,
        originalData: originalObj,
      }

      const docRef = await addDoc(verificationRef, verificationData)
      return docRef.id
    } catch (error) {
      console.error("Error creating verification request:", error)
      throw error
    }
  }

  async approveVerificationRequest(id: string, reviewedBy: string, notes?: string): Promise<void> {
    try {
      // Get the verification request
      const verificationRef = doc(db, "verification_requests", id)
      const verificationDoc = await getDoc(verificationRef)

      if (!verificationDoc.exists()) {
        throw new Error(`Verification request with ID ${id} not found`)
      }

      const verificationData = verificationDoc.data() as VerificationRequest

      // Update the member with the approved changes
      const membersService = getMembersService()
      await membersService.updateMember(verificationData.memberId, verificationData.changes)

      // Update the verification request status
      await updateDoc(verificationRef, {
        status: "approved",
        reviewedBy,
        reviewedAt: serverTimestamp(),
        reviewNotes: notes || "",
      })
    } catch (error) {
      console.error("Error approving verification request:", error)
      throw error
    }
  }

  async rejectVerificationRequest(id: string, reviewedBy: string, notes?: string): Promise<void> {
    try {
      const verificationRef = doc(db, "verification_requests", id)

      // Update the verification request status
      await updateDoc(verificationRef, {
        status: "rejected",
        reviewedBy,
        reviewedAt: serverTimestamp(),
        reviewNotes: notes || "",
      })
    } catch (error) {
      console.error("Error rejecting verification request:", error)
      throw error
    }
  }

  async cancelVerificationRequest(id: string): Promise<void> {
    try {
      const verificationRef = doc(db, "verification_requests", id)
      await deleteDoc(verificationRef)
    } catch (error) {
      console.error("Error canceling verification request:", error)
      throw error
    }
  }
}

// Export the service
export function getVerificationService(): VerificationService {
  return new FirebaseVerificationService()
}
