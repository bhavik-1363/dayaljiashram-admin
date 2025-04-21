import { db } from "@/lib/firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  // where,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import {
  addDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  where
} from "@/lib/firebase/firestore";
import {
  generateFilePath,
  uploadFile as uploadStorageFile
} from "@/lib/firebase/storage";

// Define the Hostel type
export interface Hostel {
  id?: string;
  name: string;
  description: string;
  type: "boys" | "girls";
  location: string;
  facilities: string[];
  roomTypes: string[];
  roomFeatures: string[];
  contactInfo: string;
  images: string[];
  status: "active" | "inactive" | "maintenance";
  // capacity?: string;
  // openingHours?: string;
  // additionalInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Collection name in Firestore
const COLLECTION_NAME = "hostels";

// Check if we should use mock data
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

// Mock data for testing without Firebase
const mockHostels: Record<string, Hostel> = {
  boys: {
    id: "boys",
    name: "Boys Hostel",
    description:
      "Our Boys Hostel provides a safe, comfortable, and supportive environment for students.",
    type: "boys",
    location: "North Campus, Building A",
    facilities: [
      "Wi-Fi",
      "24/7 Security",
      "Laundry Service",
      "Study Rooms",
      "Recreation Area",
      "Dining Hall",
      "Power Backup"
    ],
    roomTypes: ["single", "double", "triple"],
    roomFeatures: [
      "Attached Bathroom",
      "Study Table",
      "Wardrobe",
      "Bed with Mattress",
      "Bookshelf",
      "Fan",
      "Chair"
    ],
    contactInfo:
      "Warden: Mr. Rajesh Patel\nPhone: (555) 123-4567\nEmail: boyshostel@community.org\nOffice Hours: Monday-Saturday 9am-5pm",
    images: [],
    status: "active"
  },
  girls: {
    id: "girls",
    name: "Girls Hostel",
    description:
      "Our Girls Hostel offers a secure and nurturing environment for female students.",
    type: "girls",
    location: "North Campus, Building B",
    facilities: [
      "Wi-Fi",
      "24/7 Security",
      "Laundry Service",
      "Study Rooms",
      "Recreation Area",
      "Dining Hall",
      "Power Backup",
      "CCTV Surveillance"
    ],
    roomTypes: ["double", "triple"],
    roomFeatures: [
      "Attached Bathroom",
      "Study Table",
      "Wardrobe",
      "Bed with Mattress",
      "Bookshelf",
      "Fan",
      "Chair",
      "Mirror"
    ],
    contactInfo:
      "Warden: Mrs. Priya Sharma\nPhone: (555) 987-6543\nEmail: girlshostel@community.org\nOffice Hours: Monday-Saturday 9am-5pm",
    images: [],
    status: "active"
  }
};

// Get all hostels
export const getAllHostels = async (): Promise<Hostel[]> => {
  if (useMockData) {
    return Object.values(mockHostels);
  }

  try {
    const hostelRef = collection(db, COLLECTION_NAME);
    const querySnapshot = await getDocs(hostelRef);
    const hostels = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        type: data.type,
        location: data.location,
        facilities: data.facilities,
        roomTypes: data.roomTypes,
        roomFeatures: data.roomFeatures,
        contactInfo: data.contactInfo,
        images: data.images,
        status: data.status,
        // capacity: data.capacity,
        // openingHours: data.openingHours,
        // additionalInfo: data.additionalInfo,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });
    return hostels.sort((a, b) => a.name.localeCompare(b.name)); // Sort by name
  } catch (error) {
    console.error("Error getting all hostels:", error);
    return [];
  }
};

// Get hostel by ID
export const getHostelById = async (id: string): Promise<Hostel | null> => {
  if (useMockData) {
    return mockHostels[id] || null;
  }

  try {
    const hostelRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(hostelRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        type: data.type,
        location: data.location,
        facilities: data.facilities,
        roomTypes: data.roomTypes,
        roomFeatures: data.roomFeatures,
        contactInfo: data.contactInfo,
        images: data.images,
        status: data.status,
        // capacity: data.capacity,
        // openingHours: data.openingHours,
        // additionalInfo: data.additionalInfo,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    }
    return null;
  } catch (error) {
    console.error(`Error getting hostel by ID ${id}:`, error);
    return null;
  }
};

// Get hostel by type
export const getHostelByType = async (
  type: "boys" | "girls"
): Promise<Hostel | null> => {
  if (useMockData) {
    return (
      Object.values(mockHostels).find((hostel) => hostel.type === type) || null
    );
  }

  try {
    const hostelRef = collection(db, COLLECTION_NAME);
    const q = query(hostelRef, where("type", "==", type));
    const querySnapshot = await getDocs(q);
    const hostels = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        type: data.type,
        location: data.location,
        facilities: data.facilities,
        roomTypes: data.roomTypes,
        roomFeatures: data.roomFeatures,
        contactInfo: data.contactInfo,
        images: data.images,
        status: data.status,
        // capacity: data.capacity,
        // openingHours: data.openingHours,
        // additionalInfo: data.additionalInfo,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });
    return hostels.length > 0 ? hostels[0] : null;
  } catch (error) {
    console.error(`Error getting hostel by type ${type}:`, error);
    return null;
  }
};

// Update or create a hostel by type
export const updateOrCreateHostelByType = async (
  type: "boys" | "girls",
  hostel: Hostel
): Promise<string> => {
  if (useMockData) {
    mockHostels[type] = { ...hostel, id: type, type };
    return type;
  }

  try {
    const hostelRef = collection(db, COLLECTION_NAME);
    const q = query(hostelRef, where("type", "==", type));
    const existingHostels = await getDocs(q);
    // First check if a hostel with this type already exists
    // const constraints: QueryConstraint[] = [where("type", "==", type)];
    // const existingHostels = await getDocuments<Hostel>(
    //   COLLECTION_NAME,
    //   constraints
    // );

    if (existingHostels.size > 0) {
      // const existingHostel = existingHostels[0];
      const hostelref = doc(db, COLLECTION_NAME, hostel.id!);
      await setDoc(hostelref, hostel);
      // await updateDocument(COLLECTION_NAME, existingHostel.id!, {
      //   ...hostel,
      //   type
      // });
      return hostel.id!;
    } else {
      // Create a new hostel document
      return await addDocument(COLLECTION_NAME, { ...hostel, type });
    }
  } catch (error) {
    console.error(`Error updating or creating hostel by type ${type}:`, error);
    throw error;
  }
};

// Upload a hostel image
export const uploadHostelImage = async (
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> => {
  if (useMockData) {
    // Simulate upload with progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progressCallback) progressCallback(progress);

        if (progress >= 100) {
          clearInterval(interval);
          // Return a placeholder URL for mock data
          resolve(`/placeholder.svg?height=300&width=400&query=${file.name}`);
        }
      }, 300);
    });
  }

  try {
    const filePath = generateFilePath("hostels", file.name);
    return await uploadStorageFile(filePath, file, progressCallback);
  } catch (error) {
    console.error("Error uploading hostel image:", error);
    throw error;
  }
};
