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
    // NextAuth configuration
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    // Email configuration (server-side)
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    RESEND_FROM_NAME: process.env.RESEND_FROM_NAME,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    SES_REGION: process.env.SES_REGION,
    SES_ACCESS_KEY_ID: process.env.SES_ACCESS_KEY_ID,
    SES_SECRET_ACCESS_KEY: process.env.SES_SECRET_ACCESS_KEY,
    SES_FROM_EMAIL: process.env.SES_FROM_EMAIL,
    SES_FROM_NAME: process.env.SES_FROM_NAME,
  },
  experimental: {
    outputStandalone: false,
  },
}

export default nextConfig
