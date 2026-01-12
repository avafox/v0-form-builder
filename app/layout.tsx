import type React from "react"
import { SessionProvider } from "next-auth/react"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: "GPE Communications Builder",
  description: "Create and send professional communications for Sky UK",
  generator: "v0.app",
}
