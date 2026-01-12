import type { AuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

if (!process.env.MICROSOFT_CLIENT_ID) {
  console.error("[Auth] Missing MICROSOFT_CLIENT_ID environment variable")
}
if (!process.env.MICROSOFT_CLIENT_SECRET) {
  console.error("[Auth] Missing MICROSOFT_CLIENT_SECRET environment variable")
}
if (!process.env.MICROSOFT_TENANT_ID) {
  console.error("[Auth] Missing MICROSOFT_TENANT_ID environment variable")
}
if (!process.env.NEXTAUTH_SECRET) {
  console.error("[Auth] Missing NEXTAUTH_SECRET environment variable")
}

export const authOptions: AuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      tenantId: process.env.MICROSOFT_TENANT_ID || "",
      authorization: {
        params: {
          scope: "openid profile email User.Read",
          prompt: "login",
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
        console.warn("[Auth] Sign in blocked - no email provided")
        return false
      }

      // Only allow @sky.uk domain
      if (!email.endsWith("@sky.uk")) {
        console.warn(`[Auth] Sign in blocked - unauthorized domain: ${email}`)
        return false
      }

      console.log(`[Auth] Sign in successful: ${email}`)
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "development" ? "dev-secret-change-in-production" : undefined),
  debug: true, // Enable debug for troubleshooting
}
