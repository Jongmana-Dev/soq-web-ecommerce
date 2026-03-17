import './globals.css'
import type { Metadata } from 'next'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://soqthailand.com'

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: 'SOQ. Safe for Sip — ผลิตภัณฑ์สำหรับฆ่าเชื้อแบคทีเรียโดยไม่ต้องล้างน้ำออก',
    template: '%s | SOQ',
  },
  description:
    'SOQ. Safe for Sip — ผลิตภัณฑ์สำหรับฆ่าเชื้อแบคทีเรียโดยไม่ต้องล้างน้ำออก No-rinse antibacterial product',
  keywords: [
    'SOQ', 'Safe for Sip', 'ฆ่าเชื้อแบคทีเรีย', 'ไม่ต้องล้างน้ำออก', 'No-rinse',
    'antibacterial', 'sanitizer', 'น้ำยาฆ่าเชื้อ', 'sanitizer thailand',
  ],
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false },
  openGraph: {
    type: 'website',
    siteName: 'SOQ',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'SOQ. Safe for Sip' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
