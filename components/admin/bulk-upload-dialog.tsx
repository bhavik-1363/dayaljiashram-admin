"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  SkipForward,
  Info,
  Download,
  FileSpreadsheet,
  Database,
  ArrowRight,
} from "lucide-react"
import * as XLSX from "xlsx"
import { getMembersService } from "@/lib/firebase/services/members-service"
import type { Member } from "@/components/admin/columns/member-columns"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface BulkUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (members: Member[]) => void
}

interface UploadResult {
  success: boolean
  message: string
  data?: any
  duplicate?: boolean
  existingMember?: Member
}

interface DuplicateEntry {
  row: number
  newData: any
  existingMember: Member
  action: DuplicateAction
  score: number
  reasons: string[]
  confidenceLevel: "high" | "medium" | "low"
}

type DuplicateAction = "skip" | "update" | "create"

// Batch size for processing records
const BATCH_SIZE = 50

export function BulkUploadDialog({ open, onOpenChange, onSuccess }: BulkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<UploadResult[]>([])
  const [duplicates, setDuplicates] = useState<DuplicateEntry[]>([])
  const [overallStatus, setOverallStatus] = useState<"idle" | "success" | "error" | "duplicates" | "confirmation">(
    "idle",
  )
  const [existingMembers, setExistingMembers] = useState<Member[]>([])
  const [duplicateAction, setDuplicateAction] = useState<DuplicateAction>("skip")
  const [activeTab, setActiveTab] = useState("upload")
  const [fileData, setFileData] = useState<{
    totalRecords: number
    validRecords: number
    invalidRecords: number
    duplicateRecords: number
  } | null>(null)
  const [currentBatch, setCurrentBatch] = useState<number>(0)
  const [totalBatches, setTotalBatches] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const jsonDataRef = useRef<any[]>([])

  // Fetch existing members when the dialog opens
  useEffect(() => {
    if (open) {
      fetchExistingMembers()
    }
  }, [open])

  const fetchExistingMembers = async () => {
    try {
      const membersService = getMembersService()
      const members = await membersService.getMembers()
      setExistingMembers(members)
    } catch (error) {
      console.error("Error fetching existing members:", error)
    }
  }

  const resetState = () => {
    setFile(null)
    setUploading(false)
    setAnalyzing(false)
    setProgress(0)
    setResults([])
    setDuplicates([])
    setOverallStatus("idle")
    setActiveTab("upload")
    setFileData(null)
    setCurrentBatch(0)
    setTotalBatches(0)
    jsonDataRef.current = []
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setResults([])
      setDuplicates([])
      setOverallStatus("idle")
      setFileData(null)
      jsonDataRef.current = []
    }
  }

  // Helper function to safely parse dates
  const safeParseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null

    try {
      // Handle Excel serial dates (numbers)
      if (typeof dateValue === "number") {
        // Excel dates are days since 1900-01-01 (except for the leap year bug)
        // JavaScript dates are milliseconds since 1970-01-01
        const excelEpoch = new Date(1900, 0, 1)
        const daysSinceEpoch = dateValue - 1 // Excel counts from 1, JS from 0
        const millisecondsSinceEpoch = daysSinceEpoch * 24 * 60 * 60 * 1000
        return new Date(excelEpoch.getTime() + millisecondsSinceEpoch)
      }

      // Handle string dates
      if (typeof dateValue === "string") {
        // Try to parse ISO format first
        const date = new Date(dateValue)
        if (!isNaN(date.getTime())) {
          return date
        }

        // Try to parse DD/MM/YYYY format
        const parts = dateValue.split(/[/\-.]/)
        if (parts.length === 3) {
          // Try different date formats
          const formats = [
            // MM/DD/YYYY
            new Date(Number.parseInt(parts[2]), Number.parseInt(parts[0]) - 1, Number.parseInt(parts[1])),
            // DD/MM/YYYY
            new Date(Number.parseInt(parts[2]), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[0])),
            // YYYY/MM/DD
            new Date(Number.parseInt(parts[0]), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[2])),
          ]

          for (const format of formats) {
            if (!isNaN(format.getTime())) {
              return format
            }
          }
        }
      }

      // Handle JavaScript Date objects
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue
      }

      return null
    } catch (error) {
      console.error("Error parsing date:", error, dateValue)
      return null
    }
  }

  // Helper function to safely convert a date to ISO string
  const safeToISOString = (dateValue: any): string | undefined => {
    const date = safeParseDate(dateValue)
    return date ? date.toISOString() : undefined
  }

  const validateMemberData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Required fields
    if (!data.name) errors.push("Name is required")
    if (!data.email && !data.mobile) errors.push("Either email or mobile is required")

    // Email format validation (if provided)
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email format")
    }

    // Mobile format validation (basic)
    if (data.mobile && !/^\d{10}$/.test(String(data.mobile).replace(/\D/g, ""))) {
      errors.push("Mobile should be a 10-digit number")
    }

    // Date validation
    if (data.joinDate) {
      const joinDate = safeParseDate(data.joinDate)
      if (!joinDate) {
        errors.push("Invalid join date format")
      }
    }

    if (data.dateOfBirth) {
      const birthDate = safeParseDate(data.dateOfBirth)
      if (!birthDate) {
        errors.push("Invalid birth date format")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  const checkForDuplicates = (
    rowData: any,
  ): {
    isDuplicate: boolean
    existingMember?: Member
    score: number
    reasons: string[]
    confidenceLevel: "high" | "medium" | "low"
  } => {
    let highestScore = 0
    let bestMatch: Member | undefined
    let matchReasons: string[] = []

    // Check for exact email match (highest priority)
    if (rowData.email) {
      const emailMatch = existingMembers.find(
        (member) => member.email && member.email.toLowerCase() === rowData.email.toLowerCase(),
      )
      if (emailMatch) {
        return {
          isDuplicate: true,
          existingMember: emailMatch,
          score: 100,
          reasons: ["Exact email match"],
          confidenceLevel: "high",
        }
      }
    }

    // Check for exact mobile match (high priority)
    if (rowData.mobile) {
      const mobileStr = String(rowData.mobile).replace(/\D/g, "")
      const mobileMatch = existingMembers.find(
        (member) => member.mobile && String(member.mobile).replace(/\D/g, "") === mobileStr,
      )
      if (mobileMatch) {
        return {
          isDuplicate: true,
          existingMember: mobileMatch,
          score: 95,
          reasons: ["Exact mobile number match"],
          confidenceLevel: "high",
        }
      }
    }

    // Check for name + other field matches
    for (const member of existingMembers) {
      let score = 0
      const reasons: string[] = []

      // Name similarity (using simple comparison for now)
      if (rowData.name && member.name) {
        const nameSimilarity = calculateNameSimilarity(rowData.name, member.name)
        if (nameSimilarity > 0.8) {
          score += nameSimilarity * 40 // Name is worth up to 40 points
          reasons.push(`Similar name (${Math.round(nameSimilarity * 100)}% match)`)
        }
      }

      // Partial email match
      if (rowData.email && member.email && rowData.email.includes("@") && member.email.includes("@")) {
        const [rowEmailName] = rowData.email.split("@")
        const [memberEmailName] = member.email.split("@")
        if (rowEmailName === memberEmailName) {
          score += 20
          reasons.push("Email username match")
        }
      }

      // Address similarity
      if (rowData.postal_city && member.postal_address?.city) {
        if (rowData.postal_city.toLowerCase() === member.postal_address.city.toLowerCase()) {
          score += 10
          reasons.push("Same city")
        }
      }

      // Date of birth match
      if (rowData.dateOfBirth && member.dateOfBirth) {
        try {
          const rowDob = safeParseDate(rowData.dateOfBirth)
          const memberDob = safeParseDate(member.dateOfBirth)

          if (rowDob && memberDob) {
            const rowDobStr = rowDob.toISOString().split("T")[0]
            const memberDobStr = memberDob.toISOString().split("T")[0]

            if (rowDobStr === memberDobStr) {
              score += 20
              reasons.push("Same date of birth")
            }
          }
        } catch (error) {
          console.error("Error comparing dates of birth:", error)
        }
      }

      if (score > highestScore) {
        highestScore = score
        bestMatch = member
        matchReasons = reasons
      }
    }

    // Determine confidence level
    let confidenceLevel: "high" | "medium" | "low" = "low"
    if (highestScore >= 80) {
      confidenceLevel = "high"
    } else if (highestScore >= 50) {
      confidenceLevel = "medium"
    }

    return {
      isDuplicate: highestScore >= 50, // Consider it a duplicate if score is at least 50
      existingMember: bestMatch,
      score: highestScore,
      reasons: matchReasons,
      confidenceLevel,
    }
  }

  // Simple name similarity function (could be replaced with more sophisticated algorithm)
  const calculateNameSimilarity = (name1: string, name2: string): number => {
    const n1 = name1.toLowerCase().trim()
    const n2 = name2.toLowerCase().trim()

    if (n1 === n2) return 1.0 // Exact match

    // Check if one name is contained in the other
    if (n1.includes(n2) || n2.includes(n1)) return 0.9

    // Check for name parts match (e.g., "John Smith" vs "Smith, John")
    const parts1 = n1.split(/\s+/)
    const parts2 = n2.split(/\s+/)

    let matchingParts = 0
    for (const part1 of parts1) {
      if (part1.length <= 2) continue // Skip initials or very short parts
      for (const part2 of parts2) {
        if (part2.length <= 2) continue
        if (part1 === part2 || part1.includes(part2) || part2.includes(part1)) {
          matchingParts++
          break
        }
      }
    }

    const maxParts = Math.max(parts1.length, parts2.length)
    return maxParts > 0 ? matchingParts / maxParts : 0
  }

  const processAddressData = (rowData: any, prefix: string) => {
    const address: any = {}

    // Map address fields from the Excel
    const addressFields = [
      "homeNo",
      "address1",
      "address2",
      "landmark",
      "area",
      "postOffice",
      "city",
      "taluka",
      "district",
      "pincode",
    ]

    addressFields.forEach((field) => {
      const excelKey = `${prefix}_${field}`
      if (rowData[excelKey]) {
        address[field] = rowData[excelKey]
      }
    })

    // Only return the address object if it has at least one property
    return Object.keys(address).length > 0 ? address : undefined
  }

  const prepareMemberData = (rowData: any): Partial<Member> => {
    // Process address data
    const postal_address = processAddressData(rowData, "postal")
    const residential_address = processAddressData(rowData, "residential")

    // Prepare member data with safe date handling
    return {
      name: rowData.name,
      email: rowData.email,
      mobile: rowData.mobile?.toString(),
      phoneNo: rowData.phoneNo?.toString(),
      membership_no: rowData.membership_no?.toString(),
      status: rowData.status || "pending",
      role: rowData.role || "Member",
      joinDate: safeToISOString(rowData.joinDate) || new Date().toISOString(),
      dateOfBirth: safeToISOString(rowData.dateOfBirth),
      remarks: rowData.remarks,
      postal_address,
      residential_address,
      occupation: rowData.occupation,
      education: rowData.education,
      bloodGroup: rowData.bloodGroup,
      maritalStatus: rowData.maritalStatus,
      gender: rowData.gender,
      fatherName: rowData.fatherName,
      motherName: rowData.motherName,
      spouseName: rowData.spouseName,
      emergencyContactName: rowData.emergencyContactName,
      emergencyContactRelation: rowData.emergencyContactRelation,
      emergencyContactPhone: rowData.emergencyContactPhone?.toString(),
      facebookProfile: rowData.facebookProfile,
      twitterHandle: rowData.twitterHandle,
      linkedinProfile: rowData.linkedinProfile,
      instagramHandle: rowData.instagramHandle,
    }
  }

  const handleDuplicateActionChange = (value: DuplicateAction) => {
    setDuplicateAction(value)

    // Apply the selected action to all duplicates
    setDuplicates((prev) =>
      prev.map((dup) => ({
        ...dup,
        action: value,
      })),
    )
  }

  const handleIndividualDuplicateActionChange = (index: number, action: DuplicateAction) => {
    setDuplicates((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        action,
      }
      return updated
    })
  }

  const analyzeExcelData = async () => {
    if (!file) return

    setAnalyzing(true)
    setProgress(0)
    setResults([])
    setDuplicates([])
    setFileData(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]

      // Set raw dates to true to get date objects instead of formatted strings
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true, dateNF: "yyyy-mm-dd" })
      jsonDataRef.current = jsonData

      if (jsonData.length === 0) {
        setResults([{ success: false, message: "No data found in the Excel file" }])
        setOverallStatus("error")
        setAnalyzing(false)
        return
      }

      // Initialize file data summary
      const summary = {
        totalRecords: jsonData.length,
        validRecords: 0,
        invalidRecords: 0,
        duplicateRecords: 0,
      }

      const foundDuplicates: DuplicateEntry[] = []
      const validationErrors: UploadResult[] = []

      // Calculate total batches
      const totalBatches = Math.ceil(jsonData.length / BATCH_SIZE)
      setTotalBatches(totalBatches)

      // Process in batches
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        setCurrentBatch(batchIndex + 1)

        const startIdx = batchIndex * BATCH_SIZE
        const endIdx = Math.min(startIdx + BATCH_SIZE, jsonData.length)
        const batchData = jsonData.slice(startIdx, endIdx)

        for (let i = 0; i < batchData.length; i++) {
          const rowData = batchData[i]
          const overallIndex = startIdx + i

          // Update progress
          setProgress(Math.round(((overallIndex + 1) / jsonData.length) * 100))

          // Validate the data
          const validation = validateMemberData(rowData)

          if (!validation.isValid) {
            summary.invalidRecords++
            validationErrors.push({
              success: false,
              message: `Row ${overallIndex + 2}: ${validation.errors.join(", ")}`,
              data: rowData,
            })
            continue
          }

          summary.validRecords++

          // Check for duplicates with sophisticated algorithm
          const { isDuplicate: isDup, existingMember, score, reasons, confidenceLevel } = checkForDuplicates(rowData)

          if (isDup && existingMember) {
            summary.duplicateRecords++
            foundDuplicates.push({
              row: overallIndex + 2,
              newData: rowData,
              existingMember,
              action: duplicateAction,
              score,
              reasons,
              confidenceLevel,
            })
          }
        }

        // Small delay to allow UI to update
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      // Update file data summary
      setFileData(summary)

      // Set validation errors
      setResults(validationErrors)

      if (foundDuplicates.length > 0) {
        // Sort duplicates by score (highest first)
        foundDuplicates.sort((a, b) => b.score - a.score)
        setDuplicates(foundDuplicates)
        setOverallStatus("duplicates")
        setActiveTab("duplicates")
      } else if (validationErrors.length > 0) {
        setOverallStatus("error")
        setActiveTab("results")
      } else {
        // Show confirmation before proceeding with upload
        setOverallStatus("confirmation")
        setActiveTab("upload")
      }
    } catch (error) {
      console.error("Error analyzing Excel file:", error)
      setResults([
        {
          success: false,
          message: `Failed to analyze Excel file: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ])
      setOverallStatus("error")
    } finally {
      setAnalyzing(false)
      setProgress(100)
    }
  }

  const handleProcessUpload = async () => {
    if (jsonDataRef.current.length === 0) return

    setUploading(true)
    setProgress(0)
    setResults([])

    try {
      const dataToProcess = jsonDataRef.current

      if (dataToProcess.length === 0) {
        setResults([{ success: false, message: "No data found in the Excel file" }])
        setOverallStatus("error")
        setUploading(false)
        return
      }

      const membersService = getMembersService()
      const successfulMembers: Member[] = []
      let hasErrors = false

      // Calculate total batches
      const totalBatches = Math.ceil(dataToProcess.length / BATCH_SIZE)
      setTotalBatches(totalBatches)

      // Process in batches
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        setCurrentBatch(batchIndex + 1)

        const startIdx = batchIndex * BATCH_SIZE
        const endIdx = Math.min(startIdx + BATCH_SIZE, dataToProcess.length)
        const batchData = dataToProcess.slice(startIdx, endIdx)

        for (let i = 0; i < batchData.length; i++) {
          const rowData = batchData[i]
          const overallIndex = startIdx + i

          // Update progress
          setProgress(Math.round(((overallIndex + 1) / dataToProcess.length) * 100))

          // Validate the data
          const validation = validateMemberData(rowData)

          if (!validation.isValid) {
            setResults((prev) => [
              ...prev,
              {
                success: false,
                message: `Row ${overallIndex + 2}: ${validation.errors.join(", ")}`,
                data: rowData,
              },
            ])
            hasErrors = true
            continue
          }

          // Check for duplicates
          const { isDuplicate: isDup, existingMember, score } = checkForDuplicates(rowData)

          // Handle based on duplicate status and action
          if (isDup && existingMember) {
            // Find the action for this duplicate if it exists in our duplicates array
            const duplicateEntry = duplicates.find(
              (d) => d.existingMember.id === existingMember.id && d.row === overallIndex + 2,
            )

            const action = duplicateEntry?.action || duplicateAction

            if (action === "skip") {
              setResults((prev) => [
                ...prev,
                {
                  success: true,
                  message: `Row ${overallIndex + 2}: Skipped ${rowData.name} (duplicate, score: ${score})`,
                  data: rowData,
                  duplicate: true,
                  existingMember,
                },
              ])
              continue
            } else if (action === "update") {
              try {
                // Update the existing member
                const memberData = prepareMemberData(rowData)
                const updatedMember = await membersService.updateMember(existingMember.id, memberData)
                successfulMembers.push(updatedMember)

                setResults((prev) => [
                  ...prev,
                  {
                    success: true,
                    message: `Row ${overallIndex + 2}: Updated ${rowData.name} (duplicate, score: ${score})`,
                    data: updatedMember,
                    duplicate: true,
                    existingMember,
                  },
                ])
              } catch (error) {
                console.error(`Error updating member from row ${overallIndex + 2}:`, error)
                setResults((prev) => [
                  ...prev,
                  {
                    success: false,
                    message: `Row ${overallIndex + 2}: Failed to update ${rowData.name}. ${error instanceof Error ? error.message : "Unknown error"}`,
                    data: rowData,
                    duplicate: true,
                    existingMember,
                  },
                ])
                hasErrors = true
              }
              continue
            }
            // If action is "create", we'll fall through to the create logic below
          }

          try {
            // Prepare and add the member
            const memberData = prepareMemberData(rowData)
            const newMember = await membersService.addMember(memberData)
            successfulMembers.push(newMember)

            setResults((prev) => [
              ...prev,
              {
                success: true,
                message: `Row ${overallIndex + 2}: Added ${rowData.name} successfully`,
                data: newMember,
              },
            ])
          } catch (error) {
            console.error(`Error adding member from row ${overallIndex + 2}:`, error)
            setResults((prev) => [
              ...prev,
              {
                success: false,
                message: `Row ${overallIndex + 2}: Failed to add ${rowData.name}. ${error instanceof Error ? error.message : "Unknown error"}`,
                data: rowData,
              },
            ])
            hasErrors = true
          }
        }

        // Small delay to allow UI to update
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      if (successfulMembers.length > 0) {
        onSuccess(successfulMembers)
      }

      setOverallStatus(hasErrors ? (successfulMembers.length > 0 ? "success" : "error") : "success")
      setActiveTab("results")
    } catch (error) {
      console.error("Error processing Excel file:", error)
      setResults([
        {
          success: false,
          message: `Failed to process Excel file: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ])
      setOverallStatus("error")
    } finally {
      setUploading(false)
      setProgress(100)
    }
  }

  const handleDuplicatesResolved = () => {
    // Show confirmation before proceeding with upload
    setOverallStatus("confirmation")
    setActiveTab("upload")
  }

  const handleClose = () => {
    if (!uploading && !analyzing) {
      resetState()
      onOpenChange(false)
    }
  }

  // Get badge color based on confidence level
  const getConfidenceBadgeColor = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Download template function
  const handleDownloadTemplate = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new()

    // Define the headers and sample data
    const headers = [
      // Basic information
      "name",
      "email",
      "mobile",
      "phoneNo",
      "membership_no",
      "status",
      "role",
      "joinDate",
      "dateOfBirth",
      "remarks",

      // Postal address
      "postal_homeNo",
      "postal_address1",
      "postal_address2",
      "postal_landmark",
      "postal_area",
      "postal_postOffice",
      "postal_city",
      "postal_taluka",
      "postal_district",
      "postal_pincode",

      // Residential address
      "residential_homeNo",
      "residential_address1",
      "residential_address2",
      "residential_landmark",
      "residential_area",
      "residential_postOffice",
      "residential_city",
      "residential_taluka",
      "residential_district",
      "residential_pincode",

      // Additional fields
      "occupation",
      "education",
      "bloodGroup",
      "maritalStatus",
      "fatherName",
      "motherName",
      "spouseName",
      "emergencyContactName",
      "emergencyContactNumber",
      "socialMediaFacebook",
      "socialMediaTwitter",
      "socialMediaLinkedIn",
    ]

    // Sample data
    const sampleData = {
      // Basic information
      name: "John Doe",
      email: "john.doe@example.com",
      mobile: "9876543210",
      phoneNo: "0123456789",
      membership_no: "MEM001",
      status: "active", // active, inactive, pending
      role: "member",
      joinDate: new Date("2023-01-15").toISOString().split("T")[0], // YYYY-MM-DD format
      dateOfBirth: new Date("1985-05-20").toISOString().split("T")[0], // YYYY-MM-DD format
      remarks: "Regular member since 2023",

      // Postal address
      postal_homeNo: "42",
      postal_address1: "Sunshine Apartments",
      postal_address2: "Park Street",
      postal_landmark: "Near Central Park",
      postal_area: "Downtown",
      postal_postOffice: "Central Post",
      postal_city: "Mumbai",
      postal_taluka: "Mumbai City",
      postal_district: "Mumbai",
      postal_pincode: "400001",

      // Residential address
      residential_homeNo: "42",
      residential_address1: "Sunshine Apartments",
      residential_address2: "Park Street",
      residential_landmark: "Near Central Park",
      residential_area: "Downtown",
      residential_postOffice: "Central Post",
      residential_city: "Mumbai",
      residential_taluka: "Mumbai City",
      residential_district: "Mumbai",
      residential_pincode: "400001",

      // Additional fields
      occupation: "Software Engineer",
      education: "B.Tech",
      bloodGroup: "O+",
      maritalStatus: "Married",
      fatherName: "Robert Doe",
      motherName: "Mary Doe",
      spouseName: "Jane Doe",
      emergencyContactName: "Jane Doe",
      emergencyContactNumber: "9876543211",
      socialMediaFacebook: "johndoe",
      socialMediaTwitter: "@johndoe",
      socialMediaLinkedIn: "john-doe",
    }

    // Create worksheet with headers and sample data
    const ws = XLSX.utils.json_to_sheet([sampleData], { header: headers })

    // Set column widths
    const colWidths = headers.map((header) => ({ wch: Math.max(header.length, 15) }))
    ws["!cols"] = colWidths

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Members Template")

    // Generate a blob from the workbook
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "members_template.xlsx"
    document.body.appendChild(a)
    a.click()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)
  }

  // Render confirmation UI
  const renderConfirmation = () => {
    if (!fileData) return null

    const totalToUpload = fileData.validRecords - fileData.duplicateRecords
    const totalToProcess =
      totalToUpload + (duplicates.length > 0 ? duplicates.filter((d) => d.action !== "skip").length : 0)

    // Check if there are any records to process
    const noRecordsToProcess = totalToProcess === 0

    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {noRecordsToProcess ? "No Records to Upload" : "Confirm Upload"}
          </CardTitle>
          <CardDescription>
            {noRecordsToProcess
              ? "All records are duplicates and set to be skipped. No records will be uploaded."
              : "Please review the summary below and confirm to proceed with the upload"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Records:</span>
                <span className="font-bold">{fileData.totalRecords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Valid Records:</span>
                <span className="font-bold text-green-600">{fileData.validRecords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Invalid Records:</span>
                <span className="font-bold text-red-600">{fileData.invalidRecords}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Duplicate Records:</span>
                <span className="font-bold text-yellow-600">{fileData.duplicateRecords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Records to Upload:</span>
                <span className="font-bold text-primary">{totalToProcess}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Records to Skip:</span>
                <span className="font-bold text-gray-600">
                  {duplicates.length > 0 ? duplicates.filter((d) => d.action === "skip").length : 0}
                </span>
              </div>
            </div>
          </div>

          {duplicates.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Duplicate Handling:</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Skip:</span>
                  <span className="font-medium">{duplicates.filter((d) => d.action === "skip").length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Update:</span>
                  <span className="font-medium">{duplicates.filter((d) => d.action === "update").length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Create New:</span>
                  <span className="font-medium">{duplicates.filter((d) => d.action === "create").length}</span>
                </div>
              </div>
            </div>
          )}

          {noRecordsToProcess && (
            <Alert className="mt-4" variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Records to Upload</AlertTitle>
              <AlertDescription>
                All valid records are duplicates and set to be skipped. You can go back to change duplicate handling
                options or cancel the upload.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="bg-primary/5 flex justify-between">
          <Button variant="outline" onClick={() => setOverallStatus("idle")} disabled={uploading}>
            Back
          </Button>
          {noRecordsToProcess ? (
            <Button variant="secondary" onClick={handleClose} className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Cancel Upload
            </Button>
          ) : (
            <Button onClick={handleProcessUpload} disabled={uploading} className="flex items-center gap-2">
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Confirm Upload
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Members</DialogTitle>
          <DialogDescription>Upload an Excel file with member data to add multiple members at once.</DialogDescription>
        </DialogHeader>

        {overallStatus === "confirmation" ? (
          renderConfirmation()
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="duplicates" disabled={duplicates.length === 0}>
                Duplicates {duplicates.length > 0 && `(${duplicates.length})`}
              </TabsTrigger>
              <TabsTrigger value="results" disabled={results.length === 0}>
                Results {results.length > 0 && `(${results.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 py-4">
              <div className="flex flex-col gap-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please use the template file for correct formatting. The Excel file should have columns for name,
                    email, mobile, etc.
                  </AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template</span>
                </Button>

                <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="excel-file" className="text-sm font-medium">
                    Excel File
                  </label>
                  <input
                    id="excel-file"
                    type="file"
                    ref={fileInputRef}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={uploading || analyzing}
                  />
                </div>

                {fileData && (
                  <div className="border rounded-md p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">File Summary</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Records</p>
                        <p className="font-medium text-lg">{fileData.totalRecords}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valid Records</p>
                        <p className="font-medium text-lg text-green-600">{fileData.validRecords}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Invalid Records</p>
                        <p className="font-medium text-lg text-red-600">{fileData.invalidRecords}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duplicates</p>
                        <p className="font-medium text-lg text-yellow-600">{fileData.duplicateRecords}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(analyzing || uploading) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{analyzing ? "Analyzing..." : "Uploading..."}</span>
                      <span>
                        {totalBatches > 0 && `Batch ${currentBatch}/${totalBatches} - `}
                        {progress}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="duplicates" className="space-y-4 py-4">
              {duplicates.length > 0 && (
                <>
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Potential Duplicate Members Found</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        {duplicates.length} potential duplicate members were found in your upload. Please select how you
                        want to handle these duplicates.
                      </p>
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <span className="font-medium">Confidence levels:</span>
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          High
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Medium
                        </Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Low
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Apply to all duplicates:</h3>
                      <RadioGroup
                        value={duplicateAction}
                        onValueChange={(value) => handleDuplicateActionChange(value as DuplicateAction)}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="skip" id="skip-all" />
                          <Label htmlFor="skip-all">Skip</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="update" id="update-all" />
                          <Label htmlFor="update-all">Update</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="create" id="create-all" />
                          <Label htmlFor="create-all">Create New</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-4 max-h-60 overflow-y-auto border rounded-md p-4">
                      {duplicates.map((duplicate, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                Row {duplicate.row}: {duplicate.newData.name}
                              </h4>
                              <Badge variant="outline" className={getConfidenceBadgeColor(duplicate.confidenceLevel)}>
                                {duplicate.confidenceLevel} match ({duplicate.score}%)
                              </Badge>
                            </div>
                            <RadioGroup
                              value={duplicate.action}
                              onValueChange={(value) =>
                                handleIndividualDuplicateActionChange(index, value as DuplicateAction)
                              }
                              className="flex space-x-2"
                            >
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="skip" id={`skip-${index}`} />
                                <Label htmlFor={`skip-${index}`} className="text-xs">
                                  Skip
                                </Label>
                              </div>
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="update" id={`update-${index}`} />
                                <Label htmlFor={`update-${index}`} className="text-xs">
                                  Update
                                </Label>
                              </div>
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="create" id={`create-${index}`} />
                                <Label htmlFor={`create-${index}`} className="text-xs">
                                  Create
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium text-xs mb-1">New Data:</h5>
                              <ul className="space-y-1">
                                <li>
                                  <strong>Name:</strong> {duplicate.newData.name}
                                </li>
                                <li>
                                  <strong>Email:</strong> {duplicate.newData.email || "N/A"}
                                </li>
                                <li>
                                  <strong>Mobile:</strong> {duplicate.newData.mobile || "N/A"}
                                </li>
                                <li>
                                  <strong>Join Date:</strong> {duplicate.newData.joinDate || "N/A"}
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-xs mb-1">Existing Member:</h5>
                              <ul className="space-y-1">
                                <li>
                                  <strong>Name:</strong> {duplicate.existingMember.name}
                                </li>
                                <li>
                                  <strong>Email:</strong> {duplicate.existingMember.email || "N/A"}
                                </li>
                                <li>
                                  <strong>Mobile:</strong> {duplicate.existingMember.mobile || "N/A"}
                                </li>
                                <li>
                                  <strong>Join Date:</strong> {duplicate.existingMember.joinDate || "N/A"}
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="mt-2 text-sm">
                            <h5 className="font-medium text-xs mb-1 flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              Match Reasons:
                            </h5>
                            <ul className="list-disc pl-5 text-xs space-y-0.5">
                              {duplicate.reasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4 py-4">
              {results.length > 0 && (
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  <h3 className="font-medium mb-2">Results:</h3>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 text-sm p-2 rounded ${
                          result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                        }`}
                      >
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{result.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div>
            {overallStatus === "success" && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Upload completed successfully
              </span>
            )}
            {overallStatus === "error" && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Upload completed with errors
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {activeTab === "upload" && overallStatus !== "confirmation" && (
              <>
                <Button variant="outline" onClick={handleClose} disabled={uploading || analyzing}>
                  Cancel
                </Button>
                <Button
                  onClick={analyzeExcelData}
                  disabled={!file || uploading || analyzing}
                  className="flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </>
            )}

            {activeTab === "duplicates" && (
              <>
                <Button variant="outline" onClick={() => setActiveTab("upload")} disabled={uploading}>
                  Back
                </Button>
                <Button onClick={handleDuplicatesResolved} disabled={uploading} className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Continue
                </Button>
              </>
            )}

            {activeTab === "results" && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button onClick={resetState} className="flex items-center gap-2">
                  <SkipForward className="h-4 w-4" />
                  Upload Another File
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
