import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Rubik } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400','500','600','700','800','900'], variable: '--font-playfair', display: 'swap' })
const rubik = Rubik({ subsets: ['hebrew', 'latin'], weight: ['300','400','500','600','700','800','900'], variable: '--font-rubik', display: 'swap' })

export const viewport: Viewport = {
  themeColor: '#dc9229',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: { default: 'MarryME - ניהול אירועים חכם', template: '%s | MarryME' },
  description: 'פלטפורמה מתקדמת לניהול חתונות ואירועים',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'MarryME' },
  icons: { icon: '/favicon.svg', apple: '/icon-192.png' },
  openGraph: { type: 'website', locale: 'he_IL', title: 'MarryME', description: 'כל הכלים לחתונה המושלמת' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${playfair.variable} ${rubik.variable} font-hebrew antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'var(--font-rubik)', direction: 'rtl',
              background: '#1a0f0a', color: '#faf8f5',
              border: '1px solid rgba(220,146,41,0.3)', borderRadius: '16px', padding: '12px 20px',
            },
            success: { iconTheme: { primary: '#548150', secondary: '#faf8f5' } },
            error: { iconTheme: { primary: '#e85555', secondary: '#faf8f5' } },
          }}
        />
      </body>
    </html>
  )
}
