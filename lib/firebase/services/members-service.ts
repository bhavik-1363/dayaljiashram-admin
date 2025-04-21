import { db, storage } from "@/lib/firebase/firebase"
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import type { Member } from "@/components/admin/columns/member-columns"
import { getVerificationService } from "./verification-service"

// Add this helper function at the top of the file, after the imports
function isValidDate(dateValue: any): boolean {
  if (!dateValue) return false

  // Handle Firestore Timestamp objects
  if (typeof dateValue === "object" && dateValue !== null && "seconds" in dateValue) {
    return true
  }

  // Handle ISO strings or other date formats
  try {
    const date = new Date(dateValue)
    return !isNaN(date.getTime())
  } catch (error) {
    console.error("Error validating date:", error)
    return false
  }
}

// Helper function to determine MIME type from file extension
function getMimeTypeFromFileName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }

  return mimeTypes[extension] || "application/octet-stream"
}

// Interface for the members service
interface MembersService {
  getMembers: () => Promise<Member[]>
  getMember: (id: string) => Promise<Member | null>
  addMember: (member: Partial<Member>) => Promise<Member>
  updateMember: (id: string, member: Partial<Member>) => Promise<Member>
  deleteMember: (id: string) => Promise<void>
  uploadProfileImage: (file: File) => Promise<string>
  deleteProfileImage: (url: string) => Promise<void>
  requestVerification: (id: string, changes: Partial<Member>) => Promise<string>
}

// Firebase implementation of the members service
class FirebaseMembersService implements MembersService {
  async getMembers(): Promise<Member[]> {
    try {
      console.log("FirebaseMembersService: Getting members from Firestore")

      // Check if Firestore is available
      if (!db) {
        console.error("FirebaseMembersService: Firestore is not initialized")
        throw new Error("Firestore is not initialized")
      }

      const membersRef = collection(db, "members")
      const q = query(membersRef, orderBy("joinDate", "desc"), limit(100))

      console.log("FirebaseMembersService: Executing Firestore query")
      const snapshot = await getDocs(q)

      console.log(`FirebaseMembersService: Got ${snapshot.docs.length} members`)

      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          joinDate: data.joinDate?.toDate()?.toISOString() || new Date().toISOString(),
          birthdate: data.birthdate?.toDate()?.toISOString() || null,
          lastUpdated: data.lastUpdated?.toDate()?.toISOString() || null,
        } as Member
      })
    } catch (error) {
      console.error("FirebaseMembersService: Error getting members:", error)
      throw error
    }
  }

  async getMember(id: string): Promise<Member | null> {
    try {
      if (!db) {
        console.error("FirebaseMembersService: Firestore is not initialized")
        throw new Error("Firestore is not initialized")
      }

      const memberRef = doc(db, "members", id)
      const memberDoc = await getDoc(memberRef)

      if (!memberDoc.exists()) {
        return null
      }

      const data = memberDoc.data()
      return {
        id: memberDoc.id,
        ...data,
        joinDate: data.joinDate?.toDate()?.toISOString() || new Date().toISOString(),
        birthdate: data.birthdate?.toDate()?.toISOString() || null,
        lastUpdated: data.lastUpdated?.toDate()?.toISOString() || null,
      } as Member
    } catch (error) {
      console.error("FirebaseMembersService: Error getting member:", error)
      throw error
    }
  }

  async addMember(member: Partial<Member>): Promise<Member> {
    try {
      if (!db) {
        console.error("FirebaseMembersService: Firestore is not initialized")
        throw new Error("Firestore is not initialized")
      }

      const membersRef = collection(db, "members")

      // Create a clean object without undefined values
      const cleanMember: Record<string, any> = {}

      // Only include defined values and convert dates
      Object.entries(member).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === "joinDate" && value) {
            if (isValidDate(value)) {
              cleanMember[key] = new Date(value)
            } else {
              console.warn(`Invalid joinDate value: ${value}, using current date instead`)
              cleanMember[key] = new Date()
            }
          } else if (key === "dateOfBirth" && value) {
            if (isValidDate(value)) {
              cleanMember[key] = new Date(value)
            } else {
              console.warn(`Invalid dateOfBirth value: ${value}, skipping field`)
            }
          } else {
            cleanMember[key] = value
          }
        }
      })

      // Add timestamps
      const memberWithTimestamps = {
        ...cleanMember,
        joinDate: cleanMember.joinDate || new Date(),
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      }

      console.log("FirebaseMembersService: Adding member to Firestore:", memberWithTimestamps)
      const docRef = await addDoc(membersRef, memberWithTimestamps)
      console.log("FirebaseMembersService: Member added with ID:", docRef.id)

      // Get the newly created document
      const newMemberDoc = await getDoc(docRef)
      const newMemberData = newMemberDoc.data()

      return {
        id: docRef.id,
        ...newMemberData,
        joinDate: newMemberData?.joinDate?.toDate()?.toISOString() || new Date().toISOString(),
        birthdate: newMemberData?.birthdate?.toDate()?.toISOString() || null,
        lastUpdated: newMemberData?.lastUpdated?.toDate()?.toISOString() || null,
      } as Member
    } catch (error) {
      console.error("FirebaseMembersService: Error adding member:", error)
      throw error
    }
  }

  async updateMember(id: string, member: Partial<Member>): Promise<Member> {
    try {
      if (!db) {
        console.error("FirebaseMembersService: Firestore is not initialized")
        throw new Error("Firestore is not initialized")
      }

      const memberRef = doc(db, "members", id)

      // Create a clean object without undefined values
      const cleanMember: Record<string, any> = {}

      // Only include defined values
      Object.entries(member).forEach(([key, value]) => {
        if (value !== undefined) {
          // Convert dates to Date objects with validation
          if (key === "joinDate" && value) {
            if (isValidDate(value)) {
              cleanMember[key] = new Date(value)
            } else {
              console.warn(`Invalid joinDate value: ${value}, skipping field`)
            }
          } else if (key === "dateOfBirth" && value) {
            if (isValidDate(value)) {
              cleanMember[key] = new Date(value)
            } else {
              console.warn(`Invalid dateOfBirth value: ${value}, skipping field`)
            }
          } else {
            cleanMember[key] = value
          }
        }
      })

      // Add timestamp
      const memberWithTimestamp = {
        ...cleanMember,
        lastUpdated: serverTimestamp(),
      }

      console.log("Updating member with data:", memberWithTimestamp)
      await updateDoc(memberRef, memberWithTimestamp)

      // Get the updated document
      const updatedMemberDoc = await getDoc(memberRef)
      const updatedMemberData = updatedMemberDoc.data()

      return {
        id: updatedMemberDoc.id,
        ...updatedMemberData,
        joinDate: updatedMemberData?.joinDate?.toDate()?.toISOString() || new Date().toISOString(),
        birthdate: updatedMemberData?.birthdate?.toDate()?.toISOString() || null,
        lastUpdated: updatedMemberData?.lastUpdated?.toDate()?.toISOString() || null,
      } as Member
    } catch (error) {
      console.error("FirebaseMembersService: Error updating member:", error)
      throw error
    }
  }

  async deleteMember(id: string): Promise<void> {
    try {
      if (!db || !storage) {
        console.error("FirebaseMembersService: Firestore or Storage is not initialized")
        throw new Error("Firestore or Storage is not initialized")
      }

      // First get the member to check if they have a profile image
      const memberRef = doc(db, "members", id)
      const memberDoc = await getDoc(memberRef)

      if (memberDoc.exists()) {
        const memberData = memberDoc.data()

        // If there's a profile image, delete it from storage
        if (memberData.profileImage) {
          await this.deleteProfileImage(memberData.profileImage)
        }
      }

      // Delete the member document
      await deleteDoc(memberRef)
    } catch (error) {
      console.error("FirebaseMembersService: Error deleting member:", error)
      throw error
    }
  }

  // Completely revised uploadProfileImage method to ensure correct MIME type handling
  async uploadProfileImage(file: File): Promise<string> {
    try {
      if (!storage) {
        console.error("FirebaseMembersService: Storage is not initialized")
        throw new Error("Storage is not initialized")
      }

      // Log file details for debugging
      console.log("Uploading file:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString(),
      })

      // Create a unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_")
      const filePath = `member-profiles/${timestamp}-${randomString}-${safeFileName}`

      const storageRef = ref(storage, filePath)

      // Determine content type - use file.type if available, otherwise infer from filename
      const contentType = file.type || getMimeTypeFromFileName(file.name)
      console.log("Determined content type:", contentType)

      // Set explicit metadata with the content type
      const metadata = {
        contentType: contentType,
        // customMetadata: {
        //   originalName: file.name,
        //   originalType: file.type,
        //   uploadedAt: new Date().toISOString(),
        // },
      }

      console.log("Uploading with metadata:", metadata)

      // Upload the raw file with explicit metadata
      const snapshot = await uploadBytes(storageRef, file, metadata)

      // Verify the metadata was applied correctly
      console.log("Upload complete. Metadata applied:", snapshot.metadata)
      console.log("Content type in metadata:", snapshot.metadata.contentType)

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef)
      console.log("Download URL:", downloadURL)

      return downloadURL
    } catch (error) {
      console.error("FirebaseMembersService: Error uploading profile image:", error)
      throw error
    }
  }

  async deleteProfileImage(url: string): Promise<void> {
    try {
      if (!storage) {
        console.error("FirebaseMembersService: Storage is not initialized")
        throw new Error("Storage is not initialized")
      }

      // Extract the path from the URL
      const urlObj = new URL(url)
      const path = decodeURIComponent(urlObj.pathname.split("/o/")[1].split("?")[0])

      // Create a reference to the file
      const imageRef = ref(storage, path)

      // Delete the file
      await deleteObject(imageRef)
    } catch (error) {
      console.error("FirebaseMembersService: Error deleting profile image:", error)
      throw error
    }
  }

  async requestVerification(id: string, changes: Partial<Member>): Promise<string> {
    try {
      // Use the verification service to create a verification request
      const verificationService = getVerificationService()
      return await verificationService.createVerificationRequest(id, changes)
    } catch (error) {
      console.error("FirebaseMembersService: Error requesting verification:", error)
      throw error
    }
  }
}

// Export the service
export function getMembersService(): MembersService {
  return new FirebaseMembersService()
}

export async function getMembersData(): Promise<Member[]> {
  const membersService = getMembersService()
  return await membersService.getMembers()
}
