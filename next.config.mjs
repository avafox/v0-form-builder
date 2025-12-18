/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    SES_REGION: process.env.SES_REGION,
    SES_ACCESS_KEY_ID: process.env.SES_ACCESS_KEY_ID,
    SES_SECRET_ACCESS_KEY: process.env.SES_SECRET_ACCESS_KEY,
    SES_FROM_EMAIL: process.env.SES_FROM_EMAIL,
    SES_FROM_NAME: process.env.SES_FROM_NAME,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
  },
}

export default nextConfig
