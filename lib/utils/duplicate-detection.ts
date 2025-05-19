/**
 * Utility functions for sophisticated duplicate detection
 */

// Calculate Levenshtein distance between two strings
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// Calculate string similarity as a percentage (0-100)
export function stringSimilarity(a: string, b: string): number {
  if (!a && !b) return 100
  if (!a || !b) return 0

  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  const maxLength = Math.max(a.length, b.length)

  if (maxLength === 0) return 100

  return Math.round((1 - distance / maxLength) * 100)
}

// Normalize a phone number by removing non-digit characters
export function normalizePhoneNumber(phone: string | undefined | null): string {
  if (!phone) return ""

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")

  // If it starts with country code (e.g., 91 for India), standardize it
  if (digits.length > 10 && digits.startsWith("91") && digits.length === 12) {
    return digits.substring(2)
  }

  // Return last 10 digits if longer
  return digits.length > 10 ? digits.slice(-10) : digits
}

// Generate a phonetic code for a name (simplified Soundex)
export function getPhoneticCode(name: string | undefined | null): string {
  if (!name) return ""

  const s = name.toUpperCase().replace(/[^A-Z]/g, "")
  if (!s) return ""

  // First letter remains the same
  let code = s[0]

  // Map of phonetic equivalents
  const phonetics: Record<string, string> = {
    BFPV: "1",
    CGJKQSXZ: "2",
    DT: "3",
    L: "4",
    MN: "5",
    R: "6",
  }

  let lastCode = ""

  // Convert remaining letters to phonetic codes
  for (let i = 1; i < s.length && code.length < 4; i++) {
    let found = false

    for (const key in phonetics) {
      if (key.includes(s[i])) {
        const currentCode = phonetics[key]
        // Avoid adjacent duplicates
        if (currentCode !== lastCode) {
          code += currentCode
          lastCode = currentCode
        }
        found = true
        break
      }
    }

    // Skip vowels and H, W, Y
    if (!found && !"AEIOUHWY".includes(s[i])) {
      code += "0"
      lastCode = "0"
    }
  }

  // Pad with zeros if needed
  while (code.length < 4) {
    code += "0"
  }

  return code
}

// Calculate address similarity
export function addressSimilarity(address1: any, address2: any): number {
  if (!address1 || !address2) return 0

  let score = 0
  let fields = 0

  // Compare each field if both exist
  const fieldsToCompare = ["address1", "address2", "city", "district", "pincode"]

  for (const field of fieldsToCompare) {
    if (address1[field] && address2[field]) {
      fields++
      score += stringSimilarity(address1[field], address2[field])
    }
  }

  return fields > 0 ? Math.round(score / fields) : 0
}

// Calculate a duplicate score between two member records
export function calculateDuplicateScore(
  newMember: any,
  existingMember: any,
): {
  score: number
  reasons: string[]
} {
  let score = 0
  const reasons: string[] = []

  // Email exact match (highest weight)
  if (newMember.email && existingMember.email && newMember.email.toLowerCase() === existingMember.email.toLowerCase()) {
    score += 100
    reasons.push("Email exact match")
    return { score, reasons } // Definite match, return immediately
  }

  // Mobile exact match (high weight)
  const normalizedNewMobile = normalizePhoneNumber(newMember.mobile)
  const normalizedExistingMobile = normalizePhoneNumber(existingMember.mobile)

  if (normalizedNewMobile && normalizedExistingMobile && normalizedNewMobile === normalizedExistingMobile) {
    score += 90
    reasons.push("Mobile number exact match")
    return { score, reasons } // Very likely match, return immediately
  }

  // Name similarity (medium-high weight)
  if (newMember.name && existingMember.name) {
    const nameSimilarity = stringSimilarity(newMember.name, existingMember.name)

    if (nameSimilarity >= 90) {
      score += 40
      reasons.push(`Name highly similar (${nameSimilarity}%)`)
    } else if (nameSimilarity >= 75) {
      score += 25
      reasons.push(`Name moderately similar (${nameSimilarity}%)`)
    }

    // Phonetic name match
    const newNamePhonetic = getPhoneticCode(newMember.name)
    const existingNamePhonetic = getPhoneticCode(existingMember.name)

    if (newNamePhonetic && existingNamePhonetic && newNamePhonetic === existingNamePhonetic) {
      score += 20
      reasons.push("Name sounds similar (phonetic match)")
    }
  }

  // Date of birth exact match (medium weight)
  if (newMember.dateOfBirth && existingMember.dateOfBirth) {
    const newDOB = new Date(newMember.dateOfBirth).toISOString().split("T")[0]
    const existingDOB = new Date(existingMember.dateOfBirth).toISOString().split("T")[0]

    if (newDOB === existingDOB) {
      score += 30
      reasons.push("Date of birth exact match")
    }
  }

  // Address similarity (medium weight)
  if (newMember.postal_address && existingMember.postal_address) {
    const addressSim = addressSimilarity(newMember.postal_address, existingMember.postal_address)

    if (addressSim >= 80) {
      score += 25
      reasons.push(`Postal address highly similar (${addressSim}%)`)
    } else if (addressSim >= 60) {
      score += 15
      reasons.push(`Postal address moderately similar (${addressSim}%)`)
    }
  }

  // Father's name similarity (medium-low weight)
  if (newMember.fatherName && existingMember.fatherName) {
    const fatherNameSimilarity = stringSimilarity(newMember.fatherName, existingMember.fatherName)

    if (fatherNameSimilarity >= 80) {
      score += 20
      reasons.push(`Father's name highly similar (${fatherNameSimilarity}%)`)
    }
  }

  // Membership number exact match (high weight)
  if (
    newMember.membership_no &&
    existingMember.membership_no &&
    newMember.membership_no === existingMember.membership_no
  ) {
    score += 80
    reasons.push("Membership number exact match")
  }

  return { score, reasons }
}

// Determine if a member is a duplicate based on score threshold
export function isDuplicate(score: number): boolean {
  return score >= 50 // Threshold for considering a record a duplicate
}

// Get duplicate confidence level
export function getDuplicateConfidenceLevel(score: number): "high" | "medium" | "low" {
  if (score >= 80) return "high"
  if (score >= 60) return "medium"
  return "low"
}
