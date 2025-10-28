import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Prompt, Poppins } from 'next/font/google'
import Navbar from '@/components/sections/Navbar'
import { LenisProvider } from '@/providers/SmoothScrollProvider'
import '@/app/globals.css'

const prompt = Prompt({ subsets: ['latin', 'thai'], weight: ['400', '500', '600', '700'], display: 'swap' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })

export default async function LocaleLayout(props: LayoutProps<'/[locale]'>) {
  const { locale } = await props.params
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* รวมฟอนต์ไว้ที่ body เดียว กัน class mismatch ตอน hydrate */}
      <body className={`${prompt.className} ${poppins.className}`}>
        {/* ล็อคเป็น light กันธีมค้าง + กันพื้นดำ */}
        <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
          <NextIntlClientProvider locale={locale}>
            <LenisProvider>
              <Navbar />
              {props.children}
            </LenisProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
