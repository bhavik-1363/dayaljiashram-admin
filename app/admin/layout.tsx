"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { ActionProvider } from "@/components/admin/action-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isInitialized, user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push("/login")
      } else {
        setIsLoading(false)
      }
    }
  }, [isAuthenticated, isInitialized, router])

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
        setError("Loading timed out. There might be an issue with authentication.")
      }
    }, 5000) // 5 seconds timeout

    return () => clearTimeout(timer)
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Back to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ActionProvider>
      <SidebarProvider>
        <div className="flex h-screen w-screen">
          <AdminSidebar />
          <div className="flex flex-1 flex-col">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ActionProvider>
  )
}
