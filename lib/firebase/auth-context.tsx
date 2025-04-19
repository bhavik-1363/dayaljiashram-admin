"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { auth } from "./firebase"
import { toast } from "@/components/ui/use-toast"

// Define the shape of our auth context
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
  isInitialized: boolean
  firebaseError: string | null
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  register: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  isLoading: false,
  isInitialized: false,
  firebaseError: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if Firebase auth is available
  const isFirebaseAuthAvailable = !!auth

  // Check for existing session on mount
  useEffect(() => {
    if (!isFirebaseAuthAvailable) {
      setFirebaseError("Firebase Authentication is not properly initialized. Please check your configuration.")
      setIsInitialized(true)
      return () => {}
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setUser(user)
          setIsInitialized(true)

          // Clear the init timeout if auth state is determined
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current)
          }
        },
        (error) => {
          console.error("Auth state change error:", error)
          setFirebaseError(`Authentication error: ${error.message}`)
          setIsInitialized(true)

          // Clear the init timeout if auth state is determined
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current)
          }
        },
      )

      return () => {
        unsubscribe()

        // Clear the init timeout on cleanup
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current)
        }
      }
    } catch (error: any) {
      console.error("Error setting up auth listener:", error)
      setFirebaseError(`Error initializing authentication: ${error.message}`)
      setIsInitialized(true)

      // Clear the init timeout if there's an error
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }

      return () => {}
    }
  }, [isFirebaseAuthAvailable])

  // Handle protected routes
  useEffect(() => {
    if (!isInitialized) {
      return
    }

    const isAdminRoute = pathname?.startsWith("/admin")
    const isLoginPage = pathname === "/login"

    if (isAdminRoute && !user) {
      router.push("/login")
    } else if (isLoginPage && user) {
      router.push("/admin")
    }
  }, [isInitialized, user, pathname, router])

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseAuthAvailable) {
      return {
        success: false,
        error: "Firebase Authentication is not properly initialized. Please check your configuration.",
      }
    }

    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: any) {
      console.error("Login error:", error)
      let errorMessage = "An unexpected error occurred. Please try again."

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMessage = "Invalid email or password. Please check your credentials and try again."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later or reset your password."
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled. Please contact an administrator."
      }

      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseAuthAvailable) {
      return {
        success: false,
        error: "Firebase Authentication is not properly initialized. Please check your configuration.",
      }
    }

    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName })
      return { success: true }
    } catch (error: any) {
      console.error("Registration error:", error)
      let errorMessage = "An unexpected error occurred. Please try again."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address"
      }

      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Reset password function
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseAuthAvailable) {
      return {
        success: false,
        error: "Firebase Authentication is not properly initialized. Please check your configuration.",
      }
    }

    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      console.error("Password reset error:", error)
      let errorMessage = "An unexpected error occurred. Please try again."

      if (error.code === "auth/user-not-found") {
        errorMessage = "No user found with this email address"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address"
      }

      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    if (!isFirebaseAuthAvailable) {
      toast({
        title: "Error",
        description: "Firebase Authentication is not properly initialized. Please check your configuration.",
        variant: "destructive",
      })
      return
    }

    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        resetPassword,
        isLoading,
        isInitialized,
        firebaseError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext)
}
