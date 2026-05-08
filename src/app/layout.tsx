import type { Metadata } from 'next'
import { Amiri, Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-amiri',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mizan • ميزان',
  description: 'Find the Quran verse that speaks to your moment.',
  icons: { icon: '/images/mizan-logo.png' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0e2d2a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${amiri.variable} ${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
