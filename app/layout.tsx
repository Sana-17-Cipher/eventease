import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/navbar"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "EventEase - College Fest Management",
  description: "Modern event management system for college festivals",
  generator: "EventEase",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <head>
        <style>{`
          html {
            font-family: ${dmSans.style.fontFamily};
            --font-sans: ${dmSans.variable};
            --font-serif: ${spaceGrotesk.variable};
          }
        `}</style>
      </head>
      <body 
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning={true}
      >
        <Navbar />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}