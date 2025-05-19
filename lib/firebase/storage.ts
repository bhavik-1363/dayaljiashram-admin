import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

// Upload a file to Firebase Storage
export async function uploadFile(
  path: string,
  file: File,
  progressCallback?: (progress: number) => void,
): Promise<string> {
  const storageRef = ref(storage, path)
  const uploadTask = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        if (progressCallback) {
          progressCallback(progress)
        }
      },
      (error) => {
        console.error("Error uploading file:", error)
        reject(error)
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(storageRef)
          resolve(downloadURL)
        } catch (error) {
          console.error("Error getting download URL:", error)
          reject(error)
        }
      },
    )
  })
}
// Upload a profile image and return the download URL
export async function uploadProfileImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  try {
    const storageRef = ref(storage, path)
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
          console.error("Error uploading file:", error)
          reject(error)
        },
        async () => {
          try {
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
    console.error("Error in uploadProfileImage:", error)
    throw error
  }
}

// Delete a file from storage
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}


export async function uploadNewsEventMedia(
  path: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const storageRef = ref(storage, path)
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
        console.error("Error uploading file:", error)
        reject(error)
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(storageRef)
          resolve(downloadURL)
        } catch (error) {
          console.error("Error getting download URL:", error)
          reject(error)
        }
      },
    )
  })
}

export const generateFilePath = (folderName: string, fileName: string): string => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 15);
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
  return `${folderName}/${timestamp}-${randomString}-${cleanFileName}`;
};
