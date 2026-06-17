import type { Metadata, Viewport } from 'next'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://maid.ai'
const TITLE   = 'MAID — Medical AI for Intelligent Drug-discovery'
const DESC    = 'AI-powered pharmaceutical research platform. Search drug databases, analyze molecules, check interactions, explore clinical trials, and generate detailed research reports — all in one chat.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: '%s | MAID',
  },
  description: DESC,
  keywords: [
    'drug discovery', 'pharmaceutical AI', 'drug interactions', 'clinical trials',
    'molecule analysis', 'PubChem', 'ChEMBL', 'pharmacology AI', 'ADMET',
    'drug research', 'medical AI', 'Lipinski rule of five', 'protein analysis',
    'FDA drug database', 'biomedical research assistant',
  ],
  authors: [{ name: 'MAID' }],
  creator: 'MAID',
  publisher: 'MAID',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'MAID',
    title: TITLE,
    description: DESC,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MAID — Medical AI for Intelligent Drug-discovery' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: ['/og-image.png'],
    creator: '@maid_ai',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  alternates: { canonical: APP_URL },
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'MAID',
            description: DESC,
            url: APP_URL,
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          })}}
        />
      </head>
      <body style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
