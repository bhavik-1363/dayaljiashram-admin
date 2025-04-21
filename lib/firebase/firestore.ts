import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

// Generic function to convert Firestore timestamps to ISO strings
export const convertTimestamps = (data: any): any => {
  if (!data) return data

  if (data instanceof Timestamp) {
    return data.toDate().toISOString()
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertTimestamps(item))
  }

  if (typeof data === "object") {
    const result: Record<string, any> = {}
    for (const key in data) {
      result[key] = convertTimestamps(data[key])
    }
    return result
  }

  return data
}

// Generic function to add a document with auto-generated ID
export const addDocument = async <T extends DocumentData>(collectionName: string, data: T): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error)
    throw error
  }
}

// Generic function to add a document with a specific ID
export const setDocument = async <T extends DocumentData>(
  collectionName: string,
  id: string,
  data: T,
): Promise<void> => {
  try {
    await setDoc(doc(db, collectionName, id), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error)
    throw error
  }
}

// Generic function to update a document
export const updateDocument = async <T extends Partial<DocumentData>>(
  collectionName: string,
  id: string,
  data: T,
): Promise<void> => {
  try {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error)
    throw error
  }
}

// Generic function to delete a document
export const deleteDocument = async (collectionName: string, id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, collectionName, id))
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error)
    throw error
  }
}

// Generic function to get a document by ID
export const getDocument = async <T>(
  collectionName: string,
  id: string
)
: Promise<T | null> =>
{
  try {
    const docSnap = await getDoc(doc(db, collectionName, id))
    if (docSnap.exists()) {
      const data = docSnap.data() as T
      return convertTimestamps({ id: docSnap.id, ...data }) as T
    }
    return null
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error)
    throw error
  }
}

// Generic function to get all documents from a collection
export const getDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
)
: Promise<T[]> =>
{
  try {
    const q = query(collection(db, collectionName), ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      return convertTimestamps({ id: doc.id, ...doc.data() }) as T
    })
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error)
    throw error
  }
}

// Helper function to create query constraints
export { where, orderBy, limit, startAfter }
