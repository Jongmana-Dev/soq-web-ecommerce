import './globals.css'
import type { Metadata } from 'next'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://soqthailand.com'

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: 'SOQ — Premium Brewing Sanitizer',
    template: '%s | SOQ',
  },
  description:
    'SOQ Star San Sanitizer — น้ำยาทำความสะอาดระดับพรีเมียมสำหรับอุตสาหกรรม Brewing ปลอดภัย ไร้สารตกค้าง',
  keywords: [
    'SOQ', 'Star San', 'Sanitizer', 'Brewing', 'น้ำยาทำความสะอาด',
    'โรงเบียร์คราฟต์', 'craft brewery', 'food safety', 'sanitizer thailand',
  ],
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false },
  openGraph: {
    type: 'website',
    siteName: 'SOQ',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'SOQ Star San Sanitizer' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
