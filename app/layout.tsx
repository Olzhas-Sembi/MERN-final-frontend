import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers/providers"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Spark - Найди свою пару",
  description: "Современное приложение для знакомств с чатом в реальном времени, свайпами и социальными функциями",
}

export const viewport: Viewport = {
  themeColor: "#e879a9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Navigation />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
