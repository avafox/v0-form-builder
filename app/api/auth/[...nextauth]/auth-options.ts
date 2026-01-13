import type { AuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import { checkUserAccess } from "@/lib/access-control"
import crypto from "crypto"

function getOrGenerateSecret(): string {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET
  }

  // Generate a deterministic secret based on other env vars
  // This ensures the same secret across Lambda invocations
  const seed = [
    process.env.MICROSOFT_CLIENT_ID || "",
    process.env.MICROSOFT_CLIENT_SECRET || "",
    process.env.MICROSOFT_TENANT_ID || "",
    "form-builder-nextauth-fallback-secret",
  ].join("-")

  return crypto.createHash("sha256").update(seed).digest("hex")
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
      const email =
        user.email || (profile as any)?.email || (profile as any)?.preferred_username || (profile as any)?.upn

      if (!email) {
        return "/auth/error?error=AccessDenied"
      }

      const hasAccess = checkUserAccess(email)

      if (!hasAccess) {
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
    maxAge: 8 * 60 * 60,
  },
  secret: getOrGenerateSecret(),
  debug: false,
}
