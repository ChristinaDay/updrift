import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ThemedBody from '@/components/ThemedBody';

export const metadata: Metadata = {
  title: 'Updrift - Superior Job Search',
  description: 'The intelligent job search platform that outperforms LinkedIn. Find your dream job with AI-powered matching, multi-platform aggregation, and advanced analytics.',
  keywords: 'job search, careers, employment, job board, LinkedIn alternative, job finder, career opportunities',
  authors: [{ name: 'Updrift Team' }],
  creator: 'Updrift',
  publisher: 'Updrift',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://updrift.me'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://updrift.me',
    title: 'Updrift - Superior Job Search',
    description: 'The intelligent job search platform that outperforms LinkedIn. Find your dream job with AI-powered matching, multi-platform aggregation, and advanced analytics.',
    siteName: 'Updrift',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Updrift - Superior Job Search',
    description: 'The intelligent job search platform that outperforms LinkedIn. Find your dream job with AI-powered matching, multi-platform aggregation, and advanced analytics.',
    creator: '@updrift',
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