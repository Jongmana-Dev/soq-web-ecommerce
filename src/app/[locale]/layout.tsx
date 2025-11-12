import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Prompt, Poppins } from 'next/font/google' 
import Navbar from '@/components/sections/Navbar'
import { LenisProvider } from '@/providers/SmoothScrollProvider'
import LuxuryCursor from '@/components/cursor/LuxuryCursor' 
import BackToTop from '@/components/ui/backtotop' 
import '@/app/globals.css'

const prompt = Prompt({ 
  subsets: ['latin', 'thai'], 
  weight: ['300', '400', '500', '600', '700'], 
  display: 'swap',
  variable: '--font-prompt' 
})
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['600'], 
  display: 'swap',
  variable: '--font-poppins' 
})

export default async function LocaleLayout(props: LayoutProps<'/[locale]'>) {
  const { locale } = await props.params
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* ================ FIX HERE ================ */}
      {/* เพิ่ม padding-top: 76px (h-[76px]) ให้กับ body เพื่อดันเนื้อหาลงมา */}
      <body className={`${prompt.variable} ${poppins.variable} font-prompt pt-[76px]`}>
      {/* ========================================== */}
        
        <LuxuryCursor /> 

        <ThemeProvider
          attribute="class"
          defaultTheme="dark" 
          enableSystem
        >
          <NextIntlClientProvider locale={locale}>
            <LenisProvider>
              <Navbar />
              {props.children}
              <BackToTop /> 
            </LenisProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}