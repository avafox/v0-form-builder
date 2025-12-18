import type { AuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

const validateEnvVars = () => {
  const required = {
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    console.error("[v0] Missing NextAuth environment variables:", missing)
    return false
  }

  console.log("[v0] All NextAuth environment variables present")
  return true
}

validateEnvVars()

export const authOptions: AuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      try {
        if (account) {
          token.accessToken = account.access_token
          token.idToken = account.id_token
        }
        if (profile) {
          token.email = profile.email
          token.name = profile.name
        }
        return token
      } catch (error) {
        console.error("[v0] Error in JWT callback:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        session.accessToken = token.accessToken as string
        session.idToken = token.idToken as string
        if (token.email) {
          session.user.email = token.email as string
        }
        if (token.name) {
          session.user.name = token.name as string
        }
        return session
      } catch (error) {
        console.error("[v0] Error in session callback:", error)
        return session
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enabled debug mode to see detailed logs
}
