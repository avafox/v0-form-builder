import type { AuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import { checkUserAccess } from "@/lib/access-control"

export const authOptions: AuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      tenantId: process.env.MICROSOFT_TENANT_ID || "",
      authorization: {
        params: {
          scope: "openid profile email User.Read",
          prompt: "login", // Forces MFA re-authentication on every sign-in
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
      const email =
        user.email || (profile as any)?.email || (profile as any)?.preferred_username || (profile as any)?.upn

      if (!email) {
        console.log("[v0] Sign-in failed: No email found in profile")
        return "/auth/error?error=AccessDenied"
      }

      const hasAccess = checkUserAccess(email)

      if (!hasAccess) {
        console.log("[v0] Sign-in failed: Email not in allowed domains:", email)
        return "/auth/error?error=AccessDenied"
      }

      console.log("[v0] Sign-in successful for:", email)
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
  secret: process.env.NEXTAUTH_SECRET || "development-secret-please-change-in-production",
  debug: process.env.NODE_ENV === "development",
}
