import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: { default: 'Luna&Beeds – Handmade šperky & naramky', template: '%s | Luna&Beeds' },
  description: 'Luxusné handmade šperky, naramky a doplnky. Vytvorte si vlastný naramok na mieru.',
  keywords: ['naramky', 'sperky', 'handmade', 'custom naramok', 'koralky'],
  openGraph: {
    title: 'Luna&Beeds',
    description: 'Luxusné handmade šperky & naramky',
    siteName: 'Luna&Beeds',
    locale: 'sk_SK',
    type: 'website',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '16px', background: '#fff', color: '#1f2937', boxShadow: '0 4px 30px rgba(194,24,91,0.12)' },
            success: { iconTheme: { primary: '#C2185B', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
