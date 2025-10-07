// Access control configuration for group-based permissions

// List of Azure AD group IDs that are allowed to access the application
// Replace these with your actual group IDs from Azure AD
export const ALLOWED_GROUPS = [
  "a50fe9e4-09e6-48d0-95ae-2352eff997ba", // GPE-Communications-Team
  // Add more group IDs here as needed:
  // 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', // GPE-Managers
  // 'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', // IT-Admins
]

// Check if user has access based on their group memberships
export function checkUserAccess(userGroups: string[]): boolean {
  // If no groups are configured, deny access by default
  if (ALLOWED_GROUPS.length === 0) {
    console.warn("[v0] No allowed groups configured. Access denied by default.")
    return false
  }

  // Check if user is in any of the allowed groups
  return userGroups.some((groupId) => ALLOWED_GROUPS.includes(groupId))
}

// Get user-friendly error message for access denial
export function getAccessDenialReason(userGroups: string[]): string {
  if (ALLOWED_GROUPS.length === 0) {
    return "No access groups have been configured for this application."
  }

  if (userGroups.length === 0) {
    return "You are not a member of any groups. Please contact your administrator."
  }

  return "You do not have permission to access this application. Please contact your administrator if you believe this is an error."
}
