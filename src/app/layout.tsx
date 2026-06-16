import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MAID — Medical AI for Intelligent Drug-discovery',
  description: 'AI-powered platform for pharmacists, pharmaceutical researchers, and drug discovery teams.',
  keywords: ['drug discovery', 'AI', 'pharmaceutical', 'pharmacist', 'research', 'chemistry'],
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
