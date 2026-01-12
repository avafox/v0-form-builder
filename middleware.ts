import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Optional: Define allowed IP ranges for Sky UK offices
const ALLOWED_IP_RANGES = process.env.ALLOWED_IP_RANGES?.split(",").map((ip) => ip.trim()) || []
const IP_RESTRICTION_ENABLED = process.env.ENABLE_IP_RESTRICTION === "true"

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  return request.headers.get("x-real-ip") || "unknown"
}

// Simple IP range check (supports exact IP or CIDR notation)
function isIPAllowed(clientIP: string, allowedRanges: string[]): boolean {
  if (allowedRanges.length === 0) return true

  for (const range of allowedRanges) {
    if (range.includes("/")) {
      const [network, bits] = range.split("/")
      const mask = Number.parseInt(bits, 10)
      if (ipMatchesCIDR(clientIP, network, mask)) {
        return true
      }
    } else {
      if (clientIP === range) {
        return true
      }
    }
  }
  return false
}

// Simplified CIDR matching for IPv4
function ipMatchesCIDR(ip: string, network: string, mask: number): boolean {
  try {
    const ipParts = ip.split(".").map(Number)
    const networkParts = network.split(".").map(Number)

    if (ipParts.length !== 4 || networkParts.length !== 4) return false

    const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]
    const networkNum = (networkParts[0] << 24) | (networkParts[1] << 16) | (networkParts[2] << 8) | networkParts[3]
    const maskNum = ~((1 << (32 - mask)) - 1)

    return (ipNum & maskNum) === (networkNum & maskNum)
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const clientIP = getClientIP(request)
  const pathname = request.nextUrl.pathname

  // Check if route requires authentication
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth")

  if (!isPublicPath) {
    // Check for valid session token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      // No valid session - redirect to sign in
      const url = new URL("/auth/signin", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Validate email domain
    const email = token.email as string | undefined
    if (!email || !email.endsWith("@sky.uk")) {
      console.warn(`[Security] Blocked unauthorized email domain: ${email}`)
      const url = new URL("/auth/error", request.url)
      url.searchParams.set("error", "AccessDenied")
      return NextResponse.redirect(url)
    }

    console.log(`[Auth] Authenticated request: ${email} → ${pathname}`)
  }

  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")

  // IP restriction check
  if (IP_RESTRICTION_ENABLED && ALLOWED_IP_RANGES.length > 0) {
    if (!isIPAllowed(clientIP, ALLOWED_IP_RANGES)) {
      console.warn(`[Security] Blocked request from unauthorized IP: ${clientIP}`)
      return new NextResponse("Access Denied", { status: 403 })
    }
  }

  // Block suspicious paths
  const blockedPatterns = ["/wp-admin", "/wp-login", "/.env", "/phpinfo", "/admin.php", "/.git", "/config.php"]

  if (blockedPatterns.some((pattern) => pathname.toLowerCase().includes(pattern))) {
    console.warn(`[Security] Blocked suspicious request: ${pathname} from ${clientIP}`)
    return new NextResponse("Not Found", { status: 404 })
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
