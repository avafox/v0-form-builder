// This file provides runtime configuration for NextAuth and Azure AD
// In production (Amplify), this file is auto-generated during build with environment variables baked in
// In development, it reads from process.env

export const runtimeConfig = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID || "",
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET || "",
  MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID || "",
}
