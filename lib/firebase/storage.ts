import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase"

export const uploadFile = async (filePath: string, file: File): Promise<string> => {
  try {
    if (!storage) {
      throw new Error("Firebase Storage is not initialized")
    }

    const storageRef = ref(storage, filePath)
    const snapshot = await uploadBytesResumable(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error("Error uploading file to Firebase Storage:", error)
    throw error
  }
}

export const uploadProfileImage = async (
  file: File,
  filePath: string,
  progressCallback?: (progress: number) => void,
): Promise<string> => {
  try {
    if (!storage) {
      throw new Error("Firebase Storage is not initialized")
    }

    const storageRef = ref(storage, filePath)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        progressCallback?.(progress)
      },
      (error) => {
        console.error("Upload error:", error)
        throw error
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        return downloadURL
      },
    )

    return await getDownloadURL(uploadTask.snapshot.ref)
  } catch (error) {
    console.error("Error uploading profile image to Firebase Storage:", error)
    throw error
  }
}

export const uploadNewsEventMedia = async (
  filePath: string,
  file: File,
  progressCallback?: (progress: number) => void,
): Promise<string> => {
  try {
    if (!storage) {
      throw new Error("Firebase Storage is not initialized")
    }

    const storageRef = ref(storage, filePath)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        progressCallback?.(progress)
      },
      (error) => {
        console.error("Upload error:", error)
        throw error
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        return downloadURL
      },
    )

    return await getDownloadURL(uploadTask.snapshot.ref)
  } catch (error) {
    console.error("Error uploading news event media to Firebase Storage:", error)
    throw error
  }
}

export const generateFilePath = (folderName: string, fileName: string): string => {
  const timestamp = new Date().getTime()
  const randomString = Math.random().toString(36).substring(2, 15)
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, "_")
  return `${folderName}/${timestamp}-${randomString}-${cleanFileName}`
}
