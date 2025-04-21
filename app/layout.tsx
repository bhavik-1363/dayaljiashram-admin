import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/firebase/auth-context"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dayalji Ashram Admin Panel",
  description: "Admin panel for managing community resources of dayalji ashram",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Dayalji Ashram Admin Panel",
    description: "Admin panel for managing community resources of dayalji ashram",
    url: "https://dayalji-ashram-admin.vercel.app",
    siteName: "Dayalji Ashram Admin Panel",
    // images: [
    //   {
    //     url: "/og.png",
    //     width: 800,
    //     height: 600,
    //     alt: "Dayalji Ashram Admin Panel",
    //   },
    // ],
    locale: "en-IN",
    type: "website",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'