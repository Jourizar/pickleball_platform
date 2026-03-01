import type { Metadata } from "next"
import { Barlow_Condensed, DM_Sans } from "next/font/google"
import "./globals.css"

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Nell Pickleball Club — República Dominicana",
  description: "El primer club de pickleball de República Dominicana.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${barlowCondensed.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
