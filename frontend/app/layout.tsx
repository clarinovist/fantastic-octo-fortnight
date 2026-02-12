import type { Metadata } from "next"
import { Geist_Mono, Gochi_Hand, Lato } from "next/font/google"
import "./globals.css"

const gochiHand = Gochi_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gochi-hand",
})

const lato = Lato({
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Les Private",
  description: "Learn from the best tutors around you",
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${geistMono.variable} ${gochiHand.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
