export const dynamic = "force-dynamic"

export async function GET() {
  console.log("[v0] Checking ALL environment variables")

  // Get all env vars that start with NEXT or MICROSOFT
  const allEnvVars = Object.keys(process.env).filter(
    (key) => key.startsWith("NEXT") || key.startsWith("MICROSOFT") || key.startsWith("SES"),
  )

  const envStatus = allEnvVars.reduce(
    (acc, key) => {
      const value = process.env[key]
      acc[key] = {
        exists: !!value,
        length: value?.length || 0,
        firstChars: value?.substring(0, 10) || "N/A",
      }
      return acc
    },
    {} as Record<string, any>,
  )

  console.log("[v0] All environment variables:", envStatus)

  return Response.json({
    message: "All environment variables matching NEXT*, MICROSOFT*, SES*",
    variables: envStatus,
    totalFound: allEnvVars.length,
  })
}
