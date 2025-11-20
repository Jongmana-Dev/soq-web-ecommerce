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
      <head>
        {/* ================ FIX HERE ================ */}
        {/* เพิ่ม CDN link สำหรับ Font Awesome Icons */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        {/* ========================================== */}
      </head>
      {/* แก้ไข: ยืนยันว่า body มี pt-[76px] */}
      <body className={`${prompt.variable} ${poppins.variable} font-prompt pt-[76px]`}>
        
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