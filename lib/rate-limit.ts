import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Check if Redis is properly configured with a valid URL
const isRedisConfigured = 
  process.env.KV_REST_API_URL && 
  process.env.KV_REST_API_TOKEN &&
  process.env.KV_REST_API_URL.startsWith("https://")

// Create Redis client only if properly configured
const redis = isRedisConfigured 
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null

// Fallback rate limiter that always allows requests when Redis is not configured
const createFallbackLimiter = () => ({
  limit: async (_identifier: string) => ({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000,
  }),
})

// Rate limiter for API routes - 20 requests per 10 seconds
export const apiRateLimiter = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
      prefix: "ratelimit:api",
    })
  : createFallbackLimiter()

// Rate limiter for auth routes - 5 attempts per minute (prevent brute force)
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : createFallbackLimiter()

// Rate limiter for email sending - 10 emails per minute
export const emailRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "ratelimit:email",
    })
  : createFallbackLimiter()

// Log warning if Redis is not configured
if (!isRedisConfigured) {
  console.warn("[v0] Rate limiting is disabled - KV_REST_API_URL is not properly configured. Set a valid Upstash Redis URL to enable rate limiting.")
}

// Helper to get client IP
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  return request.headers.get("x-real-ip") || "unknown"
}
