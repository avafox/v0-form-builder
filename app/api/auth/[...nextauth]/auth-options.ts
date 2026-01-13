import type { AuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import { checkUserAccess } from "@/lib/access-control"

// Environment variables are loaded at runtime by Amplify, not at build time
export const authOptions: AuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      tenantId: process.env.MICROSOFT_TENANT_ID || "",
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
      console.log("[v0] SignIn callback triggered")
      console.log("[v0] User:", JSON.stringify(user, null, 2))
      console.log("[v0] Profile:", JSON.stringify(profile, null, 2))

      // Try to get email from multiple sources
      const email =
        user.email || (profile as any)?.email || (profile as any)?.preferred_username || (profile as any)?.upn

      console.log("[v0] Extracted email:", email)

      if (!email) {
        console.error("[v0] No email found in user or profile")
        return "/auth/error?error=AccessDenied"
      }

      if (!checkUserAccess(email)) {
        console.error("[v0] Access denied for email:", email)
        return "/auth/error?error=AccessDenied"
      }

      console.log("[v0] Email validation passed for:", email)
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enabled debug mode to troubleshoot
}
