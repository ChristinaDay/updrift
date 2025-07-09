import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionWrapper from '@/components/SessionWrapper'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ThemedBody from '@/components/ThemedBody';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UpFetch - Superior Job Search',
  description: 'The intelligent job search platform that outperforms LinkedIn. Find your dream job with AI-powered matching, multi-platform aggregation, and advanced analytics.',
  keywords: 'job search, careers, employment, job board, LinkedIn alternative, job finder, career opportunities',
  authors: [{ name: 'UpFetch Team' }],
  creator: 'UpFetch',
  publisher: 'UpFetch',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://upfetch.me'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://upfetch.me',
    title: 'UpFetch - Superior Job Search',
    description: 'The intelligent job search platform that outperforms LinkedIn. Find your dream job with AI-powered matching, multi-platform aggregation, and advanced analytics.',
    siteName: 'UpFetch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UpFetch - Superior Job Search',
    description: 'The intelligent job search platform that outperforms LinkedIn. Find your dream job with AI-powered matching, multi-platform aggregation, and advanced analytics.',
    creator: '@upfetch',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <ThemeProvider>
        <ThemedBody>{children}</ThemedBody>
      </ThemeProvider>
    </html>
  )
} 