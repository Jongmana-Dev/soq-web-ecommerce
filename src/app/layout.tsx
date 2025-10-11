import type {Metadata} from 'next'
import './globals.css'
import {Plus_Jakarta_Sans, Playfair_Display} from 'next/font/google'
import {ThemeProvider} from '@/components/site/theme-provider'
import SmoothScrollProvider  from '@/providers/SmoothScrollProvider'
import  TransitionOverlay from '@/components/site/TransitionOverlay'
import LuxuryCursor from '@/components/cursor/LuxuryCursor'

const sans = Plus_Jakarta_Sans({subsets: ['latin'], variable: '--font-sans'})
const display = Playfair_Display({subsets: ['latin'], variable: '--font-display'})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'),
  title: { default: 'SOQ — Luxury Brewing Care', template: '%s | SOQ' },
  description: 'Premium cleaners and sanitizers for craft beer equipment.',
  alternates: { canonical: '/', languages: { th: '/th', en: '/en' } }
}

export default function RootLayout(props: {children: React.ReactNode}) {
  return (
    <html lang="th" className="dark" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
           <TransitionOverlay />
           <LuxuryCursor />
          <SmoothScrollProvider>{props.children}</SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
