import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Prompt, Poppins } from 'next/font/google'
import Navbar from '@/components/sections/Navbar'
import { LenisProvider } from '@/providers/SmoothScrollProvider'
import '@/app/globals.css'

const prompt = Prompt({ subsets: ['latin', 'thai'], weight: ['400', '500', '600', '700'] })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export default async function LocaleLayout(props: LayoutProps<'/[locale]'>) {
  const { locale } = await props.params
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${prompt.className} ${poppins.className} bg-[var(--background)] text-[var(--foreground)]`}>
        <ThemeProvider attribute="class">
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
