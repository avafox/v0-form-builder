// Access control configuration for email-based permissions

// Allowed email domains (e.g., only @sky.uk users)
export const ALLOWED_DOMAINS = [
  "sky.uk",
  "3dflyingmonsters.co.uk", // Added test domain for Azure test user
  // Add more domains here as needed:
  // "partner-company.com",
]

// Specific email addresses that are always allowed (whitelist)
export const ALLOWED_EMAILS = [
  "ava.foxwell@sky.uk",
  // Add more specific emails here as needed:
  // "john.doe@sky.uk",
  // "jane.smith@sky.uk",
]

// Check if user has access based on their email
export function checkUserAccess(email: string | null | undefined): boolean {
  if (!email) {
    console.warn("[v0] No email provided. Access denied.")
    return false
  }

  // Check if email is in the whitelist
  if (ALLOWED_EMAILS.includes(email.toLowerCase())) {
    console.log("[v0] User allowed via whitelist:", email)
    return true
  }

  // Check if email domain is allowed
  const emailDomain = email.split("@")[1]?.toLowerCase()
  if (emailDomain && ALLOWED_DOMAINS.includes(emailDomain)) {
    console.log("[v0] User allowed via domain:", emailDomain)
    return true
  }

  console.warn("[v0] Access denied for email:", email)
  return false
}

// Get user-friendly error message for access denial
export function getAccessDenialReason(email: string | null | undefined): string {
  if (!email) {
    return "No email address found in your account."
  }

  const emailDomain = email.split("@")[1]?.toLowerCase()

  return `Access restricted. Only ${ALLOWED_DOMAINS.join(", ")} email addresses are allowed. Your email (${emailDomain}) is not authorized. Please contact your administrator.`
}
