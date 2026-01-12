import type { AuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

const clientId = process.env.MICROSOFT_CLIENT_ID
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
const tenantId = process.env.MICROSOFT_TENANT_ID
const nextAuthSecret = process.env.NEXTAUTH_SECRET

// Only create config if we have valid credentials
if (!clientId || !clientSecret || !tenantId || !nextAuthSecret) {
  console.error("[v0] Missing required NextAuth environment variables")
  console.error("[v0] This will cause CLIENT_FETCH_ERROR on the client side")
}

export const authOptions: AuthOptions = {
  providers: [
    AzureADProvider({
      clientId: clientId || "",
      clientSecret: clientSecret || "",
      tenantId: tenantId || "",
      authorization: {
        params: {
          scope: "openid profile email User.Read",
          prompt: "login", // Forces re-authentication and triggers MFA
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
      }
      if (profile) {
        token.email = profile.email
        token.name = profile.name
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.idToken = token.idToken as string
      if (token.email) {
        session.user.email = token.email as string
      }
      if (token.name) {
        session.user.name = token.name as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      const email = user.email || (profile as any)?.email

      if (!email) {
        return false
      }

      if (!email.toLowerCase().endsWith("@sky.uk")) {
        return "/auth/error?error=AccessDenied"
      }

      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: nextAuthSecret,
  debug: process.env.NODE_ENV === "development",
}
