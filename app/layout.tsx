import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans, Heebo } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-cormorant', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const heebo = Heebo({ subsets: ['hebrew', 'latin'], variable: '--font-heebo', display: 'swap' })

export const viewport: Viewport = {
  themeColor: '#dc9229',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: { default: 'SimchaLink - ניהול אירועים חכם', template: '%s | SimchaLink' },
  description: 'פלטפורמה מתקדמת לניהול חתונות ואירועים',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'MarryME' },
  icons: { icon: '/favicon.svg', apple: '/icon-192.png' },
  openGraph: { type: 'website', locale: 'he_IL', title: 'SimchaLink', description: 'כל הכלים לחתונה המושלמת' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${cormorant.variable} ${dmSans.variable} ${heebo.variable} font-hebrew antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'var(--font-heebo)', direction: 'rtl',
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
