"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

// Define the shape of our auth context
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  isInitialized: boolean
}

// User type
interface User {
  id: string
  email: string
  name: string
  role: string
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: () => {},
  isLoading: false,
  isInitialized: false,
})

// Mock admin credentials - in a real app, this would be handled by a backend
const ADMIN_EMAIL = "admin@example.com"
const ADMIN_PASSWORD = "password123"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        localStorage.removeItem("user")
      } finally {
        setIsInitialized(true)
      }
    }

    checkAuth()
  }, [])

  // Handle protected routes
  useEffect(() => {
    if (!isInitialized) return

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
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, validate credentials against an API
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const user = { id: "1", name: "Admin User", email, role: "admin" }
        setUser(user)

        // Store in localStorage for persistence
        localStorage.setItem("user", JSON.stringify(user))

        return { success: true }
      } else {
        return {
          success: false,
          error: "Invalid email or password",
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        isInitialized,
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
