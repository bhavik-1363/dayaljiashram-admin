import { db, storage } from "@/lib/firebase/firebase"
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
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import type { GalleryItem } from "@/components/admin/columns/gallery-columns"

const COLLECTION_NAME = "gallery"
const CATEGORIES_COLLECTION = "gallery_categories"

// Get all gallery items
export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const galleryRef = collection(db, COLLECTION_NAME)
    const q = query(galleryRef, orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        subCategory: data.subCategory || "",
        tags: data.tags || [],
        date: data.date || "",
        media: data.media || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    })
  } catch (error) {
    console.error("Error getting gallery items:", error)
    throw error
  }
}

// Get a single gallery item by ID
export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        subCategory: data.subCategory || "",
        tags: data.tags || [],
        date: data.date || "",
        media: data.media || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    }
    return null
  } catch (error) {
    console.error("Error getting gallery item:", error)
    throw error
  }
}

// Add a new gallery item
export async function addGalleryItem(item: Omit<GalleryItem, "id">): Promise<string> {
  try {
    const galleryItemData = {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), galleryItemData)
    return docRef.id
  } catch (error) {
    console.error("Error adding gallery item:", error)
    throw error
  }
}

// Update an existing gallery item
export async function updateGalleryItem(id: string, item: Partial<GalleryItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const updateData = {
      ...item,
      updatedAt: serverTimestamp(),
    }
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Error updating gallery item:", error)
    throw error
  }
}

// Delete a gallery item
export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    // First, get the gallery item to find media URLs
    const galleryItem = await getGalleryItemById(id)

    // Delete the document from Firestore
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)

    // Delete associated media files from Storage
    if (galleryItem && galleryItem.media && galleryItem.media.length > 0) {
      for (const mediaItem of galleryItem.media) {
        if (mediaItem.url && mediaItem.url.includes("firebasestorage.googleapis.com")) {
          try {
            // Extract the path from the URL
            const url = new URL(mediaItem.url)
            const pathMatch = url.pathname.match(/\/o\/(.+)\?/)
            if (pathMatch && pathMatch[1]) {
              const path = decodeURIComponent(pathMatch[1])
              const fileRef = ref(storage, path)
              await deleteObject(fileRef)
            }
          } catch (deleteError) {
            console.error("Error deleting media file:", deleteError)
            // Continue with other deletions even if one fails
          }
        }
      }
    }
  } catch (error) {
    console.error("Error deleting gallery item:", error)
    throw error
  }
}

// Get gallery items by category
export async function getGalleryItemsByCategory(category: string): Promise<GalleryItem[]> {
  try {
    const galleryRef = collection(db, COLLECTION_NAME)
    const q = query(galleryRef, where("category", "==", category), orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        subCategory: data.subCategory || "",
        tags: data.tags || [],
        date: data.date || "",
        media: data.media || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    })
  } catch (error) {
    console.error("Error getting gallery items by category:", error)
    throw error
  }
}

// Get gallery items by tag
export async function getGalleryItemsByTag(tag: string): Promise<GalleryItem[]> {
  try {
    const galleryRef = collection(db, COLLECTION_NAME)
    const q = query(galleryRef, where("tags", "array-contains", tag), orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        subCategory: data.subCategory || "",
        tags: data.tags || [],
        date: data.date || "",
        media: data.media || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    })
  } catch (error) {
    console.error("Error getting gallery items by tag:", error)
    throw error
  }
}

// Upload gallery media to Firebase Storage
export async function uploadGalleryMedia(
  file: File,
  progressCallback?: (progress: number) => void,
): Promise<{ url: string; path: string }> {
  try {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_")
    const filePath = `gallery/${timestamp}-${randomString}-${cleanFileName}`

    const storageRef = ref(storage, filePath)
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
          console.error("Error uploading gallery media:", error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve({ url: downloadURL, path: filePath })
          } catch (error) {
            console.error("Error getting download URL:", error)
            reject(error)
          }
        },
      )
    })
  } catch (error) {
    console.error("Error in uploadGalleryMedia:", error)
    throw error
  }
}

// Get all gallery categories
export async function getGalleryCategories() {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION)
    const querySnapshot = await getDocs(categoriesRef)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        subCategories: data.subCategories || [],
      }
    })
  } catch (error) {
    console.error("Error getting gallery categories:", error)
    throw error
  }
}

// Add a new gallery category
export async function addGalleryCategory(category: { name: string; subCategories: any[] }) {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...category,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding gallery category:", error)
    throw error
  }
}

// Update a gallery category
export async function updateGalleryCategory(id: string, category: { name: string; subCategories: any[] }) {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id)
    await updateDoc(docRef, {
      ...category,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating gallery category:", error)
    throw error
  }
}

// Delete a gallery category
export async function deleteGalleryCategory(id: string) {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting gallery category:", error)
    throw error
  }
}

// Update all gallery categories
export async function updateAllGalleryCategories(categories: any[]) {
  try {
    // Get existing categories
    const existingCategories = await getGalleryCategories()

    // Delete categories that are not in the new list
    for (const existingCategory of existingCategories) {
      if (!categories.some((c) => c.id === existingCategory.id)) {
        await deleteGalleryCategory(existingCategory.id)
      }
    }

    // Add or update categories
    for (const category of categories) {
      if (category.id && existingCategories.some((c) => c.id === category.id)) {
        // Update existing category
        await updateGalleryCategory(category.id, {
          name: category.name,
          subCategories: category.subCategories || [],
        })
      } else {
        // Add new category
        const newId = await addGalleryCategory({
          name: category.name,
          subCategories: category.subCategories || [],
        })
        // Update the id in the original array for reference
        category.id = newId
      }
    }

    return categories
  } catch (error) {
    console.error("Error updating all gallery categories:", error)
    throw error
  }
}
