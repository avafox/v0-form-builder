import type { AuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

export const authOptions: AuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
          prompt: "login", // Forces re-authentication every time
          // acr_values: "urn:microsoft:req1", // Uncomment to require MFA explicitly
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
